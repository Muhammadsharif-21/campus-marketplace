const assert = require('assert');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const { forgotPassword, resetPassword } = require('./src/controllers/authController');

async function runTests() {
  console.log('--- Starting 6-Digit Email Code Auth Controller Tests ---');

  // Test 1: forgotPassword requires email
  {
    const req = { body: {} };
    let statusCode = null;
    let responseBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            responseBody = body;
          }
        };
      }
    };

    await forgotPassword(req, res);
    assert.strictEqual(statusCode, 400, 'Expected status 400 for missing email');
    assert.strictEqual(responseBody.message, 'Email is required');
    console.log('✓ Test 1 Passed: forgotPassword validates email presence');
  }

  // Test 2: forgotPassword returns 404 when user is not found
  {
    const originalFindOne = User.findOne;
    User.findOne = async () => null;

    const req = { body: { email: 'unknown@example.com' } };
    let statusCode = null;
    let responseBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            responseBody = body;
          }
        };
      }
    };

    await forgotPassword(req, res);
    assert.strictEqual(statusCode, 404, 'Expected status 404 for unknown user');
    assert.strictEqual(responseBody.message, 'No account found with this email address');
    console.log('✓ Test 2 Passed: forgotPassword returns 404 for unknown user');

    User.findOne = originalFindOne;
  }

  // Test 3: forgotPassword generates 6-digit code, sets expiry, and saves user
  let savedUser = null;
  let devCode = null;
  {
    const mockUser = {
      name: 'Test Student',
      email: 'student@example.com',
      resetPasswordToken: null,
      resetPasswordExpires: null,
      async save() {
        savedUser = this;
      }
    };

    const originalFindOne = User.findOne;
    User.findOne = async (query) => {
      if (query.email === 'student@example.com') {
        return mockUser;
      }
      return null;
    };

    const req = { body: { email: 'student@example.com' } };
    let statusCode = null;
    let responseBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            responseBody = body;
          }
        };
      }
    };

    await forgotPassword(req, res);
    assert.strictEqual(statusCode, 200, 'Expected status 200');
    assert(responseBody.devCode, 'Expected devCode in dev environment');
    devCode = responseBody.devCode;
    assert.match(devCode, /^\d{6}$/, 'Verification code must be exactly 6 digits');

    assert(savedUser, 'Expected user to be saved');
    assert(savedUser.resetPasswordToken, 'Expected resetPasswordToken on user');
    const expectedHash = crypto.createHash('sha256').update(devCode).digest('hex');
    assert.strictEqual(savedUser.resetPasswordToken, expectedHash, 'Token hash should match sha256 of 6-digit code');
    assert(savedUser.resetPasswordExpires > Date.now(), 'Token expires should be in the future');
    console.log('✓ Test 3 Passed: forgotPassword generates 6-digit code, hashes it, and saves user');

    User.findOne = originalFindOne;
  }

  // Test 4: resetPassword requires code
  {
    const req = { body: { email: 'student@example.com', password: 'newpassword123' } };
    let statusCode = null;
    let responseBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            responseBody = body;
          }
        };
      }
    };

    await resetPassword(req, res);
    assert.strictEqual(statusCode, 400, 'Expected status 400 for missing code');
    assert.strictEqual(responseBody.message, 'Verification code is required');
    console.log('✓ Test 4 Passed: resetPassword validates verification code presence');
  }

  // Test 5: resetPassword requires minimum 6 characters
  {
    const req = { body: { code: '123456', password: '123' } };
    let statusCode = null;
    let responseBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            responseBody = body;
          }
        };
      }
    };

    await resetPassword(req, res);
    assert.strictEqual(statusCode, 400, 'Expected status 400 for short password');
    assert.strictEqual(responseBody.message, 'Password must be at least 6 characters long');
    console.log('✓ Test 5 Passed: resetPassword enforces min password length');
  }

  // Test 6: resetPassword returns 400 if code is invalid or expired
  {
    const originalFindOne = User.findOne;
    User.findOne = async () => null;

    const req = { body: { email: 'student@example.com', code: '999999', password: 'newpassword123' } };
    let statusCode = null;
    let responseBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            responseBody = body;
          }
        };
      }
    };

    await resetPassword(req, res);
    assert.strictEqual(statusCode, 400, 'Expected status 400 for invalid code');
    assert.strictEqual(responseBody.message, 'Invalid or expired verification code');
    console.log('✓ Test 6 Passed: resetPassword rejects invalid/expired verification code');

    User.findOne = originalFindOne;
  }

  // Test 7: resetPassword successfully updates password with 6-digit code
  {
    const testUser = new User({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'oldPassword123',
    });
    const salt = await bcrypt.genSalt(10);
    testUser.password = await bcrypt.hash('oldPassword123', salt);

    const oldHashedPassword = testUser.password;
    testUser.resetPasswordToken = crypto.createHash('sha256').update(devCode).digest('hex');
    testUser.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    testUser.save = async function() {
      if (this.isModified('password')) {
        const s = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, s);
      }
    };

    const originalFindOne = User.findOne;
    User.findOne = async (query) => {
      const hashed = crypto.createHash('sha256').update(devCode).digest('hex');
      const matchesToken = query.$or.some((item) => item.resetPasswordToken === hashed);
      if (matchesToken) {
        return testUser;
      }
      return null;
    };

    const req = {
      body: {
        email: 'student@example.com',
        code: devCode,
        password: 'newSecurePassword456'
      }
    };
    let statusCode = null;
    let responseBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            responseBody = body;
          }
        };
      }
    };

    await resetPassword(req, res);
    assert.strictEqual(statusCode, 200, 'Expected status 200');
    assert.strictEqual(responseBody.message, 'Password has been reset successfully');
    assert.strictEqual(testUser.resetPasswordToken, undefined, 'resetPasswordToken should be cleared');
    assert.strictEqual(testUser.resetPasswordExpires, undefined, 'resetPasswordExpires should be cleared');
    assert.notStrictEqual(testUser.password, oldHashedPassword, 'Password should have changed');

    const isMatch = await testUser.comparePassword('newSecurePassword456');
    assert.strictEqual(isMatch, true, 'comparePassword should match new password');

    console.log('✓ Test 7 Passed: resetPassword validates 6-digit code and resets password');

    User.findOne = originalFindOne;
  }

  console.log('--- All 6-Digit Email Code Tests Passed Successfully! ---');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
