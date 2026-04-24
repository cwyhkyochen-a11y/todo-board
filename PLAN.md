# 集团数字化底座 - 总体方案

## 一、这套系统解决什么问题

一个 3000 人的集团,日常运转依赖六件事:**做事(项目)、开会(协作)、写报告(记录)、评人(评估)、管人(画像)、用 AI(基础设施)**。

现在这些事情散落在各种工具里:飞书管项目、企微管会议、Excel 管绩效、Word 写日报。数据不通,人要来回切换工具,管理层看不到全局。

**这套系统把六个场景串在一起,用 AI 对话作为唯一操作入口。**

不用学新页面,不用找按钮。跟 AI 说话,AI 操作系统,人只看结果。

---

## 二、六个子系统是什么

```
┌──────────────────────────────────────────────────────┐
│                OpenClaw(AI 对话层)                    │
│           所有操作通过对话完成,不建管理后台                │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│  AI Infra │  人资画像  │  项目档案  │   会议    │   日报   │  人才评估  │
│  平台     │  平台     │  平台     │  平台     │  平台    │  平台     │
├──────────┴──────────┴──────────┴──────────┴──────────┴──────────┤
│                     MySQL 8.0                         │
│                   统一数据底座                          │
└──────────────────────────────────────────────────────┘
```

| 子系统 | 一句话定位 | 管什么 |
|--------|----------|--------|
| AI Infra 平台 | AI 的"水电煤" | Skill、Key、Model、用量、安全 |
| 人资画像平台 | 每个人的"数字档案" | 员工主数据 + 评估档案 + 绩效参考 |
| 项目档案平台 | 做事的地方 | 项目 + 任务看板 + Wiki 文档 |
| 会议平台 | 开会的地方 | AI 判断 → 纪要 → 待办转入项目 |
| 日报平台 | 记录的地方 | 日报/周报/月报,自动+手动 |
| 人才评估平台 | 评人的地方 | 评估模板 → 分发 → 回收 → 汇总 |

### 生产力工具层

六个子系统是“管事”的基础设施，生产力工具是“做事”的日常提效。

所有员工通过 OpenClaw 使用这些工具，所有产出都挂到项目上。没有一个员工手上的事跟项目无关。

| 工具 | 做什么 | 产出去向 |
|------|--------|----------|
| 数据分析 | Excel/CSV 分析、图表生成、异常检测、趋势洞察 | 分析报告 → 项目 Wiki |
| 调研助手 | 竞品分析、市场调研、技术选型、信息整理 | 调研报告 → 项目 Wiki |
| 文档产出 | 方案撰写、报告生成、文档润色、格式排版 | 文档 → 项目 Wiki |
| PPT 生成 | 演讲稿转 PPT、模板套用、风格定制 | PPT → 项目交付物 |
| 表格处理 | 数据清洗、批量处理、公式生成、格式转换 | 处理结果 → 项目附件 |
| 代码辅助 | 代码生成、Review、调试、API 文档 | 代码 → 项目仓库 |

**与项目的关系：**
```
员工说：“帮我分析一下上季度的销售数据”
    → AI 数据分析工具生成报告
    → 报告自动挂到项目 Wiki
    → 日报自动记录“完成了销售数据分析”
    → 项目任务自动推进

员工说：“帮我做个竞品分析报告”
    → AI 调研助手搜索 + 整理 + 出报告
    → 报告归档到项目
    → 日报自动填充

员工说：“把这个方案做成 PPT”
    → AI PPT 工具生成幻灯片
    → PPT 作为项目交付物
    → 日报记录
```

**工具 Skill 清单：**
```
todo-board-analyze    → 数据分析（上传文件 → 出报告）
todo-board-research   → 调研助手（给主题 → 出调研报告）
todo-board-write      → 文档产出（口述 → 成稿）
todo-board-ppt        → PPT 生成（大纲/稿 → 幻灯片）
todo-board-spreadsheet → 表格处理（描述需求 → 处理结果）
todo-board-code       → 代码辅助（描述需求 → 代码/Review）
```

