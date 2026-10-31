const assert = require('assert');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const { forgotPassword, resetPassword } = require('./src/controllers/authController');

async function runTests() {
  console.log('--- Starting Forgot/Reset Password Controller Tests ---');

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

  // Test 3: forgotPassword sets token and expiry and returns resetToken
  let savedUser = null;
  let generatedToken = null;
  {
    const mockUser = {
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
    assert(responseBody.resetToken, 'Expected resetToken in response');
    generatedToken = responseBody.resetToken;

    assert(savedUser, 'Expected user to be saved');
    assert(savedUser.resetPasswordToken, 'Expected resetPasswordToken on user');
    const expectedHash = crypto.createHash('sha256').update(generatedToken).digest('hex');
    assert.strictEqual(savedUser.resetPasswordToken, expectedHash, 'Token hash should match sha256 of raw token');
    assert(savedUser.resetPasswordExpires > Date.now(), 'Token expires should be in the future');
    console.log('✓ Test 3 Passed: forgotPassword generates token, sets expiry, and saves user');

    User.findOne = originalFindOne;
  }

  // Test 4: resetPassword requires token
  {
    const req = { params: {}, body: { password: 'newpassword123' } };
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
    assert.strictEqual(statusCode, 400, 'Expected status 400 for missing token');
    console.log('✓ Test 4 Passed: resetPassword validates token presence');
  }

  // Test 5: resetPassword requires minimum 6 characters
  {
    const req = { params: { token: 'some-token' }, body: { password: '123' } };
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

  // Test 6: resetPassword returns 400 if token is invalid or expired
  {
    const originalFindOne = User.findOne;
    User.findOne = async () => null;

    const req = { params: { token: 'invalid-or-expired-token' }, body: { password: 'newpassword123' } };
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
    assert.strictEqual(statusCode, 400, 'Expected status 400 for invalid token');
    assert.strictEqual(responseBody.message, 'Password reset token is invalid or has expired');
    console.log('✓ Test 6 Passed: resetPassword rejects invalid/expired token');

    User.findOne = originalFindOne;
  }

  // Test 7: resetPassword successfully updates password and clears reset fields
  {
    const testUser = new User({
      name: 'Test Student',
      email: 'test@student.edu',
      password: 'oldPassword123',
    });
    const salt = await bcrypt.genSalt(10);
    testUser.password = await bcrypt.hash('oldPassword123', salt);

    const oldHashedPassword = testUser.password;
    testUser.resetPasswordToken = crypto.createHash('sha256').update(generatedToken).digest('hex');
    testUser.resetPasswordExpires = new Date(Date.now() + 3600000);

    // Mock save to trigger the pre('save') logic without requiring an active MongoDB connection
    testUser.save = async function() {
      if (this.isModified('password')) {
        const s = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, s);
      }
    };

    const originalFindOne = User.findOne;
    User.findOne = async () => testUser;

    const req = { params: { token: generatedToken }, body: { password: 'newSecurePassword456' } };
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

    // Verify comparePassword works with the new password
    const isMatch = await testUser.comparePassword('newSecurePassword456');
    assert.strictEqual(isMatch, true, 'comparePassword should match new password');
    const isOldMatch = await testUser.comparePassword('oldPassword123');
    assert.strictEqual(isOldMatch, false, 'comparePassword should not match old password');

    console.log('✓ Test 7 Passed: resetPassword updates password, clears tokens, and pre-save hashes work');

    User.findOne = originalFindOne;
  }

  console.log('--- All Forgot & Reset Password Backend Tests Passed Successfully! ---');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
