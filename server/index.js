'use strict';

const express = require('express');
const morgan = require('morgan'); // Package used for logging
const { body, param, validationResult } = require('express-validator');
const cors = require('cors');

const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local'); // username and password for login

const base32 = require('thirty-two');
const TotpStrategy = require('passport-totp').Strategy; // totp

const session = require('express-session'); // enable sessions

const dao = require('./dao'); // module for accessing the DB.
const userDao = require('./dao-user'); // module for accessing the user info in the DB

// init express
const app = express();
const port = 3001;

const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(morgan('dev')); // To register logging middleware 
app.use(express.json());  // To automatically decode incoming json

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize only the user id and store it in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

passport.use(new TotpStrategy(
  function (user, done) {
    // In case .secret does not exist, decode() will return an empty buffer
    return done(null, base32.decode(user.secret), 30);  // 30 = period of key validity
  })
);

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// custom middleware: check if a given request is coming from an admin logged in with TOTP
// due to how the APIs are structured not used, still left to show a way to check
// if correctly loggedIn with TOTP
function isTotp(req, res, next) {
  if (req.session.method === 'totp')
    return next();
  return res.status(401).json({ error: 'Missing TOTP authentication' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'o841h1Pt8JZdauGlNd',   // change this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

// This function is used to format express-validator errors as strings
const errorFormatter = ({ path, location, msg }) => {
  return `${location}[${path}]: ${msg}`;
};


/*** APIs ***/

// GET /api/posts 
// get all posts regardless of login
app.get('/api/posts',
  async (req, res) => {

    try {
      const result = await dao.retrievePosts();
      if (result.error)
        res.status(404).json(result);
      else {
        res.json(result);
      }
    } catch (err) {
      res.status(500).end();
    }
  });

// GET /api/comments 
// get all comments along with interesting flag for each user, since only for logged-in users
app.get('/api/comments', isLoggedIn,
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty())
      return res.status(422).json(errors.array());

    try {
      const result = await dao.retrieveComments(req.user.id);
      if (result.error)
        res.status(404).json(result);
      else {
        res.json(result);
      }
    } catch (err) {
      res.status(500).end();
    }
  });

// GET /api/comments/anon 
// get only anonymous comments
app.get('/api/comments/anon',
  async (req, res) => {

    try {
      const result = await dao.retrieveAnonymousComments();
      if (result.error)
        res.status(404).json(result);
      else {
        res.json(result);
      }
    } catch (err) {
      res.status(500).end();
    }
  });

// DELETE /api/posts/:id/delete 
// delete a post only if owner or admin
app.delete('/api/posts/:id/delete',
  [
    isLoggedIn, // this action can be performed by the owner of the resource or an admin, but in case of TOTP it is checked later
    param('id').isInt({ min: 1 }).withMessage('ID must be an integer bigger than 0')
  ],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty())
      return res.status(422).json(errors.array());

    try {
      const result = req.session?.method === 'totp' ? // if user is logged in with totp, no check on the ownership otherwise yes 
        await dao.deletePostAdmin(req.params.id) :
        await dao.deletePost(req.params.id, req.user.id);

      if (result.error)
        res.status(404).json(result);
      else
        res.status(200).json(result);
    } catch (err) {
      res.status(500).json(err ? { error: err.error } : { error: `Database error deleting the post` });
    }
  });

// DELETE /api/comments/:id/delete 
// delete a comment only if owner or admin
app.delete('/api/comments/:id/delete',
  [
    isLoggedIn, // this action can be performed by the owner of the resource or an admin, but in case of TOTP it is checked later
    param('id').isInt({ min: 1 }).withMessage('ID must be an integer bigger than 0')
  ],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty())
      return res.status(422).json(errors.array());

    try {
      const result = req.session?.method === 'totp' ? // if user is logged in with totp, no check on the ownership otherwise yes
        await dao.deleteCommentAdmin(req.params.id) :
        await dao.deleteComment(req.params.id, req.user.id);

      if (result.error)
        res.status(404).json(result);
      else
        res.status(200).json(result);
    } catch (err) {
      res.status(500).json(err ? { error: err.error } : { error: `Database error deleting the comment` });
    }
  });

