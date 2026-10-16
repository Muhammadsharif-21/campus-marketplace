const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded= jwt.verify(token, process.env.JWT_SECRET);  
            
            req.user = await User.findById(decoded.id).select('-password');

            next();

        } catch (err) 
        {
            res.status(401).json({ message: 'Not authorized, token failed' })
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no taken' });
    }
};

module.exports = protect;


// Middleware is code that runs in between the request arriving and the actual route logic running and it needs next to say "okay, move on to whatever comes after me"