---

## 三、系统间怎么串联

这是整个方案的核心逻辑。六个系统不是独立的，数据在它们之间流动，形成闭环。

### 3.1 数据流全景

```
                    ┌─────────────┐
                    │  人资画像平台  │
                    │  (终点汇聚)  │
                    └──────▲──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────┴─────┐ ┌─────┴──────┐ ┌─────┴──────┐
     │  项目档案   │ │    会议    │ │    日报    │
     │ (做事)    │ │ (协作)   │ │ (记录)   │
     └──────┬─────┘ └─────┬──────┘ └─────┬──────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    ┌──────┴──────┐
                    │  AI Infra   │
                    │ (基础设施)  │
                    └─────────────┘
```

### 3.2 具体数据流向

```
项目系统                          会议系统
  │                                │
  │ 任务变更                        │ 会议决议
  │ ↓                              │ ↓
  ├─→ 日报系统 ──→ 员工画像 ──→ 人资评估
  │   (自动填充今日变更)  (工作量/响应/主动性)
  │                                │
  │ 任务完成                        │ 纪要
  │ ↓                              │ ↓
  └─→ 项目进度                     └─→ 项目 Wiki
                                      (自动归档)

日报系统
  │
  │ "今天完成了 XX 模块"
  │ ↓
  └─→ 反向更新项目任务状态(标记 done)
```

### 3.3 串联规则

| 触发事件 | 源系统 | 目标系统 | 动作 |
|----------|--------|---------|------|
| 任务状态变更 | 项目 | 日报 | 自动填充到今日日报草稿 |
| 任务完成 | 项目 | 人资画像 | 更新任务交付量、按时完成率 |
| 日报提交 | 日报 | 项目 | "完成了 XX" → 任务标记 done |
| 日报提交 | 日报 | 人资画像 | 更新响应速度、自驱任务占比 |
| 会议决议生成 | 会议 | 项目 | 自动生成待办任务 |
| 会议纪要归档 | 会议 | 项目 Wiki | 纪要写入项目文档空间 |
| 会议结束 | 会议 | 人资画像 | 更新会议参与度、同行评价 |
| 周期评估 | 全部 | 人资画像 | 汇聚所有数据,AI 生成评估摘要 |

---

## 四、各子系统详细设计

### 4.1 AI Infra 平台

**职责:** 管理 AI 的一切基础设施,让业务系统只管调用,不管底层。

#### 核心概念

```
Skill(技能)→ 调用哪个 AI 能力
Key(密钥)→ 用哪个账号调用
Model(模型)→ 调用哪个 LLM
用量 → 花了多少钱
安全 → 有没有违规操作
```

#### 数据模型

```sql
-- Skill 注册表
CREATE TABLE skills (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,        -- todo-board-admin
  display_name VARCHAR(100),                 -- 项目管理
  description TEXT,
  version VARCHAR(20),
  config JSON,                               -- 触发词、API 地址、权限等
  status ENUM('active','disabled') DEFAULT 'active',
  created_at DATETIME DEFAULT NOW()
);

-- API Key 管理
CREATE TABLE api_keys (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  provider VARCHAR(50),                      -- openai / xiaomimimo / deepseek
  model VARCHAR(100),                        -- gpt-4 / mimo-v2 / ...
  quota_tokens BIGINT DEFAULT 0,             -- 配额(0=无限)
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
  cost_cents INT,                            -- 费用(分)
  latency_ms INT,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_key_date (api_key_id, created_at),
  INDEX idx_member_date (member_id, created_at)
);

-- 审计日志
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT,
  action VARCHAR(50),                        -- create_project / delete_task / ...
  target_type VARCHAR(50),                   -- project / task / meeting / ...
  target_id BIGINT,
  detail JSON,
  ip VARCHAR(45),
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_member_date (member_id, created_at)
);
```

#### Skill 清单

