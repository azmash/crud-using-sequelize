const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const async = require('async');
const con = require('../src/db_conn');
const sgMail = require('@sendgrid/mail');
const flash  = require('connect-flash');
const crypto = require('crypto');
const moment = require('moment');
const passport = require('passport');
const schemauser= require('../src/joi_user');
const schemareg= require('../src/joi_reg');
const users = require('../src/seq_tb_user');
const Sequelize = require ('sequelize');
const sequelize = require('../src/seq_con');
const twoFactor = require('node-2fa');
const op = Sequelize.Op;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get('/homepage', function(req, res) {
  res.render('login/homepage')
})
router.get('/login', function(req, res){
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
  res.render('login/index',{'message' :req.flash('message')});
  };
});


router.get('/signin', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    console.log(req.query.username)
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    users.findAll({
      where: {
        username: req.query.username
      }
    }).then(function(rows) {
      console.log(rows[0].two_fa)
      if (rows[0].two_fa == 'disable') {
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          req.flash('info', 'Hi ' + req.user.username + ', You successfully logged in')  
          return res.redirect('/' );
        });
      } else {
        req.flash('username',req.query.username)
        res.redirect('/two_fa/')
      }
    })
  })(req, res, next);
});

router.get('/two_fa/', function(req, res) {
 // console.log('username ',req.params.username )
  var f = req.flash('username');
  console.log(f.toString())
  res.render('login/two_fa', {susername: f.toString()})
})

router.post('/two_fa/', function(req, res) {
  console.log(req.body.username)
  users.findAll({
    where: {
      username: [req.body.username]
    }
  }).then(function(rows) {
    var verifytoken = twoFactor.verifyToken(rows[0].secretkey, req.body.token);
    console.log(req.body.token)
    var newToken = twoFactor.generateToken(rows[0].secretkey)
    console.log(newToken)
    if (verifytoken !== null) {
      users.findOne({
        where: {
          username: [req.body.username]
        },
        attributes: ['id', 'username', 'password']
      }).then(user => 
        req.login(user, function (err) {
          if (err) {
            req.flash('error', err.message);
            console.log('user',user)
            return res.redirect('back');
          }
          console.log('Logged user in using Passport req.login()');
          console.log('username',req.user.username);
          req.flash('info', 'Hi '+req.user.username+', you successfully logged in')
          res.redirect('/')
        })
      ) 
    } else {
      req.flash('failed','wrong token, try again !')
      res.render('login/two_fa',{'error': req.flash('failed'),stoken: req.body.token, susername: req.body.username})
    }
  }).catch(error => {
    req.flash('failed','wrong token, try again !')
    res.render('login/two_fa',{'error': req.flash('failed'),stoken: req.body.token, susername: req.body.username})
  })
})

// router.post('/signin',
//   passport.authenticate('local', { 
//   failureRedirect: '/login',
//   failureFlash: true,
//   successFlash: 'Welcome!' }),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     req.flash('info', 'Hi ' + req.user.username + ', You successfully logged in') 
//     res.redirect('/') 
//     // res.render('home' , {'info' :req.flash('info'), username: req.user.username});
//   });

// router.post(
//   '/signin',
//   passport.authenticate('local', {
//     failureFlash: true,
//     successFlash: 'Welcome!'
//   }),
//   (req, res) => {
//     res.redirect('/' + req.user.username);
//   }
// );

router.get("/register", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('login/register');
  };
})

router.post('/register', function(req,res) {
  schemauser.validate({ username: req.body.username , email: req.body.email}, function(err, value) {
    if (err) {
      req.flash('error', err)
      res.render('login/register', {susername: req.body.username, semail: req.body.email, 'error' :req.flash('error')})
    } else {
      users.findAll({
        where: {
          username: [req.body.username]
        }
      }).then(function(rows) {
        if (rows.length > 0) {
          req.flash('error', 'Username is not available')
          res.render('login/register', {susername: req.body.username, semail: req.body.email, 'error' :req.flash('error')})
        } else {
          users.findAll({
            where: {
              email: [req.body.email]
            }
          }).then(function(rows) {
            if (rows.length > 0) {
              req.flash('error', 'Email has been used')
              res.render('login/register', {susername: req.body.username, semail: req.body.email, 'error' :req.flash('error')})
            } else {
              async.waterfall([
                function(done) {
                  crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                  });
                },
            
                function(token, done) {
                  var user = {username: req.body.username, email: req.body.email, reg_token: token, status: 'nonactive'}
                  users.bulkCreate([
                    user
                  ]).then(function(rows, err) {
                    users.findAll({
                      where: {
                        username: req.body.username
                      }
                    }).then(function(rows, err) {
                      done(err, token, rows)
                    })
                  })
                },
                
                function(token, rows, done) {
                  console.log('token',token)
                  var msge = {
                    to: req.body.email,
                    from: 'azz@example.com',
                    subject: 'Confirm your account',
                    text: 'By clicking on the following link, you are confirming your email address and complete your registration.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/confirmreg/' + token + '\n\n' +
                    'If you did not request this, please ig-nore this email.\n',
                  };
                  sgMail.send(msge, function(err) {
                    req.flash('info', 'An e-mail has been sent to ' + req.body.email + ' to confirm your account. Check it, and complete your registration');
                    done(err, 'done');
                  });
                }
              ], 
              function(err) {
                if (err) return next(err);
                res.render('login/register',{'info' :req.flash('info')});
              });
            }
          })
        }
      })
    }
  })  
})

