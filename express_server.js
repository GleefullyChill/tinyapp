const PORT = 4321;

//PATHS to files would go here
const { generateRandomString, checkUserIdByEmail, urlsForUser} = require('./helpers');
//use node_modules dependencies
const express = require('express');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const cookieSession = require('cookie-session');


//MiddleWare Functionality

const morganDev = morgan('dev');
const app = express();
app.use(morganDev);
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'sessionBant',
  keys: ['thewayisagreatsongaboutroadasisstedsuicide','P4bWnjki8842&lM']
}));
app.set('view engine', 'ejs');

//databases should be moved to a separate file

//holds data on urls and their respective short URLS
const urlDatabase = {
};
//holds user information, including username, email, and password
//id's inside do not work anymore as they are not stored as hashes
//can allow for these users to re-register, potentially
const users = {
};

//Paths for get requests
//an empty homepage, redirect or add the header, at least
app.get("/", (req, res) => {
  if (req.session.id) res.redirect('/urls');
  res.redirect("/login");
});
//a place to browse the short URLs and where they lead
app.get("/urls", (req, res) => {
  if (!req.session.id) res.status(403).send('403 Access Forbidden:  Please Login to see your TinyApp URLs');
  const urls = urlsForUser(req.session.id, urlDatabase);
  const templateVars = {
    id: req.session.id,
    urls,
    users
  };
  res.render('urls_index', templateVars);
});
//create a new short URL here
app.get("/urls/new", (req, res) => {
  if (!req.session.id) return res.redirect('/login');
  const templateVars = {
    id: req.session.id,
    users
  };
  res.render("urls_new", templateVars);
});
//an endpoint for a registration page, if logged in, send to /urls
app.get("/registration", (req, res) => {
  if (req.session.id) res.redirect('/urls');
  const templateVars = {
    id: req.session.id,
    users
  };
  res.render("user_register", templateVars);
});
app.get("/login", (req, res) => {
  if (req.session.id) res.redirect('/urls');
  const templateVars = {
    id: req.session.id,
    users
  };
  res.render("user_login", templateVars);
});
//redirects the shortURL from its respective /url to the corresponding web addreess
app.get("/u/:shortURL", (req, res) => {
  //if the URL has a valid link, send the visitor along
  if (urlDatabase[req.params.shortURL] === undefined) res.status(400).send('400 Error in Data:  This TinyApp URL no longer exists, please contact creator of the URL, or admin');
  else {
    urlDatabase[req.params.shortURL].uses++;
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});
//where the details of the shorturls lives, including a way to edit where they go
app.get("/urls/:shortURL", (req, res) => {
  const urls = urlsForUser(req.session.id, urlDatabase);
  if (!urls[req.params.shortURL]) res.status(404).send('40 Resource Not Found:  That URL is not owned by this user, please login to the relevant user, or contact admin');
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    id: req.session.id,
    users,
    urls
    
  };//longURL/* What goes here? */ };
  res.render("urls_show", templateVars);
});

//Paths fo POST requests
//after creating a new shortURL it redirects to the shorURL's respective /url
app.post("/urls", (req, res) => {
  if (!req.session.id) res.status(400).send('400 Error in Data:  Please Login or Register to create a new TinyApp URL');
  const shortURL = generateRandomString();
  const date = Date();
  urlDatabase[shortURL] = {
    uses: 0,
    longURL: req.body.longURL,
    id: req.session.id,
    date
  };
  res.redirect(`/urls/${shortURL}`);
});
//edit where the short url links to from the short url's description page
app.post("/urls/:shortURL/Edit", (req, res) => {
  //send an error, if not logged in
  if (!req.session.id) res.status(403).send('403 Access Forbidden:  Please Login to edit this TinyApp URL');
  //create an object of shortURL:longURL value pairs attatched to the user
  const urls = urlsForUser(req.session.id, urlDatabase);
  const shortURL = req.params.shortURL;
  const date = Date();
  //if shortURL is not attached to the user send an error
  if (urls[shortURL] === undefined) res.status(404).send('404 Resource Not Found:  That URL is not owned by this user, please login to the relevant user, or contact admin');
  urlDatabase[shortURL] = {
    uses: 0,
    longURL: req.body.longURL,
    id: req.session.id,
    date
  };
  res.redirect(`/urls/${shortURL}`);
});
//should delete the respective shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  //send an error if not logged in
  if (!req.session.id) res.status(403).send('403 Access Forbidden:  Please Login to delete this TinyApp URL');
  //create an object of shortURL:longURL value pairs attatched to the user
  const urls = urlsForUser(req.session.id, urlDatabase);
  //if shortURL is not attached to the user send an error
  if (urls[req.params['shortURL']] === undefined) res.status(404).send('404 Resource Not Found:  That URL is not owned by this user, please login to the relevant user, or contact admin');

  delete urlDatabase[req.params['shortURL']];
  res.redirect(`/urls`);
});
//a login POST
app.post("/login", (req, res) => {
  //clear cookies if site recognized cookie is held in the browser
  if (req.session.id) req.session = null;
  //check the users object for matching information and return the id
  const id = checkUserIdByEmail(users, req.body.user_email, req.body.password);
  if (id) {
    //log in the cookie and redirect ot /urls
    req.session.id = id;
    res.redirect('/urls');
    //if id returns false or undefined, send forbidden status
  } else res.status(403).send('403 Access Forbidden:  Sorry that email and password do not match our records');
});
//a logout POST
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});
//Register a user to the browser for now
app.post("/registration/create", (req, res) => {
  const id = generateRandomString();
  //if user is logged in, they cannot create a new login
  if (users.id) res.redirect('/urls');
  //if registration is not filled out, send error
  else if (!req.body.user_email || !req.body.password) res.status(400).send('400 Error in Data:  Please fill both the email address and password fields');
  //if email is in use, send error
  else if (checkUserIdByEmail(users, req.body.user_email) === undefined) res.status(400).send('400 Error in Data:  Email already is in use, please seek admin help');
  //create a object named after the randoms string and put it inside the users object
  else {
    //hash the password
    bcrypt.genSalt(10)
      .then((salt) => {
        return bcrypt.hash(req.body.password, salt);
      })
      //create a new object in the users object, using the hashed password
      .then((password) => {
        users[id] = {
          email: req.body.user_email,
          id,
          password
        };
        //create a cookie for the user to skip logging in after registering and redirect to /urls
        req.session.id = id;
        res.redirect('/urls');
      });
  }
});


//Start the server

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}!`);
});