# TodoBoard v2.0 — 集团数字化底座 产品方案

## 定位

**以 AI 对话为主要交互界面的集团数字化平台。**

五个子系统协作，覆盖项目、人事、会议、日报、AI 基础设施。不碰 OA 流程审批，专注"人的工作产出"这个维度。

## 总体架构

```
┌─────────────────────────────────────────────────────────┐
│                    OpenClaw (AI 交互层)                    │
│         所有操作通过对话完成，不建传统管理后台                    │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│ AI Infra │  人资画像  │  项目档案  │   会议    │   日报   │
│  平台    │  平台    │  平台    │  平台    │  平台   │
└─────────┴─────────┴─────────┴─────────┴─────────┘
         │              │            │          │
         └──────────────┼────────────┼──────────┘
                        │            │
                   ┌────▼────────────▼────┐
                   │      MySQL 8.0       │
                   │   统一数据底座        │
                   └─────────────────────┘
```

## 五个子系统

### 1. AI Infra 平台

管理 AI 的用量、安全、Skill、认证、Key、Model。

```
职责：
- Skill 注册/版本管理（哪些 Skill 可用、谁能用）
- API Key 管理（各子系统调用 LLM 的 Key）
- Model 配置（不同场景用不同模型）
- 用量统计（谁用了多少 token、花了多少钱）
- 安全审计（哪些对话触发了敏感操作）

不做什么：
- 不管具体业务逻辑
- 不存储业务数据
```

### 2. 人资画像平台

完整的人力主数据 + 评估档案 + 绩效参考数据。

```
主数据：
- 员工基本信息（姓名、部门、职位、入职时间）
- 组织架构（部门树、汇报关系）
- 职级/薪酬带宽（如有需要）

评估档案（子表，数据从其他系统自动汇聚）：
┌──────────────────────────────────────┐
│          员工画像 - 小王              │
├──────────────────────────────────────┤
│ 敬业度指标                            │
│  ├── 任务完成率：92%（项目系统）        │
│  ├── 响应速度：平均 2.3 小时（日报系统） │
│  └── 会议参与度：85%（会议系统）        │
│                                      │
│ 胜任力指标                            │
│  ├── 技术深度：高级（项目贡献评估）      │
│  ├── 跨部门协作：3 个项目（项目系统）    │
│  └── 主动性：提出 12 条改进建议（会议）  │
│                                      │
│ 成长轨迹                              │
│  ├── Q1: 完成 XX 项目核心模块          │
│  ├── Q2: 晋升为技术负责人              │
│  └── 近期：主导了 YY 方案评审          │
│                                      │
│ 绩效参考（辅助维度，非正式评估）         │
│  ├── 本季度任务交付量：47 项           │
│  ├── 按时完成率：89%                  │
│  ├── 项目贡献度：核心模块 ×2           │
│  └── 同行评价：会议中被提及 8 次       │
└──────────────────────────────────────┘
```

#### 绩效数据的定位

**重要：绩效数据是参考维度，不是正式绩效评估。**

- 我们提供的是**工作产出的事实数据**（做了什么、完成多少、响应多快）
- 正式绩效评估（KPI 打分、360 评估、晋升决定）仍然由 HR 通过传统流程完成
- 我们的数据作为**输入素材**，帮助评估者更客观地判断
- 人资画像平台可以与企业现有的绩效系统（如飞书 People、北森等）做数据同步

```
我们的角色：事实数据提供者
HR 的角色：评估决策者

项目/会议/日报 → 事实数据 → 人资画像 → 同步给 HR 系统
                                            ↓
                                    HR 结合主观判断
                                            ↓
                                    正式绩效结果
```

#### 绩效参考数据来源

| 指标 | 数据来源 | 更新频率 |
|------|---------|----------|
| 任务交付量 | 项目系统（tasks 完成数） | 实时 |
| 按时完成率 | 项目系统（due_date vs completed_at） | 实时 |
| 项目贡献度 | 项目系统（创建/指派的任务权重） | 按项目 |
| 响应速度 | 日报系统（提交时间 vs 任务更新时间） | 每日 |
| 会议汇报质量 | 会议系统（contribution_notes） | 每次会议 |
| 同行评价 | 会议系统（被引用/提及次数） | 每次会议 |
| 主动性 | 日报系统（自驱任务 vs 指派任务比例） | 每周 |