router.get('/confirmreg/:token', function(req, res) {
  users.findAll({
    where: {
      reg_token: [req.params.token]
    }
  }).then(function(rows, err) {
    if (rows.length<=0) {
      req.flash('error','invalid token or link is broken')
      res.render('login/register', {'error': req.flash('error')})
    } else {
      res.render('login/complete_regist', {susername: rows[0].username, semail: rows[0].email})
    }
  }).catch(function(err) {
    console.log(err)
  })
})

// huh

router.post('/confirmreg/:token', function(req, res, next) {
  var pass = bcrypt.hashSync(req.body.password);
  var nsecret = twoFactor.generateSecret({name: 'Student system', account: req.body.username});
  var user = {password: pass, reg_token: '', status: 'active', secretkey: nsecret.secret, url_qr:nsecret.qr}
  schemareg.validate({ password: req.body.password}, function(err, value) {
    if (err) {
      req.flash('error', err)
      res.render('login/complete_regist', {susername: req.body.username, semail: req.body.email, 'error' :req.flash('error')})
    }
    users.update(
      user,
      { where: {
        username: req.body.username
      }}
    ).then(rows => 
      users.findOne({
        where: {
          username: [req.body.username]
        },
        attributes: ['id', 'username', 'password']
      }).then(user => 
        req.login(user, function (err) {
          if (err) {
            req.flash('error', err.message);
            console.log('user',user)
            return res.redirect('back');
          }
          console.log('Logged user in using Passport req.login()');
          console.log('username',req.user.username);
          req.flash('info', 'Congratulations, you successfully registered')
          res.redirect('/')
          // res.render('home',{'info' :req.flash('info'), username: req.user.username});
        })
      )
    )
  })
})

router.get('/forgot', function(req, res){
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('login/forgot');
  };
});

router.post('/forgot', function(req, res, next) {
  var email = req.body.email;
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },

    function(token, done) {
      console.log(email);
      users.findAll({
        where: {
          email: [email]
        }
      }).then(function(rows, err) {
        if (rows.length <= 0) {
          req.flash('error', 'No account with that email address exists.');
          return res.render('login/forgot',{'error' :req.flash('error')});
        }
        var spw_token = token;      
        var spw_exp = moment().toDate();
        var reset = {pw_token: spw_token, pw_exp: spw_exp}
        users.update(
          reset,
          { where: {email: [email]}}
        ).then(function(rows, err) {
          done(err, token, rows)
          // console.log(token)
        })
        // var sql = "UPDATE users SET ? WHERE email = ? ";
        // con.query(sql, [reset, email], function(err,rows) {
        //   done(err, token, rows);
        //   console.log('rows',rows);
        // });
      })
      // var sql = "SELECT * FROM users WHERE email = " + con.escape(email);
      // con.query(sql, function(err, rows) {
      //   if (rows.length <= 0) {
      //     req.flash('error', 'No account with that email address exists.');
      //     return res.render('login/forgot',{'error' :req.flash('error')});
      //   }
      //   var spw_token = token;      
      //   var spw_exp = moment().toDate();
      //   var reset = {pw_token: spw_token, pw_exp: spw_exp}
      //   var sql = "UPDATE users SET ? WHERE email = ? ";
      //   con.query(sql, [reset, email], function(err,rows) {
      //     done(err, token, rows);
      //     console.log('rows',rows);
      //   });
      // });
    },
    
    function(token, rows, done) {
      console.log('token',token)
      var msge = {
        to: email,
        from: 'azz@example.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ig-nore this email and your password will remain unchanged.\n',
      };
      sgMail.send(msge, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], 
  function(err) {
    if (err) return next(err);
    // res.redirect('/forgot')
    res.render('login/forgot',{'error' :req.flash('error'), 'info' :req.flash('info')});;
  });
});

