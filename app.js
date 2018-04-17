const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const users = require('./routes/users');
const mysql = require('mysql');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sess = require('express-session');
const Store = require('express-session').Store;
const BetterMemoryStore = require('session-memory-store')(sess);
const bcrypt = require('bcrypt-nodejs');
const con = require('./src/db_conn');
const schemastudent= require('./src/joi_student');
const schemauser= require('./src/joi_user');
// const sequelize= require('./src/seq_con');
const student = require('./src/seq_tb_student');
const user = require('./src/seq_tb_user');
const Sequelize = require ('sequelize');
const sequelize = require('./src/seq_con');
const sgMail = require('@sendgrid/mail');
const flash  = require('connect-flash');
const moment = require('moment');
const app = express();

app.locals.moment = require('moment');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var store = new BetterMemoryStore({ expires: 60 * 60 * 1000, debug: true });

sequelize.authenticate()
.then(() => {
  console.log('conn success');
})
.catch(() => {
  console.error('conn error',err);
})


// student.findAll().then(user => {
//   console.log(user)
// })

app.use(sess({
   name: 'JSESSION',
   secret: 'MYSECRETISVERYSECRET',
   store:  store,
   resave: true,
   saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true //passback entire req to call back
} , function (req, username, password, done, err){
      if(!username || !password ) { return done(null, false, req.flash('message','All fields are required.')); }
      // return done(req.flash('message',err));
      user.findAll({
        where: {
          username: [username]
        }
      }).then(function(rows, err) {
        if(!rows.length){ return done(null, false, req.flash('message','Invalid username.')); }
        var dbPassword  = rows[0].password;
        console.log('dbpw = ', dbPassword)
        console.log('pass = ', password)
        bcrypt.compare(password, dbPassword, function(err, res) {
          if(res) {
            return done(null, rows[0]);
           } else {
            return done(null, false, req.flash('message','Invalid password.'));
           } 
        
        });          
      }).catch(function(err) {
        console.log(err)
      })
      // var sql = "select * from users where username = " + con.escape(username);
      // con.query(sql, function(err, rows) {
      //   if (err) return done(req.flash('message',err));
      //   if(!rows.length){ return done(null, false, req.flash('message','Invalid username or password.')); }
      //   var dbPassword  = rows[0].password;
      //   console.log('dbpw = ', dbPassword)
      //   console.log('pass = ', password)
      //   bcrypt.compare(password, dbPassword, function(err, res) {
      //     if(res) {
      //       return done(null, rows[0]);
      //      } else {
      //       return done(null, false, req.flash('message','Invalid username or password.'));
      //      } 
      //   });       
      // });
    }
));


passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  user.findAll({
    where: {
      id: [id]
    }
  }).then(function(rows, err) {   
    done(err, rows[0]);
  })
  // var sql = "select * from users where id= "+ con.escape(id);
  // con.query(sql , function (err, rows){
  //     done(err, rows[0]);
  // });
});

app.get('/coba', function(req, res) {
  res.render('coba')
})

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

const result = schemastudent.validate({ name: 'aaaa', email: 'a@c.v', dob: '1990-03-02' }, function(err, value) {
  if (err) {
    console.log (err.message)
  } else {
    console.log(value);
  }; 
});

// app.all('/*', function (req, res,next) {
//   res.locals({
//   session: req.session
//   });
//   return next();
//   });
// app.locals.user = req.user.username

app.use('/', users);
app.use('/', isAuthenticated,index);



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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
