const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./src/routes/authRoutes');
const listingRoutes = require('./src/routes/listingRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const userRoutes = require('./src/routes/userRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

//Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean),
}));
app.get("/health", (req, res) => res.json({ ok: true }));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
});
app.use('/api/auth', authLimiter);

app.set('trust proxy', 1);
app.use(helmet());
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

//Basic test route
app.get('/', (req, res) => {
    res.send('Campus Marketplace API is running');
});


if (require.main === module) {
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error('MongoDB connection error:', err));
}

module.exports = app;