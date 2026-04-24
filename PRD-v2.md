# TodoBoard v2.0 — 集团项目管理平台 产品方案

## 定位

**以 AI 对话为主要交互界面的集团项目管理工具。**

传统项目管理系统让人去学页面、找按钮、填表单。我们反过来：让 OpenClaw 做中间人，用户说人话，AI 操作系统。看板/列表只是"看结果"的地方，不是"做事情"的地方。

## 核心理念

```
传统模式：人 → 管理页面 → 系统
我们的模式：人 → OpenClaw（对话）→ 系统 → 结果（看板/通知/报告）
```

- **操作层**：OpenClaw Skill 接管 90% 的 CRUD 操作
- **展示层**：保留看板/列表/仪表盘，但只做只读展示 + 少量交互
- **管理层**：不建传统管理后台，管理操作全部走对话

## 用户故事

| 场景 | 传统方式 | 我们的方式 |
|------|---------|-----------|
| 创建项目 | 找到"新建项目"按钮 → 填表单 → 保存 | 跟 AI 说："建个项目叫 Q2 营销活动，把市场部的人都加进去" |
| 分配任务 | 打开项目 → 找任务 → 编辑 → 选人 → 保存 | "把写方案这个任务分给小王" |
| 查进度 | 进项目 → 看看板 → 统计 | "Q2 营销活动进度怎么样？" 或者打开看板直接看 |
| 管成员 | 成员管理页 → 搜索 → 编辑 | "把小李从技术部调到产品部" |
| 看全局 | 无（需要逐个项目看） | "集团现在有多少个项目在跑？哪些任务过期了？" |
| 开会 | 发邮件约时间 → 抢会议室 → 开完没结论 | "这事要不要开个会？" → AI 判断 → 自动发起 → 生成纪要 |

## 技术选型（3000 人规模）

| 组件 | 选择 | 理由 |
|------|------|------|
| **数据库** | **MySQL 8.0** | 3000 人 + 多项目 + 权限查询，SQLite 的并发和 JOIN 性能不够 |
| **ORM** | **Prisma** | 类型安全，schema 管理，迁移方便 |
| **后端** | Express（不变） | 够用 |
| **前端** | Vanilla（不变） | 看板部分保持轻量 |
| **认证** | **JWT + bcrypt** | 3000 人必须有登录系统 |
| **实时** | **Socket.io** | 任务变更实时推送到看板 |

### 为什么弃 SQLite

```
SQLite 问题（3000 人场景）：
- 写锁：多人同时更新任务会排队
- 无用户系统：没有原生的认证/权限支持
- JOIN 性能：组织架构查询（部门→成员→项目→任务）多表 JOIN 慢
- 运维：不好做备份、监控、主从

MySQL 优势：
- 行级锁，并发写入无压力
- 成熟的用户/权限体系
- 复杂查询优化器
- 运维工具丰富
```

## 数据模型

```
集团 (Organization)
├── 部门 (Department) ← 多级树
│   └── 成员 (Member)
├── 项目 (Project)
│   ├── 项目成员 (ProjectMember) ← 带角色
│   ├── 任务 (Task) ← 带指派
│   │   └── 评论 (Comment)
│   └── 会议 (Meeting) ← AI 判断 + 发起
│       ├── 参会人 (MeetingAttendee)
│       └── 会议纪要 (MeetingMinutes)
└── 角色权限 (Role + Permission)
```

### 表结构

