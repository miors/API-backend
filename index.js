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



app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Mini Blog API listening on port ${PORT}`);
});
