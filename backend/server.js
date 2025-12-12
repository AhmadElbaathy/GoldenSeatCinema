const express = require('express');
const { Pool } = require('pg');
const amqp = require('amqplib');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION (Postgres)
const pool = new Pool({
    user: 'keycloak',      // Matches docker-compose
    host: 'localhost',
    database: 'keycloak',  // Matches docker-compose
    password: 'password',  // Matches docker-compose
    port: 5432,
});

// 2. RABBITMQ CONNECTION
let channel;
async function connectRabbit() {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
        channel = await connection.createChannel();
        await channel.assertQueue('notifications');
        console.log("✅ Connected to RabbitMQ");
    } catch (error) {
        console.error("RabbitMQ Error:", error);
    }
}
connectRabbit();

// --- API ENDPOINTS ---

// GET: List all movies
app.get('/api/movies', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Get Booked Seats (Real Logic)
// GET: Get Booked Seats (FILTERED by Movie and Time)
app.get('/api/bookings', async (req, res) => {
    const { movie, time } = req.query; // <--- Get filters from URL

    try {
        let query = 'SELECT seat_number FROM bookings';
        let params = [];

        // If frontend asks for specific movie/time, filter the SQL
        if (movie && time) {
            query += ' WHERE movie_title = $1 AND show_time = $2';
            params = [movie, time];
        }

        const result = await pool.query(query, params);
        const bookedSeats = result.rows.map(row => row.seat_number);
        
        res.json(bookedSeats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Create a Booking
app.post('/api/bookings', async (req, res) => {
    // 1. Accept orderId from frontend
    const { user, email, movie, seats, time, orderId } = req.body;
    
    try {
        // A. Save to Database (With Order ID)
        for (const seat of seats) {
            await pool.query(
                'INSERT INTO bookings (user_name, email, movie_title, seat_number, show_time, order_id) VALUES ($1, $2, $3, $4, $5, $6)',
                [user, email, movie, seat, time, orderId]
            );
        }

        // B. Publish Event to RabbitMQ
        const eventData = {
            event: 'BOOKING_CONFIRMED',
            user,
            email,
            movie,
            seats,
            time,
            orderId, // <--- Send to Email Worker
            timestamp: new Date().toISOString()
        };
        
        if (channel) {
            channel.sendToQueue('notifications', Buffer.from(JSON.stringify(eventData)));
            console.log("📨 Event sent to RabbitMQ:", eventData);
        }

        res.json({ success: true, message: "Booking processed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Booking Failed" });
    }
});

// DELETE: Cancel Booking (Refund Logic)
app.delete('/api/bookings', async (req, res) => {
    const { seats } = req.body;
    try {
        // Remove from DB
        for (const seat of seats) {
            await pool.query('DELETE FROM bookings WHERE seat_number = $1', [seat]);
        }
        res.json({ success: true, message: "Booking Cancelled" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch User's Personal Bookings (Now includes order_id)
app.get('/api/my-bookings', async (req, res) => {
    const { user } = req.query;
    try {
        // We select order_id too
        const result = await pool.query(
            'SELECT * FROM bookings WHERE user_name = $1 ORDER BY created_at DESC', 
            [user]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(3000, async () => {
    console.log("🚀 Booking Service running on port 3000");
    
    // Initialize DB Table if not exists
    const fs = require('fs');
    const sql = fs.readFileSync('./init.sql').toString();
    try {
        await pool.query(sql);
        console.log("✅ Database initialized");
    } catch(e) {
        console.log("DB Init Error (Ignore if tables exist)");
    }
});