```sql
-- 集团
CREATE TABLE organizations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT NOW()
);

-- 部门（支持多级）
CREATE TABLE departments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  name VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  INDEX idx_org_parent (org_id, parent_id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (parent_id) REFERENCES departments(id)
);

-- 成员
CREATE TABLE members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  dept_id BIGINT NULL,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),     -- bcrypt
  avatar VARCHAR(255),
  org_role ENUM('admin','dept_lead','member') DEFAULT 'member',
  status ENUM('active','disabled') DEFAULT 'active',
  last_login_at DATETIME,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_org_dept (org_id, dept_id),
  INDEX idx_email (email),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- 项目
CREATE TABLE projects (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('active','archived','paused') DEFAULT 'active',
  created_by BIGINT,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_org_status (org_id, status),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (created_by) REFERENCES members(id)
);

-- 项目成员
CREATE TABLE project_members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  member_id BIGINT NOT NULL,
  role ENUM('pm','developer','viewer') DEFAULT 'developer',
  joined_at DATETIME DEFAULT NOW(),
  UNIQUE KEY uk_project_member (project_id, member_id),
  INDEX idx_member (member_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 任务
CREATE TABLE tasks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  notes TEXT,
  column_name ENUM('todo','doing','done') DEFAULT 'todo',
  priority ENUM('high','normal','low') DEFAULT 'normal',
  category VARCHAR(50),
  tags VARCHAR(200),
  assignee_id BIGINT NULL,
  created_by BIGINT,
  due_date DATE,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  started_at DATETIME,
  completed_at DATETIME,
  INDEX idx_project_col (project_id, column_name),
  INDEX idx_assignee (assignee_id),
  INDEX idx_due (due_date),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assignee_id) REFERENCES members(id),
  FOREIGN KEY (created_by) REFERENCES members(id)
);

-- 评论
CREATE TABLE comments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT NOT NULL,
  member_id BIGINT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_task (task_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 会议室
CREATE TABLE meeting_rooms (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  capacity INT DEFAULT 10,
  wecom_room_id VARCHAR(100),         -- 企微会议室 ID
  equipment VARCHAR(200),              -- 设备（投影/白板/视频）
  status ENUM('available','maintenance') DEFAULT 'available',
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

-- 会议
CREATE TABLE meetings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  project_id BIGINT NULL,              -- 关联项目（可选）
  title VARCHAR(200) NOT NULL,
  purpose TEXT NOT NULL,               -- 会议目的（必须填写）
  agenda JSON,                         -- 议题列表 [{topic, duration_min, presenter}]
  status ENUM('proposed','confirmed','ongoing','completed','cancelled') DEFAULT 'proposed',
  meeting_type ENUM('decision','discussion','sync','review') NOT NULL,
  -- decision: 拍板决策 / discussion: 讨论对齐 / sync: 信息同步 / review: 评审
  scheduled_at DATETIME,               -- 计划时间
  duration_min INT DEFAULT 30,          -- 预计时长（分钟）
  room_id BIGINT NULL,                 -- 会议室
  wecom_meeting_id VARCHAR(100),       -- 企微会议 ID
  created_by BIGINT NOT NULL,
  ai_suggestion TEXT,                  -- AI 对会议的建议（是否必要、议题优化）
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_org_project (org_id, project_id),
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_at),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES members(id)
);

-- 会议参会人
CREATE TABLE meeting_attendees (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT NOT NULL,
  member_id BIGINT NOT NULL,
  role ENUM('organizer','required','optional') DEFAULT 'required',
  rsvp ENUM('pending','accepted','declined','tentative') DEFAULT 'pending',
  UNIQUE KEY uk_meeting_member (meeting_id, member_id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 会议纪要
CREATE TABLE meeting_minutes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT NOT NULL UNIQUE,
  content TEXT,                        -- 纪要正文（Markdown）
  decisions JSON,                      -- 决议事项 [{decision, owner, deadline}]
  action_items JSON,                   -- 待办事项 [{task, assignee_id, due_date}]
  generated_by_ai BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);
```

## 会议管理模块

### 核心理念：AI 判断 → 精准开会

```
发起意图 → AI 判断 → 创建会议 → 预订会议室 → 开会 → 会议纪要 → 关联任务
   │           │           │           │          │         │          │
 "这事要    "不需要开会，   填好目的    接企微      实际      AI 生成     会议结论
  讨论下"    发条消息就行"   议题/时长   接口订房    开会      纪要草稿    转为任务
```

### AI 判断逻辑（Skill 内置）

用户说"这个事要不要开会讨论一下"时，AI 会评估：

**不需要开会（发消息/文档就行）：**
- 单向通知类（"下周上线日期改了"）
- 简单确认类（"这个方案行不行" → 发文档让人批注）
- 信息同步类（"进度更新一下" → 看看板就行）
- 已有结论类（"就这么定了" → 直接执行）

**需要开会：**
- 需要多人实时讨论、有分歧要对齐
- 涉及跨部门协调
- 需要做决策（拍板类）
- 复杂问题需要头脑风暴

AI 拒绝开会时会说：
> "这个事不需要开会，我帮你发条消息给相关人就行。要开的话告诉我具体要讨论什么。"

### Skill: `todo-board-meeting` — 会议管理

```
触发词：开会、会议、讨论一下、要不要开会

核心流程：

1. 发起判断
   用户："Q2 营销方案要不要开个会讨论一下？"
   AI：评估后回复 →
     ✅ "有必要，涉及市场部和产品部对齐。我帮你建个会：
        目的：对齐 Q2 营销方案方向和资源分配
        建议参会：市场部小王、产品部小李、技术部小张
        预计时长：45 分钟
        要发吗？"
     ❌ "不需要开会，这个事发条消息让小王确认就行。"

2. 创建会议
   用户："发吧，明天下午 2 点"
   AI：
     - 创建会议记录
     - 填写目的/议题/参会人
     - 调企微接口预订会议室
     - 发送会议邀请给参会人
     - 返回确认信息

3. 会后纪要
   用户："会开完了，帮我整理一下"
   AI：
     - 根据会议主题生成纪要草稿
     - 提取决议事项和待办
     - 待办自动转为项目任务
     - 纪要存档

4. 会议查询
   - "这周有什么会？" → 列出本周会议
   - "Q2 营销开过几次会了？" → 按项目查会议历史
   - "上次会的决议执行了吗？" → 查决议对应的待办状态

企微集成：
- POST /wecom/book-room  → 预订会议室
- POST /wecom/meeting     → 创建企微会议
- GET  /wecom/rooms       → 查询可用会议室
```