```
todo-board-infra:
  - "这个月 AI 用了多少 token?" → 用量统计
  - "给日报系统加个 Key" → 创建 API Key
  - "哪些 Skill 在用?" → Skill 列表
  - "禁用 XX Skill" → Skill 管理
  - "查一下最近的审计日志" → 安全审查
```

---

### 4.2 人资画像平台

**职责:** 维护员工主数据,汇聚各系统产生的事实数据,形成完整的员工画像。

#### 核心逻辑

```
我们的定位:事实数据提供者
HR 的定位:评估决策者

我们做的事:
  项目/会议/日报 → 事实数据 → 员工画像

HR 做的事:
  员工画像 + 主观判断 → 正式绩效结果

不替代正式绩效评估,只提供数据支撑。
```

#### 数据模型

```sql
-- 部门(组织架构)
CREATE TABLE departments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  name VARCHAR(100) NOT NULL,
  lead_id BIGINT NULL,                       -- 部门负责人
  sort_order INT DEFAULT 0,
  INDEX idx_org_parent (org_id, parent_id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (parent_id) REFERENCES departments(id)
);

-- 成员(员工主数据)
CREATE TABLE members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  dept_id BIGINT NULL,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  avatar VARCHAR(255),
  position VARCHAR(100),                     -- 职位
  hire_date DATE,                            -- 入职日期
  org_role ENUM('admin','dept_lead','member') DEFAULT 'member',
  status ENUM('active','disabled') DEFAULT 'active',
  last_login_at DATETIME,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_org_dept (org_id, dept_id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- 评估档案(事实数据,按周期汇聚)
CREATE TABLE employee_assessments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT NOT NULL,
  period VARCHAR(20) NOT NULL,               -- 2026-Q2

  -- 敬业度(事实数据)
  task_completion_rate DECIMAL(5,2),         -- 任务完成率
  avg_response_hours DECIMAL(5,2),           -- 平均响应时间
  meeting_participation_rate DECIMAL(5,2),   -- 会议参与度

  -- 胜任力(事实数据)
  technical_level ENUM('junior','mid','senior','expert'),
  cross_project_count INT,                   -- 跨项目数量
  initiative_score DECIMAL(3,1),             -- 主动性评分(1-10)

  -- 绩效参考(辅助 HR,非正式评估)
  tasks_delivered INT,                       -- 交付任务数
  on_time_rate DECIMAL(5,2),                 -- 按时完成率
  core_contributions INT,                    -- 核心贡献项数
  peer_mentions INT,                         -- 同行提及次数
  self_driven_ratio DECIMAL(5,2),            -- 自驱任务占比

  -- 综合
  overall_score DECIMAL(3,1),                -- AI 综合评分
  summary TEXT,                               -- AI 评估摘要
  data_sources JSON,                          -- 数据来源明细
  updated_at DATETIME DEFAULT NOW(),

  UNIQUE KEY uk_member_period (member_id, period),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 员工标签(自动+手动)
CREATE TABLE member_tags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT NOT NULL,
  tag VARCHAR(50) NOT NULL,                  -- "技术大牛" / "跨部门协作"
  source VARCHAR(50),                        -- project / meeting / report / manual
  source_id BIGINT,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_member (member_id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

#### 数据汇聚逻辑

```
每个评估周期(月/季),AI 自动执行:

1. 从项目系统拉数据
   - 该成员参与了哪些项目
   - 完成了多少任务,按时率多少
   - 有没有高优/核心任务

2. 从会议系统拉数据
   - 参加了多少会议
   - 会议中的贡献记录
   - 被同行提及的次数

3. 从日报系统拉数据
   - 日报提交及时性
   - 自驱任务 vs 指派任务比例
   - 响应速度

4. AI 汇总
   - 计算各项指标
   - 生成评估摘要(自然语言)
   - 打标签("技术大牛"、"高效执行"等)
   - 写入 employee_assessments 表
