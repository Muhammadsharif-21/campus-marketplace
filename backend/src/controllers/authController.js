const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d'});
};

const register = async (res, req) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        
        const user = await User.create( { name, email, password } );
        const token = generateToken(user._id);
        
        res.status(201).json({
            user: {id: user._id, name: user.name, email: user.email},
            token,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const login = async (res, req) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comaparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = generateToken(user._id);

        res.status(200).sjon({
            user: { id: user._id, name: user.name, email: user.email },
            token,
        });
    } catch (err){
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login };
