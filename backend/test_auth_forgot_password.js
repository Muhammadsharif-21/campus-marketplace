const assert = require('assert');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const { forgotPassword, resetPassword } = require('./src/controllers/authController');

async function runTests() {
  console.log('--- Starting Auth Password Reset Tests (No Nodemailer) ---');

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

  // Test 3: forgotPassword generates secure resetToken and saves user
  let generatedToken = null;
  {
    const mockUser = {
      name: 'Test Student',
      email: 'student@example.com',
      resetPasswordToken: null,
      resetPasswordExpires: null,
      async save() {
        // saved
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
    assert(responseBody.resetToken, 'Expected resetToken in response');
    generatedToken = responseBody.resetToken;

    assert(mockUser.resetPasswordToken, 'Expected resetPasswordToken on user');
    const expectedHash = crypto.createHash('sha256').update(generatedToken).digest('hex');
    assert.strictEqual(mockUser.resetPasswordToken, expectedHash, 'Token hash should match sha256');
    assert(mockUser.resetPasswordExpires > Date.now(), 'Token expires should be in future');
    console.log('✓ Test 3 Passed: forgotPassword generates reset token and saves hashed token on user');

    User.findOne = originalFindOne;
  }

  // Test 4: resetPassword enforces minimum 6 characters
  {
    const req = { body: { email: 'student@example.com', name: 'Test Student', password: '123' } };
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
    console.log('✓ Test 4 Passed: resetPassword enforces min password length');
  }

  // Test 5: resetPassword returns 404 if email not found during direct verification
  {
    const originalFindOne = User.findOne;
    User.findOne = async () => null;

    const req = { body: { email: 'notfound@example.com', name: 'Test Student', password: 'newpassword123' } };
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
    assert.strictEqual(statusCode, 404, 'Expected status 404 for non-existent user');
    console.log('✓ Test 5 Passed: resetPassword returns 404 when email not found');

    User.findOne = originalFindOne;
  }

  // Test 6: resetPassword rejects direct verification when name does not match
  {
    const mockUser = {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'oldPassword123',
    };

    const originalFindOne = User.findOne;
    User.findOne = async () => mockUser;

    const req = { body: { email: 'alex@example.com', name: 'Wrong Person', password: 'newpassword123' } };
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
    assert.strictEqual(statusCode, 400, 'Expected status 400 when name mismatch');
    assert(responseBody.message.includes('Account verification failed'), 'Expected verification failed message');
    console.log('✓ Test 6 Passed: resetPassword rejects when registered name does not match');

    User.findOne = originalFindOne;
  }

  // Test 7: resetPassword succeeds via direct account verification (email + name)
  {
    const testUser = new User({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'oldHashedPassword',
    });

    testUser.save = async function() {
      if (this.isModified('password')) {
        const s = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, s);
      }
    };

    const originalFindOne = User.findOne;
    User.findOne = async () => testUser;

    const req = {
      body: {
        email: 'alex@example.com',
        name: 'Alex Johnson',
        password: 'brandNewSecurePassword99'
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

    const matches = await testUser.comparePassword('brandNewSecurePassword99');
    assert.strictEqual(matches, true, 'comparePassword should match new password');
    console.log('✓ Test 7 Passed: resetPassword successfully updates password via direct name verification');

    User.findOne = originalFindOne;
  }

  // Test 8: resetPassword succeeds via token
  {
    const token = 'my-valid-reset-token';
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const testUser = new User({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'oldHashedPassword',
      resetPasswordToken: hashed,
      resetPasswordExpires: new Date(Date.now() + 60000),
    });

    testUser.save = async function() {
      if (this.isModified('password')) {
        const s = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, s);
      }
    };

    const originalFindOne = User.findOne;
    User.findOne = async (query) => {
      const match = query.$or?.some(item => item.resetPasswordToken === hashed);
      if (match) return testUser;
      return null;
    };

    const req = {
      body: {
        token,
        password: 'tokenResetPassword123'
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

    const matches = await testUser.comparePassword('tokenResetPassword123');
    assert.strictEqual(matches, true, 'comparePassword should match new password');
    console.log('✓ Test 8 Passed: resetPassword successfully updates password via reset token');

    User.findOne = originalFindOne;
  }

  console.log('--- All Tests Passed Successfully! ---');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