### 3. 项目档案平台（原 TodoBoard 升级）

项目主档 + 看板 + Wiki。

```
项目主档：
- 项目基本信息（名称、状态、负责人、成员）
- 看板（任务管理，继承 v1）
- 项目 Wiki（类似 Notion 的文档空间）

Wiki 功能：
- 项目文档（需求文档、设计文档、技术方案）
- 会议纪要自动归档到项目 Wiki
- 日报/周报自动汇总到项目 Wiki
- 支持 Markdown 编辑
```

### 4. 会议平台

AI 判断 → 创建 → 开会 → 纪要 → 关联项目。

```
核心流程：
1. 有人想开会 → AI 判断是否必要
2. 有必要 → 填目的/议题 → 预订会议室（企微）→ 通知参会人
3. 开会
4. AI 生成纪要 → 提取决议和待办
5. 待办自动转入项目看板
6. 纪要归档到项目 Wiki

数据流向：
会议 → 待办 → 项目进度更新
会议 → 个人贡献 → 人资评估档案
会议 → 纪要 → 项目 Wiki
```

### 5. 日报平台

日报/周报/月报，自动生成 + 手动补充。

```
两种生成方式：

1. 自动生成（从项目数据）
   - 今天更新了哪些任务
   - 哪些任务完成/开始/过期
   - 参加了什么会、决议是什么
   → 系统汇总，用户确认/补充 → 发出

2. 手动口述
   - "今天主要做了 XX 的方案设计，明天继续"
   → AI 结构化 → 写入日报

反向更新：
- 日报内容 → 更新项目进度（"今天完成了 XX" → 任务标记 done）
- 日报内容 → 更新员工画像（工作量、响应速度、主动性）

周报/月报：
- 自动聚合本周/本月的日报
- AI 提取亮点和问题
- 生成结构化报告
```

## 系统间数据流

```
人资画像平台
    ▲
    │ 评估数据（敬业度/胜任力/成长）
    │
    ├──────────────┬──────────────┐
    │              │              │
项目档案平台 ◄─── 会议平台 ◀─── 日报平台
    │              │              │
    │ 待办/进度    │ 纪要/决议    │ 日报/周报
    │              │              │
    └──────┬───────┴──────┬───────┘
           │              │
           ▼              ▼
        看板展示      项目 Wiki

AI Infra 平台（横切面）
    ├── Skill 管理：哪些 Skill 可用
    ├── Key 管理：各系统调 LLM 的凭证
    ├── 用量统计：token 消耗
    └── 安全审计：敏感操作日志
```

### 数据流向明细

| 从 | 到 | 数据 |
|----|-----|------|
| 项目系统 | 日报系统 | 今日任务变更 → 自动填充日报 |
| 日报系统 | 项目系统 | "今天完成了 XX" → 任务标记 done |
| 会议系统 | 项目系统 | 会议决议 → 自动生成待办 |
| 会议系统 | 项目 Wiki | 会议纪要 → 归档到项目文档 |
| 日报系统 | 人资系统 | 工作量/响应速度 → 更新员工画像 |
| 会议系统 | 人资系统 | 会议贡献/汇报质量 → 更新评估 |
| 项目系统 | 人资系统 | 任务完成率/跨部门协作 → 更新评估 |

## 数据模型（统一）

### AI Infra

```sql
-- Skill 注册表
CREATE TABLE skills (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  description TEXT,
  version VARCHAR(20),
  config JSON,                    -- Skill 配置（触发词、API 地址等）
  status ENUM('active','disabled') DEFAULT 'active',
  created_at DATETIME DEFAULT NOW()
);

-- API Key 管理
CREATE TABLE api_keys (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  provider VARCHAR(50),           -- openai / xiaomimimo / deepseek
  model VARCHAR(100),
  quota_tokens BIGINT DEFAULT 0,  -- 配额（0=无限）
  used_tokens BIGINT DEFAULT 0,
  owner_type ENUM('system','member') DEFAULT 'system',
  owner_id BIGINT,
  status ENUM('active','exhausted','disabled') DEFAULT 'active',
  created_at DATETIME DEFAULT NOW()
);

-- 用量日志
CREATE TABLE usage_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  api_key_id BIGINT,
  skill_id BIGINT,
  member_id BIGINT,
  model VARCHAR(100),
  input_tokens INT,
  output_tokens INT,
  cost_cents INT,                 -- 费用（分）
  latency_ms INT,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_key_date (api_key_id, created_at),
  INDEX idx_member_date (member_id, created_at)
);

-- 审计日志
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT,
  action VARCHAR(50),             -- create_project / delete_task / ...
  target_type VARCHAR(50),        -- project / task / meeting / ...
  target_id BIGINT,
  detail JSON,
  ip VARCHAR(45),
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_member_date (member_id, created_at)
);
```

