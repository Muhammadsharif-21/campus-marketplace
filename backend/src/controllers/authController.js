const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = await User.create({ name, email, password, phone: phone || '' });
        const token = generateToken(user._id);

        res.status(201).json({
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone || '' },
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { phone, name } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;

        await user.save();
        res.status(200).json({ id: user._id, name: user.name, email: user.email, phone: user.phone });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();

        res.status(200).json({
            message: 'Account verified successfully',
            email: user.email,
            resetToken: rawToken,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, name, phone, code, token, password } = req.body || {};
        const resetTokenOrCode = (token || code || req.params?.token || '').toString().trim();

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        let user = null;

        // Mode 1: Reset via token or code
        if (resetTokenOrCode) {
            const hashed = crypto.createHash('sha256').update(resetTokenOrCode).digest('hex');
            const query = {
                $or: [
                    { resetPasswordToken: hashed },
                    { resetPasswordToken: resetTokenOrCode }
                ],
                resetPasswordExpires: { $gt: Date.now() },
            };
            if (email) {
                query.email = email.trim().toLowerCase();
            }
            user = await User.findOne(query);
        }

        // Mode 2: Direct verification by email and registered name or phone
        if (!user && email) {
            const foundUser = await User.findOne({ email: email.trim().toLowerCase() });
            if (foundUser) {
                const providedName = (name || '').trim().toLowerCase();
                const registeredName = (foundUser.name || '').trim().toLowerCase();
                const providedPhone = (phone || '').replace(/\D/g, '');
                const registeredPhone = (foundUser.phone || '').replace(/\D/g, '');

                const isNameMatch = providedName && (
                    registeredName === providedName ||
                    registeredName.includes(providedName) ||
                    providedName.includes(registeredName)
                );

                const isPhoneMatch = providedPhone && registeredPhone && (
                    registeredPhone === providedPhone ||
                    registeredPhone.endsWith(providedPhone) ||
                    providedPhone.endsWith(registeredPhone)
                );

                if (isNameMatch || isPhoneMatch) {
                    user = foundUser;
                } else if (!providedName && !providedPhone) {
                    return res.status(400).json({
                        message: 'Please provide your registered full name to verify account ownership',
                    });
                } else {
                    return res.status(400).json({
                        message: 'Account verification failed: Name does not match our records for this email address',
                    });
                }
            } else {
                return res.status(404).json({ message: 'No account found with this email address' });
            }
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification. Please verify your details.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword };
