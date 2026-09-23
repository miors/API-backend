let express = require('express');
let app = express();

const { Pool } = require('pg');
require('dotenv').config();
const cors = require('cors');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());

// console.log(process.env.DATABASE_URL)

// // Allow your frontend port to access this API
// app.use(cors({ origin: 'http://localhost:5173' })); 

// --
// Routes here later
// --
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT id, username FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT posts.id, posts.title, posts.content, posts.created_at, users.username AS author
       FROM posts JOIN users ON posts.user_id = users.id
       ORDER BY posts.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.post('/posts', async (req, res) => {
    const { title, content, author, user_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO posts (title, content, author, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, author, user_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});




app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Mini Blog API listening on port ${PORT}`);
});