```

#### Skill 清单

```
todo-board-hr:
  - "小王这个人怎么样?" → 查员工画像
  - "技术部谁最能打?" → 按评估排名
  - "小王这季度绩效参考" → 查季度数据
  - "更新小王的技术等级" → 修改评估
  - "出一份部门人才盘点" → 批量报告
  - "小王最近参加了哪些项目?" → 交叉查询
```

---

### 4.3 项目档案平台

**职责:** 项目主档 + 任务看板 + Wiki 文档空间。

#### 核心概念

```
一个项目 = 一个独立空间
  ├── 基本信息(名称、状态、成员)
  ├── 看板(三栏任务管理)
  └── Wiki(项目文档空间)
       ├── 需求文档
       ├── 技术方案
       ├── 会议纪要(自动归档)
       └── 日报汇总(自动聚合)
```

#### 数据模型

```sql
-- 组织
CREATE TABLE organizations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT NOW()
);

-- 项目
CREATE TABLE projects (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('active','archived','paused') DEFAULT 'active',
  wiki_home_id BIGINT NULL,                  -- Wiki 首页
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
  source_type VARCHAR(20),                   -- manual / meeting / report
  source_id BIGINT,                          -- 来源 ID(会议 ID / 日报 ID)
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  started_at DATETIME,
  completed_at DATETIME,
  INDEX idx_project_col (project_id, column_name),
  INDEX idx_assignee (assignee_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assignee_id) REFERENCES members(id)
);

-- 评论
CREATE TABLE comments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT NOT NULL,
  member_id BIGINT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Wiki 页面
CREATE TABLE wiki_pages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  title VARCHAR(200) NOT NULL,
  content LONGTEXT,                          -- Markdown
  page_type ENUM('doc','meeting_minutes','report','template') DEFAULT 'doc',
  source_type VARCHAR(20),                   -- meeting / report / manual
  source_id BIGINT,                          -- 来源 ID
  created_by BIGINT,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  INDEX idx_project_parent (project_id, parent_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES members(id)
);
```

#### Skill 清单

```
todo-board-admin:
  - "建个项目叫 Q2 营销" → 创建项目
  - "把小王加进来" → 添加成员
  - "写方案这个任务分给小王" → 分配任务
  - "Q2 进度怎么样?" → 查进度
  - "归档 Q1 项目" → 项目归档

todo-board-wiki:
  - "Q2 需求文档在哪?" → 搜索 Wiki
  - "写个技术方案" → 创建 Wiki 页面
  - "把会议纪要归档到项目" → 自动归档
  - "项目文档目录" → 列出 Wiki 树
```

---

### 4.4 会议平台

**职责:** AI 判断会议是否必要 → 自动创建 → 纪要生成 → 待办转入项目。

#### 核心流程

```
有人说"要不要开个会讨论 XX"
        │
        ▼
   AI 判断是否需要开会
        │
   ┌────┴────┐
   │         │
  不需要     需要
   │         │
   ▼         ▼
 "发消息     AI 填写:
  就行"     - 目的
            - 议题
            - 建议参会人
            - 预估时长
               │
               ▼
          确认后自动:
          - 创建会议记录
          - 预订会议室(企微接口)
          - 通知参会人
               │
               ▼
            开会
               │
               ▼
          AI 生成纪要:
          - 会议摘要
          - 决议事项(谁负责、截止时间)
          - 待办事项
               │
               ▼
         ┌─────┴─────┐
         │           │
    待办转入项目   纪要归档到 Wiki
    (自动建任务)  (自动创建页面)
```

#### AI 判断逻辑

```
不需要开会的情况:
  - 单向通知("上线日期改了")→ 发消息
  - 简单确认("方案行不行")→ 发文档让人批注
  - 信息同步("进度更新一下")→ 看看板
  - 已有结论("就这么定了")→ 直接执行

需要开会的情况:
  - 多人实时讨论、有分歧要对齐
  - 跨部门协调
  - 需要拍板决策
  - 复杂问题头脑风暴