### 人资画像

```sql
-- 员工（扩展 members 表）
-- members 表已有基础字段，以下为评估相关子表

-- 评估档案（事实数据，非正式绩效）
CREATE TABLE employee_assessments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT NOT NULL,
  period VARCHAR(20) NOT NULL,         -- 2026-Q2
  -- 敬业度
  task_completion_rate DECIMAL(5,2),   -- 任务完成率
  avg_response_hours DECIMAL(5,2),     -- 平均响应时间
  meeting_participation_rate DECIMAL(5,2), -- 会议参与度
  -- 胜任力
  technical_level ENUM('junior','mid','senior','expert'),
  cross_project_count INT,             -- 跨项目数量
  initiative_score DECIMAL(3,1),       -- 主动性评分（1-10）
  -- 绩效参考（事实数据，辅助 HR 评估）
  tasks_delivered INT,                 -- 本周期交付任务数
  on_time_rate DECIMAL(5,2),           -- 按时完成率
  core_contributions INT,              -- 核心贡献项数（高优任务/关键模块）
  peer_mentions INT,                   -- 会议中被同行提及次数
  self_driven_ratio DECIMAL(5,2),      -- 自驱任务占比（vs 指派任务）
  -- 综合
  overall_score DECIMAL(3,1),          -- 综合评分（AI 计算）
  summary TEXT,                         -- AI 生成的评估摘要
  data_sources JSON,                    -- 数据来源明细
  updated_at DATETIME DEFAULT NOW(),
  UNIQUE KEY uk_member_period (member_id, period),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 员工画像标签
CREATE TABLE member_tags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT NOT NULL,
  tag VARCHAR(50) NOT NULL,            -- "技术大牛" / "跨部门协作" / "高效执行"
  source VARCHAR(50),                  -- project / meeting / report
  source_id BIGINT,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_member (member_id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

### 项目档案（含 Wiki）

```sql
-- 项目（在原 projects 表基础上增加）
ALTER TABLE projects ADD COLUMN wiki_home_id BIGINT NULL;