### 会议与项目的关系

```
项目 A
├── 看板（任务）
├── 成员
└── 会议
    ├── 周一对齐会（每周，sync）
    ├── 方案评审会（一次，review）
    └── 上线决策会（一次，decision）

每个会议的决议 → 自动生成待办 → 回到看板
```

### 为什么这样设计

| 痛点 | 传统方式 | 我们的方式 |
|------|---------|----------|
| 乱开会 | 谁都能发，没人判断 | AI 先评估，过滤无效会议 |
| 会议没目的 | 标题写"讨论一下"，没议程 | 必须填 purpose，AI 帮补全 agenda |
| 开完没结论 | 会议纪要写不写随缘 | AI 生成纪要，决议自动转待办 |
| 会议室冲突 | 手动查日历、抢房间 | 企微接口自动预订 |
| 不知道开了什么会 | 会议记录散落各处 | 按项目归档，可追溯 |

## OpenClaw Skill 体系（核心差异化）

这不是"顺便加个 Skill"，而是 **Skill 是主要操作界面**。

### Skill: `todo-board-admin` — 集团管理

```
触发词：项目管理、团队管理、组织架构、成员管理

能力：
- "建个项目叫 XXX" → POST /api/projects
- "把小王加到 Q2 营销项目" → POST /api/projects/:id/members
- "小李调到产品部" → PUT /api/members/:id
- "集团现在什么情况？" → GET /api/dashboard
- "Q2 营销进度怎么样？" → GET /api/projects/:id/progress
- "哪些任务过期了？" → GET /api/tasks?overdue=true
- "把写方案分给小王" → PUT /api/tasks/:id {assignee_id}
- "归档 Q1 项目" → PUT /api/projects/:id {status: archived}
```

### Skill: `todo-board-notify` — 通知提醒

```
能力：
- 每日过期任务提醒（cron）
- 任务被分配时通知当事人
- 项目进度周报（cron，每周一）
- @某人 时推送消息

通知渠道：飞书 / OpenClaw 消息
```

### Skill: `todo-board-report` — 报告生成

```
能力：
- "出一份集团项目周报" → 聚合所有项目进度
- "技术部这个月完成了多少任务" → 按部门统计
- "小王手上还有多少活" → 按人统计工作量
```

### Skill: `todo-board-meeting` — 会议管理

```
触发词：开会、会议、讨论一下、要不要开会

能力：
- "这事要不要开会？" → AI 判断是否必要
- "发个会，明天下午2点" → 创建会议 + 预订会议室 + 通知参会人
- "会开完了，整理一下" → AI 生成纪要 + 提取待办
- "这周有什么会？" → 会议日程查询
```

### Skill 分工总览

```
用户说 ──→ OpenClaw 路由
              │
              ├── admin  → 项目/成员/任务管理
              ├── notify → 提醒/通知/周报
              ├── report → 统计/报告
              └── meeting → 会议判断/发起/纪要
                    │
                    └──→ TodoBoard API ──→ MySQL
                                              │
                                              └──→ 看板（只读展示）
```

## 页面结构（精简）

只保留**查看型**页面，不做管理后台：

```
/                    → 仪表盘（我的任务、我参与的项目、过期提醒）
/login               → 登录
/projects            → 项目列表（只读卡片）
/projects/:id        → 项目看板（只读 + 少量操作：拖拽改状态、评论）
/meetings            → 会议日历（只读）
```

**不做的页面（全部由 OpenClaw 替代）：**
- ❌ 成员管理页面 → "把小王加进来"
- ❌ 部门管理页面 → "建个部门叫产品部"
- ❌ 项目设置页面 → "Q2 项目改成暂停"
- ❌ 权限配置页面 → "小李在 Q2 项目里是 PM"
- ❌ 报表页面 → "出个周报"
- ❌ 会议室预订 → "明天下午3点帮我订个会议室"
- ❌ 会议发起 → "这事要不要开个会"

## 服务器配置方案

### Phase 1 — 开发/内测（10-50 人）

```
配置：2 核 4G 云服务器 × 1
系统：Ubuntu 22.04
服务：
  - Node.js (Express)  ← 应用层
  - MySQL 8.0           ← 数据库
  - Nginx               ← 反向代理
成本：约 ¥100-200/月

适合：团队内测、功能验证、小部门试用
```