```

#### 数据模型

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
  purpose TEXT NOT NULL,                     -- 会议目的(必须填写)
  agenda JSON,                               -- [{topic, duration_min, presenter}]
  status ENUM('proposed','confirmed','ongoing','completed','cancelled') DEFAULT 'proposed',
  meeting_type ENUM('decision','discussion','sync','review') NOT NULL,
  scheduled_at DATETIME,
  duration_min INT DEFAULT 30,
  room_id BIGINT NULL,
  wecom_meeting_id VARCHAR(100),
  created_by BIGINT NOT NULL,
  ai_suggestion TEXT,                        -- AI 建议
  created_at DATETIME DEFAULT NOW(),
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
  contribution_notes TEXT,                   -- 个人贡献记录
  UNIQUE KEY uk_meeting_member (meeting_id, member_id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 会议纪要
CREATE TABLE meeting_minutes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT NOT NULL UNIQUE,
  content TEXT,
  decisions JSON,                            -- [{decision, owner, deadline}]
  action_items JSON,                         -- [{task, assignee_id, due_date}]
  wiki_page_id BIGINT NULL,                  -- 归档到 Wiki 的页面
  generated_by_ai BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (wiki_page_id) REFERENCES wiki_pages(id)
);
```

#### Skill 清单

```
todo-board-meeting:
  - "Q2 方案要不要开会讨论?" → AI 判断
  - "发个会,明天下午2点,产品部和市场部" → 创建 + 预订 + 通知
  - "会开完了,帮我整理" → 纪要 + 待办 + 归档
  - "上次会的决议执行了吗?" → 查决议状态
  - "这周有什么会?" → 会议日程
  - "Q2 项目开过几次会了?" → 会议历史
```

---

### 4.5 日报平台

**职责:** 日报/周报/月报的生成、提交、反向更新。

#### 两种生成模式

```
模式 A:自动模式
  系统从项目/会议/今日操作自动生成 → 用户确认/补充 → 提交

模式 B:手动模式
  用户口述 → AI 结构化 → 提交

模式 C:混合模式(推荐)
  系统先生成草稿 → 用户在此基础上补充 → 提交
```

#### 日报内容结构

```markdown
# 2026-04-24 日报 - 小王

## 今日完成
- [x] 完成 Q2 营销方案初稿(项目:Q2 营销)
- [x] 参加产品评审会议,提出 3 条优化建议

## 进行中
- [ ] 用户调研报告(预计明天完成)

## 问题/阻塞
- 设计稿还没确认,等小李反馈

## 明日计划
- 完成用户调研报告
- 开始写技术方案

---
*数据来源:项目系统(任务变更)+ 会议系统(参会记录)+ 本人补充*
```

#### 反向更新逻辑

```
日报提交后,系统自动检查:

1. 日报中提到"完成了 XX"
   → 在项目中找到对应任务
   → 标记为 done
   → 更新 completed_at

2. 日报中提到"开始做 YY"
   → 在项目中找到对应任务
   → 从 todo 移到 doing
   → 更新 started_at

3. 日报中提到新任务(项目中没有的)
   → 询问是否创建新任务
   → 确认后自动创建

4. 更新员工画像
   - 提交及时性 → 响应速度指标
   - 自驱任务比例 → 主动性指标
   - 完成数量 → 交付量指标
```

#### 数据模型

```sql
CREATE TABLE reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT NOT NULL,
  report_type ENUM('daily','weekly','monthly') NOT NULL,
  period DATE NOT NULL,
  content TEXT NOT NULL,
  highlights TEXT,
  blockers TEXT,
  tomorrow_plan TEXT,
  source ENUM('auto','manual','hybrid') DEFAULT 'manual',
  auto_generated_content TEXT,               -- 系统生成的原始内容
  project_updates JSON,                      -- [{project_id, task_id, action}]
  status ENUM('draft','submitted') DEFAULT 'draft',
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  UNIQUE KEY uk_member_type_period (member_id, report_type, period),
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

#### 周报/月报聚合逻辑

```
周报 = 聚合本周 5 份日报
  - AI 提取本周亮点
  - AI 总结本周问题
  - 自动生成下周计划

