const PORT = 4321;

//PATHS to files would go here

//use node_modules dependencies
//const { signedCookies } = require('cookie-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const cookieSession


//MiddleWare Functionality

const morganDev = morgan('dev');
const app = express();
app.use(morganDev);
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//Functions should be moved to a separate .js file
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
const checkIfUserID = function(email, password) {
  //go through each of the ids
  for (const user in users) {
    //check emails validity, also makes certain that that is the right password to compare
    if (email === users[user].email) {
      //allows for a email only check that returns undefined, not id
      if (!password) return undefined;
      //returns id for use in cookie validation
      else if (bcrypt.compareSync(password, users[user].password)) return user;
    }
  }
  return false;
};
//uses cookie data to check which urls have been created by the logged in user
const urlsForUser = function(id) {
  const urls = {};
  //loop through and get each shortURL/longURL pair
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL]['id'] === id) {
      urls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urls;
};
//databases should be moved to a separate file
//holds data on urls and their respective short URLS
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    id: 'RandomID'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    id: 'RandomID2'
  }
};
//holds user information, including username, email, and password
//id's inside do not work anymore as they are not stored as hashes
//can allow for these users to re-register, potentially
const users = {
  'RandomID': {
    id: 'RandomID',
    email: 'ipj@mt.g',
    password: 'jund4lyfe'
  },
  'RandomID2': {
    id: 'RandomID2',
    email: 'no@mt.g',
    password: 'ISayNo'
  },
  'RandomID3': {
    id: 'RandomID3',
    email: 'bio@mt.g',
    password: 'biotech'
  }
};

//Paths for get requests
//an empty homepage, redirect or add the header, at least
app.get("/", (req, res) => {
  res.send("This is your HOME page!");
});
//allows for a json of the urls in the database, add a login feature to hide
app.get("/urls.json", (req, res) => {

  res.json(urlDatabase);
});
// //unnecessary, but harmless
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//a place to browse the short URLs and where they lead, currently acts a starting/ending page
app.get("/urls", (req, res) => {
  const urls = urlsForUser(req.cookies.id);
  const templateVars = {
    id: req.cookies.id,
    urls,
    users
  };
  res.render('urls_index', templateVars);
});
//create a new short URL here
app.get("/urls/new", (req, res) => {
  const templateVars = {
    id: req.cookies.id,
    users
  };
  res.render("urls_new", templateVars);
});
//an endpoint for a registration page, if logged in, send to /urls
app.get("/registration", (req, res) => {
  if (req.cookies.id) res.redirect('/urls');
  const templateVars = {
    id: req.cookies.id,
    users
  };
  res.render("user_register", templateVars);
});
app.get("/login", (req, res) => {
  const templateVars = {
    id: req.cookies.id,
    users
  };
  res.render("user_login", templateVars);
});
//redirects the shortURL from its respective /url to the corresponding web addreess
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.redirect('/urls');
  } else {
    res.redirect(longURL);
  }
});
//where the details of the shorturls lives, including a way to edit where they go
app.get("/urls/:shortURL", (req, res) => {
  const urls = urlsForUser(req.cookies.id);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    id: req.cookies.id,
    users,
    urls
    
  };//longURL/* What goes here? */ };
  res.render("urls_show", templateVars);
});

//Paths fo POST requests
//after creating a new shortURL it redirects to the shorURL's respective /url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    id: req.cookies.id
  };
  res.redirect(`/urls/${shortURL}`);
});
//edit where the short url links to from the short url's description page
app.post("/urls/:shortURL/Edit", (req, res) => {
  const urls = urlsForUser(req.cookies.id);
  const shortURL = req.params.shortURL;
  if (urls[shortURL] === undefined) return res.sendStatus(403);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    id: req.cookies.id
  };
  res.redirect(`/urls/${shortURL}`);
});
//should delete the respective shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const urls = urlsForUser(req.cookies.id);
  if (urls[req.params['shortURL']] === undefined) return res.sendStatus(403);

  delete urlDatabase[req.params['shortURL']];
  res.redirect(`/urls`);
});
//a login POST
app.post("/login", (req, res) => {
  if (req.cookies.id) res.clearCookie('id');
  //check the users object for matching information and return the id
  const id = checkIfUserID(req.body.user_email, req.body.password);
  if (id) {
    //log in the cookie and redirect ot /urls
    res.cookie('id', id)
    res.redirect('/urls');
    //if id returns false or undefined, send forbidden status
  } else return res.sendStatus(403);
});
//a logout POST
app.post("/logout", (req, res) => {
  res.clearCookie('id');
  res.redirect('/urls');
});
//Register a user to the browser for now
app.post("/registration/create", (req, res) => {
  const id = generateRandomString();
  //if user is logged in, they cannot create a new login
  if (users.id) return res.redirect('/urls');
  //if registration is not filled out, send error
  else if (!req.body.user_email || !req.body.password) return res.sendStatus(400);
  //if email is in use, send error
  else if (checkIfUserID(req.body.user_email) === undefined) return res.sendStatus(400);
  //create a object named after the randoms string and put it inside the users object
  else {
    //hash the password
    bcrypt.genSalt(10)
      .then((salt) => {
        return bcrypt.hash(req.body.password, salt)
      })
      //create a new object in the users object, using the hashed password
      .then((password) => {
        users[id] = {
          email: req.body.user_email,
          id,
          password
        }
        console.log(users[id])
          //create a cookie for the user to skip logging in after registering and redirect to /urls
          res.cookie('id', id);
          res.redirect('/urls');
      })
  }
});


//Start the server

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}!`);
});