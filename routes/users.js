var express = require('express');
const bodyParser = require('body-parser');
let User = require('../models/user');
let passport = require("passport");
const authenticate = require("../authenticate");
const cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

router.options('*', cors.configureWithOptions, (req, res) => { res.sendStatus(200); })

/* GET users listing. */
router

.get('/', cors.cors, authenticate.verifyAdmin, function(req, res, next) {
  // res.send('respond with a resource');
  // if(!req.session.user) {
  // if(!req.user) {
  //   let err = new Error("you are not logged in!");
  //   err.status = 403;
  //   next(err);
  //   return;
  // }
  User.find({}).then((users) => {
    // // console.log(users);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    // res.end('Will send all the dishes to you!');

    res.json(users);
  })
  .catch((err) => next(err));
});

router

  .post('/signup',  cors.configureWithOptions, (req, res, next) => {
    // // console.log("signing UP...");
    User.register(new User({username: req.body.username}), req.body.password, 
      (err, user) => {
        // console.log("register", user, (user != null))
        if(err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err})
          
        }
        else {
          if(req.body.nickname) {
            user.nickname = req.body.nickname;
          }
          if(req.body.lastname) {
            user.lastname = req.body.lastname;
          }
          user.save((err, user) => {
            // console.log("after user saved", user);
            if(err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err})
              return;
            }
            passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({success: true, status: 'Registration Successful!' });
            });
          });
          // passport.authenticate('local')(req, res, () => {
          //   res.statusCode = 200;
          //   res.setHeader('Content-Type', 'application/json');
          //   res.json({success: true, status: 'Registration Successful!' });
          // });
        }
      }
    );
    // User.findOne({ username: req.body.username })
    
  });

router

// .post("/login", cors.configureWithOptions, passport.authenticate('local'), (req, res, next) => {
.post("/login", cors.configureWithOptions,  (req, res, next) => {
  // console.log("login  req", req);
  passport.authenticate('local', (err, user, info) => {
   // console.log("local error auth", err, user, info);

   
   
    if(err) {
      return next(err);
    }

    if(!user) { //case when user or pass is incorrect
      // console.log('err !user', req.body);

      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false,  status: 'You are failed to 10g in!', err: info });
      return res;
    }

    req.logIn(user, (err) => {
      if(err)  {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false,  status: 'You are failed to 10g in!', err: "Could not login User!" });
      }

      let token = authenticate.getToken({ _id: req.user._id });
      // console.log("Login:Post user", req.user);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, token: token, status: 'You are successfully 10gged in!'});

    });
  }) (req, res, next);

  
  
});

router
.get('/logout', cors.configureWithOptions, (req, res, next) => {
  // console.log("Logging out...");

  if(req.session) {
    req.session.destroy();
    res.cookie('jwt', '', { maxAge: 1 })
    res.clearCookie('session-id');
    // console.log("Session destroyed. Cookies created. Redirecting to '/' ...");

    res.redirect('/');
  }
  else {
    let err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

router.get('/checkJWTToken', cors.configureWithOptions, (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if(err) return next(err);
    if(!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({status: "JWT invalid!", success: false, err: info});
    }
    else {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({status: "JWT valid!", success: true, user: user});
    }
  }) (req, res);
});
module.exports = router;
