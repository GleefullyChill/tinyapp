//checking user ID requires bcrypt
const bcrypt = require('bcrypt');

//generates a random string of 6 characters
const generateRandomString = function() {
  let str = "";
  for (let i = 0; i < 6; i++) {
    let char = Math.random() * 61;
    char = Math.floor(char);
    if (char < 10) {
      str += char;
    } else if (char > 35) {
      char = String.fromCharCode(char + 29);
      str += char;
    } else {
      char = String.fromCharCode(char + 87);
      str += char;
    }
  }
  return str;
};
//check email, password against user information and return user
const checkUserIdByEmail = function(database, email, password) {
  //go through each of the ids
  for (const user in database) {
    //check emails validity, also makes certain that that is the right password to compare
    if (email === database[user].email) {
      //allows for a email only check that returns undefined, not id
      if (!password) return undefined;
      //returns id for use in cookie validation
      else if (bcrypt.compareSync(password, database[user].password)) return user;
    }
  }
  return false;
};
//uses cookie data to check which urls have been created by the logged in user
const urlsForUser = function(id, database) {
  const urls = {};
  //loop through and get each shortURL/longURL pair
  for (const shortURL in database) {
    if (database[shortURL]['id'] === id) {
      urls[shortURL] = database[shortURL].longURL;
      urls.date = {
        [shortURL]: database[shortURL].date,
        
      }
    }
  }
  return urls;
};

module.exports = {
  generateRandomString,
  checkUserIdByEmail,
  urlsForUser
};