# TodoBoard Skill — OpenClaw 待办管理

通过聊天管理 TodoBoard 待办事项。支持增删改查、提醒、批量操作。

## 前置条件

1. TodoBoard 已部署并运行（默认 http://localhost:3010）
2. 在 `TOOLS.md` 中记录你的 TodoBoard 地址，例如：
   ```
   ### TodoBoard
   - **地址**: http://localhost:3010
   ```

## API 调用方式

使用 `exec` + `curl` 调用 API：

```bash
# 查询所有待办
curl -s http://localhost:3010/api/todos | jq .

# 查询统计
curl -s http://localhost:3010/api/stats | jq .

# 创建待办
curl -s -X POST http://localhost:3010/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"写 README","description":"补充部署文档","priority":"high","category":"开源","due_date":"2026-04-25"}'

# 更新待办（改状态）
curl -s -X PUT http://localhost:3010/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"column_name":"done"}'

# 添加评论
curl -s -X POST http://localhost:3010/api/todos/1/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"已完成初稿","author":"yoyo"}'

# 删除待办
curl -s -X DELETE http://localhost:3010/api/todos/1
```

## 意图识别指南

用户说法 → 操作映射：

| 用户说 | 操作 |
|--------|------|
| "加个待办 / 新增任务 / 记一下" | `POST /api/todos` |
| "看看待办 / 有什么没做的 / 待办列表" | `GET /api/todos` + 筛选 column=todo |
| "看看进度 / 在做的" | `GET /api/todos` + 筛列 |
| "#3 做完了 / 标记完成" | `PUT /api/todos/:id {column_name:"done"}` |
| "#3 开始做" | `PUT /api/todos/:id {column_name:"doing"}` |
| "有没有过期的" | `GET /api/stats` → 检查 overdue |
| "删掉 #5" | `DELETE /api/todos/:id` |
| "改一下 #2 的描述" | `PUT /api/todos/:id` |

## 参数提取

从用户消息中提取：
- **title**: 任务标题（必须）
- **description**: 需求描述
- **notes**: 备注/方案
- **priority**: `high` 或 `normal`（默认 normal）
- **category**: 分类（如"开发"、"运营"）
- **tags**: 标签（逗号分隔）
- **due_date**: 日期（"明天"→+1天，"下周一"→计算，"4月30日"→2026-04-30）

## 回复格式

查询结果用简洁列表展示：

```
📋 待办 (3):
🔴 #5 [高优] 写部署文档 — 开源 — 明天截止
⚪ #4 更新 README — 开源
⚪ #3 整理 changelog

🔄 进行中 (1):
🟡 #2 前端重构 — 前端

✅ 今日完成 (2):
🟢 #1 搭建项目 — 初始化
🟢 #0 写 SKILL.md — 开源
```

统计摘要：
```
📊 总计 6 | 待办 3 | 进行中 1 | 完成 2 | 过期 0
```

## 定时提醒（Cron）

建议配置每日检查过期任务：

```json
{
  "name": "todo-reminder",
  "schedule": "0 9 * * *",
  "task": "检查 TodoBoard 过期任务：curl -s http://localhost:3010/api/stats | jq .overdue。如果 overdue > 0，列出过期任务并通知 kyo。"
}
```

## 注意事项

- ID 是纯数字，用户说 "#3" 对应 id=3
- 创建时 title 必填，其他可选
- 状态流转自动记录时间戳（started_at / completed_at）
- 评论的 author 默认 "user"，OpenClaw 发的用 "yoyo"
- 搜索用 `?q=关键词`，会匹配 title/description/tags