router.get('/reset/:token', function(req, res) {
  users.findAll({
    where: {
      pw_token: [req.params.token]
    }
  }).then(function(rows) {
    if (rows.length <= 0) {
      req.flash('error', 'Password reset token is invalid');
      return res.render('login/forgot', {'error' :req.flash('error')});
    }
    console.log(rows[0].pw_exp);
    var min = moment().diff(rows[0].pw_exp, 'minute')
    console.log(min);

    if (min >=160) {
      users.update(
        {pw_token: null, pw_exp: null},
        { where: {pw_token: [req.params.token]}}
      ).then().catch(function(err) {
        console.log(err)
      })
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.render('login/forgot', {'error' :req.flash('error')});
    }
    var username = rows[0].username
    res.render('login/reset', {
      susername: username
    })
  }).catch(function(er) {
    if(err) throw err
  })
  // var sql = 'select * from users where pw_token = ?';
  // con.query(sql ,[req.params.token], function (err, rows, fields) {
  //   if(err) throw err

  //   if (rows.length <= 0) {
  //     req.flash('error', 'Password reset token is invalid');
  //     return res.render('login/forgot', {'error' :req.flash('error')});
  //   }
  //   console.log(rows[0].pw_exp);
  //   var min = moment().diff(rows[0].pw_exp, 'minute')
  //   console.log(min);

  //   if (min >=160) {
  //     req.flash('error', 'Password reset token is invalid or has expired.');
  //     return res.render('login/forgot', {'error' :req.flash('error')});
  //   }
  //   var username = rows[0].username
  //   res.render('login/reset', {
  //     susername: username
  //   }); 
  // });
});

router.post('/reset/:token', function(req, res, next) {
  var username = req.body.username;
  console.log(username)
  async.waterfall([
    function(done) {
      users.findAll({
        where: {
          pw_token: [req.params.token]
        }
      }).then(function(rows, err) {
        if (rows.length <= 0) {
          req.flash('error', 'No account with that email address exists.');
          return res.render('login/forgot',{'error' :req.flash('error')});
        }
        var spw_token = undefined;      
        var spw_exp = undefined;  
        var spassword = req.body.password;  
        var sspassword = bcrypt.hashSync(spassword);
        
        var reset = {pw_token: spw_token, pw_exp: spw_exp, password: sspassword}
        users.update(
          reset,
          { where: {username: [username]}}
        ).then().catch(function(err) {
          console.log(err)
        })
        // var sql = "UPDATE users SET ? WHERE username = ? ";
        // con.query(sql, [reset, username], function(err,rows) {        
        //   });  
        var email = rows[0].email;
        console.log(email)
        done(err, rows);
        // var sql = "SELECT email FROM users WHERE username = " + con.escape(username);
        // con.query(sql, function(err,rows) {
        //     var email = rows[0].email;
        //     done(err, rows);
        // });
      }).catch(function(err) {
        console.log(error)
      })
      // var sql = "SELECT * FROM users WHERE pw_token = ?";
      // con.query(sql , [req.params.token], function(err, rows) {
      //   if (rows.length <= 0) {
      //     req.flash('error', 'No account with that email address exists.');
      //     return res.render('login/forgot',{'error' :req.flash('error')});
      //   }
      //   var spw_token = undefined;      
      //   var spw_exp = undefined;  
      //   var spassword = req.body.password;  
      //   var sspassword = bcrypt.hashSync(spassword);
        
      //   var reset = {pw_token: spw_token, pw_exp: spw_exp, password: sspassword}
      //   var sql = "UPDATE users SET ? WHERE username = ? ";
      //   con.query(sql, [reset, username], function(err,rows) {        
      //     });  
      //   var sql = "SELECT email FROM users WHERE username = " + con.escape(username);
      //   con.query(sql, function(err,rows) {
      //       var email = rows[0].email;
      //       done(err, rows);
      //   });
      // });
    },
    
    function(rows, done) {
      var msge = {
        to: rows[0].email,
        from: 'vy.phera@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + rows[0].email + ' has just been changed.\n'
      };
      sgMail.send(msge, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.render('login/index',{'success' :req.flash('success')});
  });
});

module.exports = router;