// POST /api/posts/add 
// add a new post only if logged in
app.post('/api/posts/add',
  [
    isLoggedIn,
    body('title').trim().notEmpty().withMessage('Title should not be empty'),
    body('text').notEmpty().withMessage('Text cannot be empty'),
    body('max_comments').optional().isInt({ min: 0 }).withMessage('Max Comments must be positive integer')
  ], async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);;
    if (!errors.isEmpty())
      return res.status(422).json(errors.array());

    const post = {
      title: req.body.title,
      text: req.body.text,
      max_comments: req.body.max_comments === undefined ? null : req.body.max_comments
    };

    try {
      const newId = await dao.createPost(post, req.user.id);
      if (newId.error)
        res.status(404).json(newId);
      else
        res.status(201).json(newId);
    } catch (err) {
      res.status(500).json(err.code === 'SQLITE_CONSTRAINT' ? { error: 'A post with this title already exists.' } :
        { error: `Database error during the creation of the post` });
    }
  });

// POST /api/comments/add
// add a new comment, if logged in from the logged in user, otherwise anonymous
app.post('/api/comments/add',
  [
    body('postId').isInt({ min: 1 }).withMessage('ID must be an integer bigger than 0'),
    body('text').notEmpty().withMessage('Text cannot be empty')
  ], async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);;
    if (!errors.isEmpty())
      return res.status(422).json(errors.array());

    const comment = {
      postId: req.body.postId,
      text: req.body.text,
      interesting_count: 0,
    };

    try {
      const newId = await dao.createComment(comment, req.user ? req.user.id : undefined);
      if (newId.error)
        res.status(404).json(newId);
      else
        res.status(201).json(newId);
    } catch (err) {
      res.status(500).json(err ? { error: err.error } : { error: `Database error during the creation of the comment` });
    }
  });

// PUT /api/comments/:id/edit
// edit an existing comment, only if the owner or admin
app.put('/api/comments/:id/edit',
  [
    isLoggedIn, // this action can be performed by the owner of the resource or an admin, but in case of TOTP it is checked later
    param('id').isInt({ min: 1 }).withMessage('ID must be an integer bigger than 0'),
    body('text').notEmpty().withMessage('Text cannot be empty'),
  ], async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);;
    if (!errors.isEmpty())
      return res.status(422).json(errors.array());

    const commentId = Number(req.params.id);
    // Is the id in the body present? If yes, is it equal to the id in the url?
    if (req.body.id && req.body.id !== commentId) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    }

    const comment = {
      text: req.body.text,
    };

    try {
      const result = req.session?.method === 'totp' ? // if user is logged in with totp, no check on the ownership otherwise yes
        await dao.editCommentAdmin(req.params.id, comment) :
        await dao.editComment(req.params.id, comment, req.user.id);

      if (result.error)
        res.status(404).json(result);
      else
        res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.error });
    }
  });

// POST /api/comments/:id/interesting
// mark a comment as interesting, marks both the counter in the comment and in the interesting_flags table, only if logged in
app.post('/api/comments/:id/interesting', isLoggedIn,
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);;
    if (!errors.isEmpty())
      return res.status(422).json(errors.array());

    try {
      const result = await dao.markInteresting(req.user.id, req.params.id);
      if (result.error)
        res.status(404).json(result);
      else
        res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: `Database error during the marking of the comment` });
    }
  });

// POST /api/comments/:id/notInteresting
// unmark a comment as interesting, unmarks both the counter in the comment and in the interesting_flags table, only if logged in
app.post('/api/comments/:id/notInteresting', isLoggedIn,
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);;
    if (!errors.isEmpty())
      return res.status(422).json(errors.array());

    try {
      const result = await dao.unmarkInteresting(req.user.id, req.params.id);
      if (result.error)
        res.status(404).json(result);
      else
        res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: `Database error during the un-marking of the comment` });
    }
  });


/*** Users APIs ***/

function clientUserInfo(req) {
  const user = req.user;
  console.log(JSON.stringify(req.user));
  return { id: user.id, username: user.username, name: user.name, canDoTotp: user.secret ? true : false, isTotp: req.session.method === 'totp' };
}

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// POST /login-totp 
// login with totp
app.post('/api/login-totp', isLoggedIn,
  passport.authenticate('totp'),   // passport expect the totp value to be in: body.code
  function (req, res) {
    req.session.method = 'totp';
    res.json({ otp: 'authorized' });
  }
);

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(clientUserInfo(req));
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});

// activate the server
app.listen(port, (err) => {
  if (err)
    console.log(err);
  else
    console.log(`Server listening at http://localhost:${port}`);
}); 
