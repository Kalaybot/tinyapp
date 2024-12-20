const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Assert statement if equal/same
    assert.strictEqual(user.id, expectedUserID)
  });

  it('should return undefined for a non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    // Assert that the user is undefined for a non-existent email
    assert.isUndefined(user);
  });
});