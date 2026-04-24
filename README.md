# TodoBoard

A lightweight, dark-themed task board built with Express + better-sqlite3. Zero frontend framework — just vanilla HTML/CSS/JS.

## Features

- **3-column Kanban** — Todo / In Progress / Done with drag-and-drop
- **List view** — Table layout for scanning all tasks
- **Search & filter** — By keyword or category
- **Detail panel** — Requirements, notes/solution, comments, timeline
- **Auto timestamps** — `started_at` / `completed_at` recorded on status change
- **Priority & tags** — High priority highlighting, category pills
- **Comments** — Per-task discussion thread
- **Responsive** — Works on mobile

## Quick Start

```bash
git clone https://github.com/cwyhkyochen-a11y/todo-board.git
cd todo-board
npm install
npm start
```

Open http://localhost:3010

### Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `TODO_PORT` | `3010` | Server port |

## Deploy with PM2

```bash
pm2 start server.js --name todo-board
pm2 save
```

Put it behind Nginx/Caddy with a subpath if you like — the app uses relative URLs, so it just works.

## OpenClaw Integration

This project ships with an [OpenClaw](https://github.com/openclaw/openclaw) skill that lets you manage todos from chat.

### Install the skill

```bash
# Copy the skill to your OpenClaw workspace
cp -r skills/todo-board ~/.openclaw/workspace/skills/
```

### What you can do

- **Add todos from chat**: "帮我加个待办：明天之前把 README 写完"
- **List active tasks**: "看看还有什么没做的"
- **Mark as done**: "把 #3 标记完成"
- **Get reminders**: Set up a cron job to check for overdue tasks

See [`skills/todo-board/SKILL.md`](skills/todo-board/SKILL.md) for the full skill spec.

### Cron reminder example

Add to your OpenClaw config to get daily overdue reminders:

```json
{
  "cron": {
    "jobs": [{
      "name": "todo-overdue-check",
      "schedule": "0 9 * * *",
      "task": "Check http://localhost:3010/api/stats for overdue tasks. If overdue > 0, message me on Feishu with the list."
    }]
  }
}
```

## Tech Stack

- **Backend**: [Express](https://expressjs.com) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Frontend**: Vanilla HTML/CSS/JS (no framework, no build step)
- **Database**: SQLite (single file, zero config)

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/todos` | List all (supports `?q=`, `?category=`, `?column=`) |
| `GET` | `/api/todos/:id` | Get one (includes comments) |
| `POST` | `/api/todos` | Create |
| `PUT` | `/api/todos/:id` | Update |
| `DELETE` | `/api/todos/:id` | Delete |
| `POST` | `/api/todos/:id/comments` | Add comment |
| `GET` | `/api/categories` | List categories |
| `GET` | `/api/stats` | Stats (total/todo/doing/done/overdue) |

## License

MIT
