//1. what process of revoking jwt tokens repeatedly?
//2. is it possible to do revoking operation in a background or asynchronously? which way is better?
//  or automatic revoking is bad idea???
//3. where client should store jwt token??
//4. How to revoke tokens only if current Revoker has been authenticated as admin??
 //5. How it could be ensured that one token used only once from only one device at the same time 
 // in the sake of security?
//6. Should the secret key be stored in a config file??
//       - may be file-PK creating mechanism should be refined somehow? ()

let passport = require("passport");

let LocalStrategy = require("passport-local").Strategy;
let User = require("./models/user");

let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
let jwt = require("jsonwebtoken");

var FacebookTokenStrategy = require('passport-facebook-token');

const config = require("./config.js");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        { expiresIn: 3600});
};

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        // console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err) {
                return done(err, false);
            }
            else if(user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }    
));


exports.verifyUser = passport.authenticate('jwt', {session: false});
// exports.verifyAdmin = passport.authenticate('local', {session: false}, function(req, res, err) {
//     // res.redirect('/');
//     // console.log("Request: ", req, res, err);
//     if(err) {
//         err = new Error(err.message);
//         err.status = 404;
//         return false;
//     } 
// });

exports.verifyAdmin = function(req, res, next) {
    // console.log(req.user);
    if(req.user) {
        if(req.user.admin === true) {
            return next();
        }
    
    
        err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        return next(err);
    }
    err = new Error("You are not authorized!");
    err.status = 403;
    return next(err);
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({facebookId: profile.id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}));