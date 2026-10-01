const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();


//Middleware
app.use(cors());
app.use(express.json());


//Basic test route
app.get('/', (req, res) => {
    res.send('Campus Marketplace API is running');
});



mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error('MongoDB connection error:', err));