月报 = 聚合本周 4 份周报
  - AI 提取本月成果
  - AI 分析趋势(完成量、响应速度变化)
  - 生成下月重点

所有报告自动写入员工画像。
```

#### Skill 清单

```
todo-board-report:
  - "帮我写今天的日报" → 自动生成草稿
  - "今天做了 XX 和 YY" → 结构化 + 提交
  - "这周周报" → 聚合本周日报
  - "小王这个月干了什么?" → 查月报
  - "部门本月日报提交率" → 统计
```

---

### 4.6 人才评估平台

**职责:** 评估工具的创建、分发、回收、汇总。评估本身作为项目待办管理,结果自动汇入人资画像。

#### 核心理念

```
人才评估 ≠ 年度绩效考核
人才评估 = 持续的、多维度的、项目式的人才数据采集

评估工具(模板)→ 分发给员工(项目待办)→ 定期提醒 → 回收结果 → 汇入画像
```

#### 评估类型

| 类型 | 说明 | 频率 | 场景 |
|------|------|------|------|
| 项目复盘评估 | 项目结束后,成员互评 + 自评 | 每个项目 | PM 发起 |
| 季度 360 评估 | 上级、同事、下级多维度评估 | 每季度 | HR 发起 |
| 能力自评 | 员工对自己技术/协作/领导力打分 | 每季度 | 系统自动推送 |
| 新人试用期评估 | 试用期结束,导师 + 同事评估 | 一次性 | 入职触发 |
| 专项评估 | 针对特定事件(如主导了一次大故障处理) | 随时 | 管理员发起 |

#### 评估与项目的关系

```
评估本身就是一个项目待办:

项目 A(Q2 品牌营销)
├── 任务:目标人群分析(小王)
├── 任务:竞品调研(小张)
├── 任务:技术方案(小陈)
└── 任务:项目复盘评估(所有人)    ← 这也是一个任务
     ├── 小王填写自评
     ├── 小张填写对小王的评价
     ├── 小陈填写对小王的评价
     └── PM(小王)填写对所有人的评价

评估任务的生命周期:
1. PM/HR 创建评估(选择模板)
2. 系统自动生成评估任务,分配给相关人
3. 系统定期提醒("你有 1 份评估未完成")
4. 所有人提交后,AI 汇总结果
5. 结果写入每个员工的人资画像
6. 评估任务标记完成
```

#### 数据模型

```sql
-- 评估模板
CREATE TABLE assessment_templates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_type ENUM('project_review','360','self_assessment','onboarding','special') NOT NULL,
  questions JSON NOT NULL,              -- [{id, text, type, options, weight}]
  -- type: rating(1-5) / text / choice
  scoring_rules JSON,                    -- 评分规则
  status ENUM('active','archived') DEFAULT 'active',
  created_by BIGINT,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (created_by) REFERENCES members(id)
);

-- 评估实例(一次具体的评估)
CREATE TABLE assessments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  template_id BIGINT NOT NULL,
  project_id BIGINT NULL,               -- 关联项目(项目复盘评估时)
  title VARCHAR(200) NOT NULL,
  status ENUM('draft','active','collecting','completed','cancelled') DEFAULT 'draft',
  target_member_id BIGINT NULL,          -- 被评估人(360 评估时)
  due_date DATE,                         -- 截止日期
  created_by BIGINT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_org_status (org_id, status),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (template_id) REFERENCES assessment_templates(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES members(id)
);

-- 评估任务(谁要填哪份评估)
CREATE TABLE assessment_tasks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  assessment_id BIGINT NOT NULL,
  evaluator_id BIGINT NOT NULL,          -- 评估人(填表的人)
  evaluatee_id BIGINT NULL,              -- 被评估人(360 时)
  status ENUM('pending','reminded','submitted','skipped') DEFAULT 'pending',
  submitted_at DATETIME,
  reminded_at DATETIME,                  -- 上次提醒时间
  remind_count INT DEFAULT 0,
  UNIQUE KEY uk_assessment_evaluator (assessment_id, evaluator_id, evaluatee_id),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluator_id) REFERENCES members(id)
);

