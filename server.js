const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.TODO_PORT || 3010;
const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

// Ensure tables exist
db.exec('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description TEXT DEFAULT "",notes TEXT DEFAULT "",column_name TEXT DEFAULT "todo",priority TEXT DEFAULT "normal",category TEXT DEFAULT "",tags TEXT DEFAULT "",created_at TEXT DEFAULT "",updated_at TEXT DEFAULT "",started_at TEXT DEFAULT NULL,completed_at TEXT DEFAULT NULL,due_date TEXT DEFAULT NULL)');
db.exec('CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT,todo_id INTEGER NOT NULL,author TEXT DEFAULT "user",content TEXT NOT NULL,created_at TEXT DEFAULT "",FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE)');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function now() { return new Date().toISOString().slice(0,16).replace('T',' '); }

// List
app.get('/api/todos', (req, res) => {
  const { column, category, q } = req.query;
  let sql = 'SELECT * FROM todos WHERE 1=1';
  const params = [];
  if (column) { sql += ' AND column_name = ?'; params.push(column); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (q) { sql += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)'; params.push('%'+q+'%','%'+q+'%','%'+q+'%'); }
  sql += " ORDER BY CASE priority WHEN 'high' THEN 0 ELSE 1 END, id DESC";
  const rows = db.prepare(sql).all(...params);
  const board = { todo: [], doing: [], done: [] };
  rows.forEach(r => { if (board[r.column_name]) board[r.column_name].push(r); });
  res.json(board);
});

app.get('/api/todos/:id', (req, res) => {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!todo) return res.status(404).json({ error: 'not found' });
  const comments = db.prepare('SELECT * FROM comments WHERE todo_id = ? ORDER BY id ASC').all(req.params.id);
  res.json({ ...todo, comments });
});

app.post('/api/todos', (req, res) => {
  const { title, description, notes, column_name, priority, category, tags, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const t = now();
  const col = column_name || 'todo';
  const info = db.prepare('INSERT INTO todos (title,description,notes,column_name,priority,category,tags,due_date,created_at,updated_at,started_at,completed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(title, description||'', notes||'', col, priority||'normal', category||'', tags||'', due_date||null, t, t,
      col==='doing'?t:null, col==='done'?t:null);
  res.json(db.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/todos/:id', (req, res) => {
  const id = req.params.id;
  const old = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!old) return res.status(404).json({ error: 'not found' });

  const allowed = ['title','description','notes','column_name','priority','category','tags','due_date'];
  const sets = ['updated_at = ?'];
  const vals = [now()];

  for (const [k,v] of Object.entries(req.body)) {
    if (allowed.includes(k)) { sets.push(k+' = ?'); vals.push(v); }
  }

  if (req.body.column_name && req.body.column_name !== old.column_name) {
    if (req.body.column_name === 'doing' && old.column_name === 'todo') {
      sets.push('started_at = ?'); vals.push(now());
    }
    if (req.body.column_name === 'done') {
      sets.push('completed_at = ?'); vals.push(now());
      if (!old.started_at) { sets.push('started_at = ?'); vals.push(now()); }
    }
    if (req.body.column_name === 'todo') {
      sets.push('started_at = NULL', 'completed_at = NULL');
    }
  }

  vals.push(id);
  db.prepare('UPDATE todos SET '+sets.join(', ')+' WHERE id = ?').run(...vals);
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  const comments = db.prepare('SELECT * FROM comments WHERE todo_id = ? ORDER BY id ASC').all(id);
  res.json({ ...todo, comments });
});

app.delete('/api/todos/:id', (req, res) => {
  db.prepare('DELETE FROM comments WHERE todo_id = ?').run(req.params.id);
  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/todos/:id/comments', (req, res) => {
  const { content, author } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  db.prepare('INSERT INTO comments (todo_id, author, content, created_at) VALUES (?,?,?,?)').run(req.params.id, author||'user', content, now());
  db.prepare('UPDATE todos SET updated_at = ? WHERE id = ?').run(now(), req.params.id);
  res.json(db.prepare('SELECT * FROM comments WHERE todo_id = ? ORDER BY id ASC').all(req.params.id));
});

app.get('/api/categories', (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM todos WHERE category != '' ORDER BY category").all();
  res.json(rows.map(r => r.category));
});

app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT count(*) as c FROM todos').get().c;
  const todo = db.prepare("SELECT count(*) as c FROM todos WHERE column_name='todo'").get().c;
  const doing = db.prepare("SELECT count(*) as c FROM todos WHERE column_name='doing'").get().c;
  const done = db.prepare("SELECT count(*) as c FROM todos WHERE column_name='done'").get().c;
  const overdue = db.prepare("SELECT count(*) as c FROM todos WHERE due_date IS NOT NULL AND due_date < date('now','localtime') AND column_name != 'done'").get().c;
  res.json({ total, todo, doing, done, overdue });
});

app.listen(PORT, '0.0.0.0', () => console.log('Todo Board v1.0 on http://0.0.0.0:' + PORT));
