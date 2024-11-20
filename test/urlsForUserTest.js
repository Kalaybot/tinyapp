const { assert } = require('chai');
const { urlsForUser } = require('../helpers');

describe('urlsForUser', function() {

  it('should return urls that belong to the specified user', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Define expected output
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Call the function with userId 'user1'
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the user has no urls', function() {
    // Define test data with a user who has no URLs
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Call the function with userId 'user3' (user with no URLs)
    const result = urlsForUser('user3', urlDatabase);

    // Assert that the result is an empty object
    assert.deepEqual(result, {});
  });

  it('should return an empty object if there are no urls in the urlDatabase', function() {
    // Define an empty urlDatabase
    const urlDatabase = {};

    // Call the function with any userId
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result is an empty object
    assert.deepEqual(result, {});
  });

  it('should not return urls that do not belong to the specified user', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Call the function with userId 'user1'
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result does not include the URL belonging to 'user2'
    assert.notProperty(result, "9sm5xK");
  });

});
