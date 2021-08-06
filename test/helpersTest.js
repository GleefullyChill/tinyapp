const { assert, should } = require('chai');
const bcrypt = require('bcrypt');

const { checkUserIdByEmail, urlsForUser, generateRandomString } = require('../helpers.js');
const password = 'testpassword';
const hashPassword = bcrypt.hashSync(password, 10);
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: hashPassword
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  'userRandomID3': {
    id: 'RandomID',
    email: 'ipj@mt.g',
    password: 'jund4lyfe'
  },
  'userRandomID4': {
    id: 'RandomID2',
    email: 'no@mt.g',
    password: 'ISayNo'
  },
  'userRandomID5': {
    id: 'RandomID3',
    email: 'bio@mt.g',
    password: 'biotech'
  }
};
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    id: 'userRandomID'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    id: 'user2RandomID'
  }
};

describe('checkUserIdByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkUserIdByEmail(testUsers, 'user@example.com', 'testpassword')
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return false if a non-existent email is used', function() {
    const user = checkUserIdByEmail(testUsers, 'useless@example.com', 'testpassword')
    const expectedOutput = false;
  })
  it('should return undefined if there is a valid email, but no password passed', function() {
    const user = checkUserIdByEmail(testUsers, 'user@example.com')
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
describe('GenerateRandomString', function() {
  it('should not output the same string', function() {
    const first = generateRandomString();
    const second = generateRandomString();
    const third = generateRandomString();
    const fourth = generateRandomString();
    const arr = [second, third, fourth];
    assert.notDeepInclude(arr, first)
  })
})
describe('UrlsForUser', function() {
  it('should return an empty object if the id doesn\'t exist', function() {
    const user = 'fakeUser';
    const database = urlDatabase;
    assert.deepEqual(urlsForUser(user, database), {})
  });
  it('should return an object with a shortURL:longURL value pairs', function() {
    const user = 'user2RandomID';
    const database = urlDatabase;
    const actual = urlsForUser(user, database);
    const expectedOutput = { "9sm5xK": "http://www.google.com" }
    assert.deepEqual(actual, expectedOutput)
  })
})