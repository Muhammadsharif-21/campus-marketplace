const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

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

        // Generate 6-digit numeric verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCode = crypto.createHash('sha256').update(verificationCode).digest('hex');

        user.resetPasswordToken = hashedCode;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        // Send verification code via email
        await sendEmail({
            to: user.email,
            subject: `${verificationCode} is your Campus Market reset code`,
            text: `Hello ${user.name},\n\nYour password reset code is: ${verificationCode}\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nCampus Market Team`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E5DEC9; border-radius: 12px; background-color: #FAF7F2;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #C85A32; margin: 0; font-size: 24px; font-weight: bold;">Campus Market</h2>
                        <p style="color: #8C7A6B; margin: 4px 0 0 0; font-size: 13px;">Student Exchange Network</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid #E5DEC9;">
                        <p style="color: #2C221E; font-size: 15px; margin-top: 0;">Hello <strong>${user.name}</strong>,</p>
                        <p style="color: #2C221E; font-size: 14px; line-height: 1.5;">You requested to reset your password. Use the 6-digit code below to complete the reset:</p>
                        <div style="text-align: center; margin: 24px 0;">
                            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #C85A32; background-color: #FAF7F2; padding: 12px 24px; border-radius: 8px; border: 1px dashed #C85A32;">
                                ${verificationCode}
                            </span>
                        </div>
                        <p style="color: #8C7A6B; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
                            This code is valid for <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email.
                        </p>
                    </div>
                </div>
            `,
        });

        res.status(200).json({
            message: 'A 6-digit verification code has been sent to your email address.',
            email: user.email,
            devCode: process.env.EMAIL_USER ? undefined : verificationCode,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, token, password } = req.body || {};
        const resetCode = (code || token || req.params?.token || '').toString().trim();

        if (!resetCode) {
            return res.status(400).json({ message: 'Verification code is required' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

        const query = {
            $or: [
                { resetPasswordToken: hashedCode },
                { resetPasswordToken: resetCode }
            ],
            resetPasswordExpires: { $gt: Date.now() },
        };

        if (email) {
            query.email = email.trim().toLowerCase();
        }

        const user = await User.findOne(query);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
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
