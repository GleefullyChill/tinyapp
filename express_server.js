const PORT = 4321;

//PATHS to files would go here

//use node_modules dependencies
//const { signedCookies } = require('cookie-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const morgan = require('morgan');
const morganDev = morgan('dev');

//MiddleWare Functionality

const app = express();
app.use(morganDev);
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//Functions should be moved to a separate .js file

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
//check email against user information
const checkUserEmail = function(email) {
  for (const user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
};
//check password, maybe email, against user information
const checkUserCredentials = function(pasword, email) {
  for (const user in users) {
    if (pasword === users[user].pasword) {
      if (!email) return true;
      else if (email === users[user].email) return true;
    }
  }
  return false;
};
//databases should be moved to a separate file
//holds data on urls and their respective short URLS
const urlDatabse = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//holds user information, including username, email, and password
const users = {
  RandomeID: {
    id: 'RandomID',
    email: 'ipj@mt.g',
    password: 'jund4lyfe'
  },
  RandomID2: {
    id: 'RandomID2',
    email: 'no@mt.g',
    password: 'ISayNo'
  },
  RandomID3: {
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
  res.json(urlDatabse);
});
//unnecessary, but harmless
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//a place to browse the short URLs and where they lead, currently acts a starting/ending page
app.get("/urls", (req, res) => {
  const templateVars = {
    id: req.cookies["id"],
    id: req.cookies.id
  };
  res.render('urls_index', templateVars);
});
//create a new short URL here
app.get("/urls/new", (req, res) => {
  const templateVars = {
    id: req.cookies.id
  };
  res.render("urls_new", templateVars);
});
//an endpoint for a registration page, if logged in, send to /urls
app.get("/registration", (req, res) => {
  if (req.cookies.id) res.redirect('/urls');
  const templateVars = {
    id: req.cookies.id,
    urls: urlDatabse
  };
  res.render("user_register", templateVars);
});
//redirects the shortURL from its respective /url to the corresponding web addreess
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabse[req.params.shortURL];
  if (longURL === undefined) {
    res.redirect('/urls');
  } else {
    res.redirect(longURL);
  }
});
//where the details of the shorturls lives, including a way to edit where they go
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabse[req.params.shortURL],
    id: req.cookies.id
    
  };//longURL/* What goes here? */ };
  res.render("urls_show", templateVars);
});

//Paths fo POST requests
//after creating a new shortURL it redirects to the shorURL's respective /url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabse[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//edit where the short url links to from the short url's description page
app.post("/urls/:shortURL/Edit", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabse[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//should delete the respective shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabse[req.params['shortURL']];
  res.redirect(`/urls`);
});
//a login POST
app.post("/login", (req, res) => {
  if (checkUserCredentials(req.body.password, req.body.user_email)) {
    for(const key in users) {
      if (req.body.user_email === users[key].email) {
        res.cookie('id', users[key]);
      }
    }
  }
  res.redirect('/urls');
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
  if (!users.id) {
    //if registration is not filled out or email is already in use, send error
    if (!req.body.user_email || !req.body.password) {
      res.sendStatus(400);
    } else if (checkUserEmail(req.body.user_email)) {
      res.sendStatus(400);
    }
    users[id] = {
      id,
      email: req.body.user_email,
      password: req.body.password
    };
    res.cookie('id', req.body['id']);
    res.redirect('/urls');
    return;
  } else res.redirect('/registration');
});


//Start the server

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}!`);
});