### Phase 2 — 小规模生产（50-300 人）

```
配置：4 核 8G 云服务器 × 1
系统：Ubuntu 22.04
服务：
  - Node.js (PM2 集群模式, 2 worker)
  - MySQL 8.0（同机）
  - Nginx + SSL
  - 每日自动备份（mysqldump → 对象存储）
成本：约 ¥300-500/月

适合：单部门或小公司全面使用
```

### Phase 3 — 中规模（300-1000 人）

```
配置：
  - 应用层：4 核 8G × 2（负载均衡）
  - 数据库：4 核 16G × 1（独立 MySQL）
  - Redis：2G × 1（Session + 缓存）
系统：Ubuntu 22.04
服务：
  - Node.js (PM2, 4 worker per node)
  - MySQL 8.0（独立服务器，主从可选）
  - Redis（Session 存储 + API 缓存）
  - Nginx（负载均衡 + SSL）
  - 每日备份 + binlog
成本：约 ¥1000-2000/月

适合：中型公司全面使用
```

### Phase 4 — 大规模（1000-3000+ 人）

```
配置：
  - 应用层：4 核 8G × 3+（K8s 或 PM2 集群）
  - 数据库：8 核 32G × 2（MySQL 主从）
  - Redis：4G × 2（Sentinel 高可用）
  - 对象存储：文件附件
系统：Ubuntu 22.04 / Docker
服务：
  - Node.js (Docker 容器化)
  - MySQL 8.0（主从复制，读写分离）
  - Redis Sentinel（高可用）
  - Nginx / Caddy（反向代理 + 自动 SSL）
  - 监控：Prometheus + Grafana 或云监控
  - 日志：ELK 或云日志
  - 备份：每日全量 + binlog 增量 + 异地
成本：约 ¥3000-6000/月

适合：集团级部署
```

### 配置总览

| 阶段 | 人数 | 应用层 | 数据库 | 缓存 | 月成本 |
|------|------|--------|--------|------|--------|
| 内测 | 10-50 | 2C4G ×1 | 同机 MySQL | 无 | ¥100-200 |
| 小规模 | 50-300 | 4C8G ×1 | 同机 MySQL | 无 | ¥300-500 |
| 中规模 | 300-1000 | 4C8G ×2 | 独立 4C16G | Redis 2G | ¥1000-2000 |
| 大规模 | 1000-3000+ | 4C8G ×3+ | 8C32G 主从 | Redis 4G HA | ¥3000-6000 |

### 扩容路径

```
内测 ──→ 小规模 ──→ 中规模 ──→ 大规模
 │         │          │          │
 2C4G     4C8G      分离 DB    K8s + 主从
 单机     单机       + 负载均衡  + 监控
 MySQL    MySQL+备份  Redis     Redis HA

关键节点：
- 50 人：加 PM2 集群 + 自动备份
- 300 人：数据库独立 + Redis
- 1000 人：应用层多节点 + 读写分离
- 2000 人：容器化 + 完整监控
```

## 开发分期

### Phase 1 — 数据库升级 + 多项目（3 天）
- [ ] MySQL 建表 + Prisma schema
- [ ] 迁移脚本（v1 SQLite → v2 MySQL）
- [ ] 项目 CRUD API
- [ ] 任务按项目隔离
- [ ] 成员 CRUD API
- [ ] 前端：项目列表页 + 看板适配

### Phase 2 — OpenClaw Skill: admin（2 天）
- [ ] todo-board-admin SKILL.md
- [ ] 对话式创建项目/成员/任务
- [ ] 对话式查询进度/统计
- [ ] 对话式管理（分配、归档、调部门）

### Phase 3 — 认证 + 权限（2 天）
- [ ] JWT 登录
- [ ] 集团角色中间件
- [ ] 项目角色中间件
- [ ] 前端登录态

### Phase 4 — 通知 + 报告（2 天）
- [ ] todo-board-notify Skill（cron 提醒）
- [ ] todo-board-report Skill（周报生成）
- [ ] 任务分配实时通知

### Phase 5 — 会议管理（3 天）
- [ ] 会议数据模型 + CRUD API
- [ ] todo-board-meeting Skill（AI 判断 + 创建 + 纪要）
- [ ] 企微接口集成（会议室预订 + 会议邀请）
- [ ] 纪要生成 + 待办自动转入项目

### Phase 6 — 增强（后续）
- Socket.io 实时同步
- 甘特图
- 文件附件
- 数据导出

## 与 v1 的关系

- v1 开源版继续维护（单项目、SQLite、无登录）
- v2 是企业版，MySQL + 多项目 + 登录 + Skill 驱动 + 会议管理
- 代码层面：v2 fork 后升级，核心看板逻辑复用