-- Wiki 页面
CREATE TABLE wiki_pages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  parent_id BIGINT NULL,               -- 父页面（支持多级）
  title VARCHAR(200) NOT NULL,
  content LONGTEXT,                    -- Markdown 内容
  page_type ENUM('doc','meeting_minutes','report','template') DEFAULT 'doc',
  source_id BIGINT NULL,               -- 关联来源（会议 ID / 日报 ID）
  created_by BIGINT,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  INDEX idx_project_parent (project_id, parent_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES members(id)
);
```

### 会议平台

```sql
-- 会议室
CREATE TABLE meeting_rooms (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  capacity INT DEFAULT 10,
  wecom_room_id VARCHAR(100),
  equipment VARCHAR(200),
  status ENUM('available','maintenance') DEFAULT 'available',
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

-- 会议
CREATE TABLE meetings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  project_id BIGINT NULL,
  title VARCHAR(200) NOT NULL,
  purpose TEXT NOT NULL,
  agenda JSON,                         -- [{topic, duration_min, presenter}]
  status ENUM('proposed','confirmed','ongoing','completed','cancelled') DEFAULT 'proposed',
  meeting_type ENUM('decision','discussion','sync','review') NOT NULL,
  scheduled_at DATETIME,
  duration_min INT DEFAULT 30,
  room_id BIGINT NULL,
  wecom_meeting_id VARCHAR(100),
  created_by BIGINT NOT NULL,
  ai_suggestion TEXT,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_org_project (org_id, project_id),
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
  contribution_notes TEXT,             -- 个人在会议中的贡献记录
  UNIQUE KEY uk_meeting_member (meeting_id, member_id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 会议纪要
CREATE TABLE meeting_minutes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT NOT NULL UNIQUE,
  content TEXT,
  decisions JSON,                      -- [{decision, owner, deadline}]
  action_items JSON,                   -- [{task, assignee_id, due_date}]
  wiki_page_id BIGINT NULL,            -- 归档到项目 Wiki 的页面 ID
  generated_by_ai BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (wiki_page_id) REFERENCES wiki_pages(id)
);
```

### 日报平台

```sql
-- 日报/周报/月报
CREATE TABLE reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT NOT NULL,
  report_type ENUM('daily','weekly','monthly') NOT NULL,
  period DATE NOT NULL,                -- 日期/周起始/月起始
  content TEXT NOT NULL,               -- 报告正文（Markdown）
  highlights TEXT,                     -- 亮点
  blockers TEXT,                       -- 阻塞/问题
  tomorrow_plan TEXT,                  -- 明日/下周/下月计划
  source ENUM('auto','manual','hybrid') DEFAULT 'manual',
  -- auto: 系统从项目数据生成
  -- manual: 用户口述
  -- hybrid: 系统生成 + 用户补充
  auto_generated_content TEXT,         -- 系统生成的原始内容（hybrid 模式）
  project_updates JSON,                -- 反向更新项目的记录 [{project_id, task_id, action}]
  status ENUM('draft','submitted') DEFAULT 'draft',
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  UNIQUE KEY uk_member_type_period (member_id, report_type, period),
  INDEX idx_member_date (member_id, period),
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

## Skill 体系

```
OpenClaw 路由
    │
    ├── todo-board-admin     → 项目/成员/任务管理
    ├── todo-board-meeting   → 会议判断/发起/纪要
    ├── todo-board-report    → 日报/周报/月报生成
    ├── todo-board-notify    → 提醒/通知/周报推送
    ├── todo-board-hr        → 人资画像查询/评估更新
    ├── todo-board-wiki      → 项目文档管理
    └── todo-board-infra     → AI 用量/Key/Skill 管理
```

### Skill: `todo-board-admin` — 项目管理

```
- "建个项目叫 XXX" → 创建项目
- "把小王加到 Q2 营销项目" → 添加成员
- "把写方案分给小王" → 分配任务
- "Q2 营销进度怎么样？" → 查进度
- "归档 Q1 项目" → 项目归档
```

### Skill: `todo-board-meeting` — 会议管理

```
- "这事要不要开个会？" → AI 判断
- "发个会，明天下午2点" → 创建 + 预订 + 通知
- "会开完了，整理一下" → 纪要 + 待办转入项目
- "上次会的决议执行了吗？" → 查决议状态
```

### Skill: `todo-board-report` — 日报系统

```
- "帮我写今天的日报" → 从项目数据自动生成
- "今天做了 XX 方案和 YY 评审" → 结构化 → 写入日报
  → 同时更新项目进度
  → 同时更新员工画像
- "这周周报" → 聚合本周日报
- "小王这个月干了什么？" → 查月报
```

### Skill: `todo-board-hr` — 人资画像

```
- "小王这个人怎么样？" → 查员工画像
- "技术部谁最能打？" → 按评估排名
- "小王这季度评估" → 查季度评估
- "更新小王的技术等级为高级" → 修改评估
- "出一份部门人才盘点" → 批量评估报告
```

### Skill: `todo-board-wiki` — 项目文档

```
- "Q2 项目的需求文档在哪？" → 搜索 Wiki
- "把这份会议纪要归档到项目 Wiki" → 自动归档
- "写个技术方案" → 创建 Wiki 页面
- "Q2 项目文档目录" → 列出 Wiki 树
```

### Skill: `todo-board-infra` — AI 基础设施

```
- "这个月 AI 用了多少 token？" → 用量统计
- "给日报系统加个 Key" → 创建 API Key
- "哪些 Skill 在用？" → Skill 列表
- "禁用 XX Skill" → Skill 管理
```

## 页面结构（极简）

只保留**只读展示**页面：

```
/                    → 仪表盘（我的任务、会议、日报、待办）
/login               → 登录
/projects            → 项目列表
/projects/:id        → 项目看板 + Wiki 入口
/projects/:id/wiki   → 项目文档空间
/meetings            → 会议日历
/reports             → 我的日报/周报
```

**不做的页面（全部走 OpenClaw 对话）：**
- 成员管理、部门管理、权限配置
- 会议室预订、会议发起
- 日报填写、周报生成
- 人资评估、人才盘点
- AI 用量、Key 管理

## 服务器配置方案

### Phase 1 — 开发/内测（10-50 人）

```
配置：2 核 4G 云服务器 × 1
系统：Ubuntu 22.04
服务：
  - Node.js (Express)
  - MySQL 8.0
  - Nginx
成本：约 ¥100-200/月
适合：功能验证、小部门试用
```

### Phase 2 — 小规模生产（50-300 人）

```
配置：4 核 8G 云服务器 × 1
系统：Ubuntu 22.04
服务：
  - Node.js (PM2 集群, 2 worker)
  - MySQL 8.0（同机）
  - Nginx + SSL
  - 每日自动备份
成本：约 ¥300-500/月
适合：单部门或小公司全面使用
```

### Phase 3 — 中规模（300-1000 人）

```
配置：
  - 应用层：4 核 8G × 2（负载均衡）
  - 数据库：4 核 16G × 1（独立 MySQL）
  - Redis：2G × 1（Session + 缓存）
服务：
  - Node.js (PM2, 4 worker per node)
  - MySQL 8.0（独立，主从可选）
  - Redis + Nginx
  - 每日备份 + binlog
成本：约 ¥1000-2000/月
适合：中型公司全面使用
```

### Phase 4 — 大规模（1000-3000+ 人）

```
配置：
  - 应用层：4 核 8G × 3+（K8s / PM2 集群）
  - 数据库：8 核 32G × 2（MySQL 主从）
  - Redis：4G × 2（Sentinel HA）
  - 对象存储：文件附件
服务：
  - Docker 容器化
  - MySQL 主从 + 读写分离
  - Redis Sentinel
  - 监控（Prometheus + Grafana）
  - 日志（ELK / 云日志）
  - 备份（全量 + 增量 + 异地）
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

## 开发分期

### Phase 1 — 项目管理核心（3 天）
- [ ] MySQL 建表 + Prisma schema（全量表）
- [ ] 项目 CRUD API
- [ ] 任务按项目隔离
- [ ] 成员 CRUD API
- [ ] 前端：项目列表 + 看板

### Phase 2 — 项目管理 Skill（2 天）
- [ ] todo-board-admin Skill
- [ ] 对话式创建/查询/管理
- [ ] 仪表盘（我的任务）

### Phase 3 — 认证 + 权限（2 天）
- [ ] JWT 登录
- [ ] 集团角色 + 项目角色中间件
- [ ] 前端登录态

### Phase 4 — 会议系统（3 天）
- [ ] 会议数据模型 + CRUD API
- [ ] todo-board-meeting Skill（AI 判断 + 创建 + 纪要）
- [ ] 企微接口集成
- [ ] 纪要生成 + 待办转入项目
- [ ] 纪要归档到 Wiki

### Phase 5 — 日报系统（2 天）
- [ ] 日报数据模型 + CRUD API
- [ ] todo-board-report Skill（自动生成 + 手动补充）
- [ ] 日报反向更新项目进度
- [ ] 日报 → 员工画像数据

### Phase 6 — 人资画像（2 天）
- [ ] 评估档案数据模型
- [ ] todo-board-hr Skill
- [ ] 从项目/会议/日报自动汇聚评估数据
- [ ] 员工画像展示页

### Phase 7 — Wiki + AI Infra（2 天）
- [ ] Wiki 页面 CRUD + Markdown 编辑器
- [ ] todo-board-wiki Skill
- [ ] AI Infra 数据模型 + API
- [ ] todo-board-infra Skill
- [ ] 用量统计 + Key 管理

### Phase 8 — 增强（后续）
- Socket.io 实时同步
- 甘特图
- 文件附件
- 数据导出
- 通知中心

## 不碰的边界

| 做 | 不做（留给 OA） |
|----|----------------|
| 项目管理 | 流程审批 |
| 会议管理 | 考勤打卡 |
| 日报/周报 | 薪酬计算 |
| 人资画像 | 招聘管理 |
| Wiki 文档 | 合同管理 |
| AI 基础设施 | 财务系统 |

## 与 v1 的关系

- v1 开源版继续维护（单项目、SQLite、无登录）
- v2 是企业版，五个子系统 + Skill 驱动
- 代码层面：v2 fork 后升级，核心看板逻辑复用