-- 评估回答
CREATE TABLE assessment_responses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  assessment_task_id BIGINT NOT NULL,
  question_id VARCHAR(50) NOT NULL,      -- 对应模板中的 question id
  rating_value INT,                      -- 评分(1-5)
  text_value TEXT,                       -- 文字回答
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (assessment_task_id) REFERENCES assessment_tasks(id) ON DELETE CASCADE
);

-- 评估结果汇总
CREATE TABLE assessment_results (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  assessment_id BIGINT NOT NULL,
  member_id BIGINT NOT NULL,             -- 被评估人
  overall_score DECIMAL(3,1),            -- 综合评分
  dimension_scores JSON,                 -- {technical: 4.2, collaboration: 3.8, ...}
  summary TEXT,                          -- AI 生成的评估摘要
  highlights TEXT,                       -- 亮点
  improvements TEXT,                     -- 待改进
  calculated_at DATETIME DEFAULT NOW(),
  UNIQUE KEY uk_assessment_member (assessment_id, member_id),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

#### 评估结果如何汇入人资画像

```
评估完成
    │
    ▼
AI 汇总评分 + 生成摘要
    │
    ├──→ assessment_results 表(评估结果独立存储)
    │
    └──→ employee_assessments 表(写入人资画像)
         ├── 更新胜任力指标(技术/协作/领导力)
         ├── 更新综合评分(加权平均)
         ├── 更新能力标签(从评估中提取)
         └── 更新评估摘要

数据源标记:
  data_sources: [
    {type: 'project_review', project: 'Q2 营销', score: 4.3},
    {type: '360', period: '2026-Q2', score: 4.1},
    {type: 'self_assessment', period: '2026-Q2', score: 3.9}
  ]
```

#### Skill 清单

```

todo-board-assess:
  - "Q2 项目结束了,发个复盘评估" → 创建评估 + 分配任务
  - "发 360 评估,技术部所有人" → 批量创建评估任务
  - "提醒还没交评估的人" → 发送催办通知
  - "Q2 评估结果怎么样?" → 查评估汇总
  - "小王的评估历史" → 查个人评估记录
  - "出一份部门评估报告" → 批量评估报告

自动流程:
  - 项目状态变为 archived → 自动触发项目复盘评估
  - 每季度初 → 自动推送能力自评
  - 评估截止前 3 天 → 自动提醒未提交的人
  - 全部提交后 → AI 自动汇总 + 写入人资画像
```

---

## 五、认证与权限

### 5.1 认证

```
登录方式:邮箱 + 密码
密码存储:bcrypt 哈希
会话管理:JWT Token(有效期 24h)
```

### 5.2 权限模型

两个维度:集团角色 × 项目角色

```
集团角色(全局):
  admin      → 一切权限
  dept_lead  → 管本部门、创建项目
  member     → 参与被分配的项目

项目角色(单项目):
  pm         → 管项目设置、成员、所有任务
  developer  → 创建/编辑/完成任务
  viewer     → 只读 + 评论
```

### 5.3 API 中间件

```
请求 → JWT 验证 → 提取 member_id → 查集团角色 → 查项目角色 → 执行
                     │
                     ├─ admin → 放行
                     ├─ dept_lead → 检查部门权限
                     └─ member → 检查项目角色
```

---

## 六、技术架构

### 6.1 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| AI 交互 | OpenClaw + Skills | 对话操作入口 |
| 后端 | Node.js + Express | API 服务 |
| 数据库 | MySQL 8.0 | 统一数据底座 |
| ORM | Prisma | 类型安全 + 迁移管理 |
| 前端 | Vanilla HTML/CSS/JS | 看板 + Wiki(轻量) |
| 认证 | JWT + bcrypt | 登录鉴权 |
| 实时 | Socket.io | 任务变更推送 |
| 部署 | PM2 + Nginx | 进程管理 + 反向代理 |

### 6.2 目录结构

```
todo-board/
├── server.js                  # 入口
├── prisma/
│   └── schema.prisma          # 数据模型
├── src/
│   ├── routes/
│   │   ├── auth.js            # 登录/注册
│   │   ├── projects.js        # 项目 CRUD
│   │   ├── tasks.js           # 任务 CRUD
│   │   ├── members.js         # 成员 CRUD
│   │   ├── meetings.js        # 会议 CRUD
│   │   ├── reports.js         # 日报 CRUD
│   │   ├── wiki.js            # Wiki CRUD
│   │   ├── hr.js              # 人资画像
│   │   ├── infra.js           # AI Infra
│   │   └── wecom.js           # 企微集成
│   ├── middleware/
│   │   ├── auth.js            # JWT 验证
│   │   └── permission.js      # 权限检查
│   ├── services/
│   │   ├── assessment.js      # 评估汇聚逻辑
│   │   ├── report-gen.js      # 日报生成逻辑
│   │   ├── meeting-ai.js      # 会议 AI 判断
│   │   └── sync.js            # 系统间数据同步
│   └── lib/
│       ├── db.js              # Prisma 客户端
│       └── utils.js           # 工具函数
├── public/
│   ├── index.html             # 仪表盘
│   ├── login.html             # 登录
│   ├── projects.html          # 项目列表
│   ├── project.html           # 项目看板 + Wiki
│   ├── meetings.html          # 会议日历
│   └── reports.html           # 我的日报
├── skills/
│   ├── todo-board-admin/SKILL.md
│   ├── todo-board-meeting/SKILL.md
│   ├── todo-board-report/SKILL.md
│   ├── todo-board-hr/SKILL.md
│   ├── todo-board-wiki/SKILL.md
│   ├── todo-board-notify/SKILL.md
│   └── todo-board-infra/SKILL.md
├── package.json
├── .env
├── .gitignore
├── README.md
└── CHANGELOG.md
```

### 6.3 部署架构(腾讯云)

```
┌─────────────────────────────────────────┐
│           腾讯云 CVM                      │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Nginx   │  │  Node.js │  │ MySQL  │ │
│  │  :443    │──│  PM2     │  │ 8.0    │ │
│  │  SSL     │  │  :3010   │  │ :3306  │ │
│  └──────────┘  └──────────┘  └────────┘ │
│                                          │
│  ┌──────────┐                            │
│  │  Redis   │  (可选,后续加)             │
│  │  :6379   │                            │
│  └──────────┘                            │
└─────────────────────────────────────────┘
        │
        ▼
  https://kyochen.art/todo-board/
```

---

## 七、OpenClaw Skill 总览

```
用户说 ──→ OpenClaw 路由
              │
              ├── todo-board-admin    → 项目/成员/任务管理
              ├── todo-board-meeting  → 会议判断/发起/纪要
              ├── todo-board-report   → 日报/周报/月报
              ├── todo-board-notify   → 提醒/通知/推送
              ├── todo-board-hr       → 人资画像/评估
              ├── todo-board-assess   → 人才评估/分发/汇总
              ├── todo-board-wiki     → 项目文档管理
              └── todo-board-infra    → AI 用量/Key/Skill
```

---

## 八、不碰的边界

| 做 | 不做(留给 OA/专业系统) |
|----|------------------------|
| 项目管理 | 流程审批 |
| 会议管理 | 考勤打卡 |
| 日报/周报 | 薪酬计算 |
| 人资画像 | 招聘管理 |
| 人才评估 | 合同管理 |
| Wiki 文档 | 财务系统 |
| AI 基础设施 | 正式绩效评估(HR 做) |

---

## 九、与 v1 开源版的关系

- v1 继续维护(单项目、SQLite、无登录、MIT 协议)
- v2 是企业版(五系统、MySQL、登录、Skill 驱动)
- 代码复用:核心看板逻辑从 v1 fork
- 开源社区:v1 作为入口引流,v2 作为商业版
