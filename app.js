var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const session = require('express-session');
let FileStore = require('session-file-store')(session);
let passport = require("passport");
// const authenticate = require('./authenticate');
const config = require('./config');

// let dishesService = require('./api/services/dishesService');
var index = require('./routes/index');
var users = require('./routes/users');
var dishRouter = require('./routes/dish');
var promoRouter = require('./routes/promo');
var leaderRouter = require('./routes/leader');
const uploadRouter = require('./routes/upload');
const favoritesRouter = require('./routes/favorites');
const commentRouter = require('./routes/comment');
const feedbackRouter = require('./routes/feedback');


const mongoose = require("mongoose");
const Dishes = require("./models/dishes");
const { ServerApiVersion } = require('mongodb');


const credentials = 'C:\\Users\\tyran\\Documents\\mongoDbCloud\\X509-cert-7894173848214157189.pem';
const url = config.mongoUrl;

async function run() {
  try {
      const connect = await mongoose.connect(url, {
          sslKey: credentials,
          sslCert: credentials,
          serverApi: ServerApiVersion.v1
        });


      // mongoose.connection.close()
  }
  catch(e) {
    // console.log("!!!ERROR:", e);
  }
  finally { 
    // mongoose.disconnect();
    // mongoose.connection.close()
  }
}

run().catch(console.dir);


var app = express();
app.all('*', (req, res, next) => {
  if(req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ":" + app.get('port') + req.url);
  }
});


// app.use(cookieParser('12345-67890-09876-54321'));
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());


// app.use((req, res, next) => {
  // // console.log("Client Ip", req.headers['x-formatted-for'] || req.connection.remoteAddress);
  // next();
// });
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.use('/', index);
app.use('/users', users);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoritesRouter);
app.use('/comments', commentRouter);
app.use('/feedback', feedbackRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // console.log("ENV", req.app.get('env'));
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
