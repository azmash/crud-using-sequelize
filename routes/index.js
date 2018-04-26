const express = require('express');
const con = require('../src/db_conn');
const config = require('../conf/config');
const moment = require('moment');
const validator = require('express-validator');
const bcrypt = require('bcrypt-nodejs');
const axios = require('axios');
const flash  = require('connect-flash');
const schemastudent = require('../src/joi_student');
const schemauser= require('../src/joi_user');
const schemareg= require('../src/joi_reg');
const student = require('../src/seq_tb_student');
const users = require('../src/seq_tb_user');
const Sequelize = require ('sequelize');
const sequelize = require('../src/seq_con');
const twoFactor = require('node-2fa');

/*
{ secret: 'XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W',
  uri: 'otpauth://totp/My Awesome App:johndoe%3Fsecret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W',
  qr: 'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/My Awesome App:johndoe%3Fsecret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W' 
}
*/
 
// var newToken = twoFactor.generateToken('4VO5ZJLD62ZMZ7HO2MFPFISK2MZEJUDM')
// console.log(newToken)
// twoFactor.verifyToken('4VO5ZJLD62ZMZ7HO2MFPFISK2MZEJUDM', '041316');


const op = Sequelize.Op;

var router = express.Router();

moment().format();

router.use(validator({
  customValidators: {
    isValidDate: isValidDate
  }
}))


function isValidDate(value) {
  if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
  var years = moment().diff(value, 'years')
  if (years <= 18) return false;

  const date = new Date(value);
  if (!date.getTime()) return false;
  return date.toISOString().slice(0, 10) === value;
}

router.get('/', function(req, res, user) {
  res.render('home',{'message' :req.flash('info'), username: req.user.username})
})


router.get('/adminlist', function(req, res) {
  users.findAll({
    order : ['id']
  }).then(function(rows) {
    res.render('adminlist', {title: 'ADMIN LIST', data: rows, username: req.user.username});
  }).catch(function(error) {
    res.status(500).json({"status_code": 500,"status_message": "internal server error"});
  })
  // con.query('SELECT * FROM users ORDER BY id', function(err, rows, fields) {
  //   if (err) {
  //     res.status(500).json({"status_code": 500,"status_message": "internal server error"});
  //   } else {
  //     res.render('adminlist', {title: 'ADMIN LIST', data: rows});
  //   }
  // });
});

router.get('/addadmin', function(req, res){
  res.render('addadmin', {username: req.user.username});
});

router.post('/addadmin', function(req, res) {
  schemauser.validate({ username: req.body.username , password: req.body.password , email: req.body.email}, function(err, value) {
    if (err) {
      console.log(err.message)
      req.flash('error_admin',err)
      res.render('addadmin', { 'error_admin': req.flash('error_admin') , susername: req.body.username, semail:req.body.email });
      return;
    } else {
      users.findAll({
        where: {
          username: [req.body.username]
        }
      }).then(function(rows) {
        if (rows.length > 0) {
          req.flash('error_dup_name', 'Error: Duplicate username');
          return res.render('addadmin',{'error_admin' :req.flash('error_dup_name'), susername: req.body.username, semail: req.body.email });       
        } else {
          users.findAll({
            where: {
              email: [req.body.email]
            }
          }).then(function(rows) {
            if (rows.length > 0) {
              req.flash('error_dup_email', 'Error: Duplicate email');
              return res.render('addadmin',{'error_admin' :req.flash('error_dup_email'), susername: req.body.username, semail: req.body.email });         
            } else {
              var SALT_FACTOR = 5;
              var ssusername= req.body.username;
              var ssemail= req.body.email;
              var sspassword= req.body.password;

              bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
                if (err) return next(err);
          
                bcrypt.hash(sspassword, salt, null, function(err, hash) {
                  if (err) return next(err);
                  var sspassword = hash;
                  var user = {username: ssusername, email: ssemail, password: sspassword}
                  users.bulkCreate([
                    user
                  ]).then(function(rows) {
                    req.flash('info', 'Success adding');
                    res.render('addadmin',{'info' :req.flash('info')})
                  }).catch(function(err) {
                    throw err
                  })
                  // var sql = "INSERT INTO users SET ?"
                  // con.query(sql, user, function(err, rows) {
                  //   if (err) throw err;
                  //     req.flash('info', 'Success adding');
                  //     res.render('addadmin',{'info' :req.flash('info')})
                  //     console.log(rows);
                  // });
                });
              });
            }
          }).catch(function(error) {
            console.log(error)
          })
        }
      }).catch(function(error) {
        console.log(error)
      })
      // var sql =  "SELECT username FROM users WHERE username = " + con.escape(req.body.username);
      // con.query(sql,  function(err, rows) {
      //   if (rows.length > 0) {
      //     req.flash('error_dup_name', 'Duplicate username');
      //     return res.render('addadmin',{'error_admin' :req.flash('error_dup_name'), susername: req.body.username, semail: req.body.email });       
      //   } else {
      //     var sql = "SELECT email FROM users WHERE email = " + con.escape(req.body.email);
      //     con.query(sql, function(err, rows) {
      //       if (rows.length > 0) {
      //         req.flash('error_dup_email', 'Duplicate email');
      //         return res.render('addadmin',{'error_admin' :req.flash('error_dup_email'), susername: req.body.username, semail: req.body.email });         
      //       } else {
      //         var SALT_FACTOR = 5;
      //         var ssusername= req.body.username;
      //         var ssemail= req.body.email;
      //         var sspassword= req.body.password;

      //         bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
      //           if (err) return next(err);
          
      //           bcrypt.hash(sspassword, salt, null, function(err, hash) {
      //             if (err) return next(err);
      //             var sspassword = hash;
      //             var user = {username: ssusername, email: ssemail, password: sspassword}
      //             var sql = "INSERT INTO users SET ?"
      //             con.query(sql, user, function(err, rows) {
      //               if (err) throw err;
      //                 req.flash('info', 'Success adding');
      //                 res.render('addadmin',{'info' :req.flash('info')})
      //                 console.log(rows);
      //             });
      //           });
      //         });
      //       }
      //     });
      //   }
      // });
    };
  })
});   

// router.post('/deleteadmin/:id', function (req, res) {
//   var sql = 'DELETE FROM users WHERE id = ?';
//   con.query(sql, [req.params.id], function(err, result) {
//     if(err) throw err
//     res.redirect('/adminlist');
//   });
// });


router.get('/setting', function(req, res) {
  users.findAll({
    where: {
      username: [req.user.username]
    }
  }).then(function(rows) {
    res.render('setting', {stwo_fa: rows[0].two_fa, username: req.user.username})
  })
})


// router.get('/d', function(req, res) {  
//   users.findAll({
//     where: {
//       username: [req.user.username]
//     }
//   }).then(function(rows) {
//     var code = qr.image('otpauth://totp/'+rows[0].username+'?secret='+rows[0].secretkey, { type: 'png' });   
//     res.setHeader('Content-type', 'image/png'); 
//     code.pipe(res);
//     // res.render('coba')
//   })
// });

router.post('/setting', function(req, res) {
  console.log(req.body.two_fa)
  if (req.body.two_fa == 'disable') {
    users.update({
      two_fa: 'disable'
    }, {where: {
      username: [req.user.username]
    }}).then(function(rows) {
      req.flash('success','Two-factor authenticated is disabled')
      res.render('setting', {stwo_fa: req.body.two_fa, 'valid': req.flash('success'), username: req.user.username})
    })
  } else if (req.body.two_fa == 'enable') {
    users.findAll({
      where: {
        username: [req.user.username]
      }
    }).then(function(rows) {
      if (rows[0].two_fa == 'enable') {
        var newToken = twoFactor.generateToken(rows[0].secretkey)
        console.log(newToken)
        var newSecret = rows[0].secretkey
        req.flash('code',newSecret)
        res.render('setting', {'enable' : req.flash('code'),ssrc: rows[0].url_qr, stwo_fa: req.body.two_fa, username: req.user.username})
        // var nsecret = twoFactor.generateSecret({name: 'Student system', account: req.user.username});
        // users.update({
        //   secretkey: nsecret.secret,
        //   url_qr: nsecret.qr
        // }, {where: {
        //   username: [req.user.username]
        // }}).then(function(rows) {
        //   users.findAll({
        //     where: {
        //       username: [req.user.username],
        //     }
        //   }).then(function(rows) {
        //     var newSecret = rows[0].secretkey
        //     req.flash('code',newSecret)
        //     res.render('setting', {stwo_fa: req.body.two_fa, 'enable' : req.flash('code'),ssrc: nsecret.qr})
        //   })
        // })
      } else {
        var nsecret = twoFactor.generateSecret({name: 'Student system', account: req.user.username});
        var newToken = twoFactor.generateToken(nsecret.secret)
        console.log(newToken)
        users.update({
          secretkey: nsecret.secret,
          url_qr: nsecret.qr
        }, {where: {
          username: [req.user.username]
        }}).then(function(rows) {
          users.findAll({
            where: {
              username: [req.user.username],
            }
          }).then(function(rows) {
            var newSecret = rows[0].secretkey
            req.flash('code',newSecret)
            res.render('setting', {'enable' : req.flash('code'),ssrc: nsecret.qr, stwo_fa: req.body.two_fa, username: req.user.username})
          })
        })
        // console.log(twoFactor.generateToken(rows[0].secretkey))
        // req.flash('code',rows[0].secretkey)
        // res.render('setting', {stwo_fa: req.body.two_fa, 'enable' : req.flash('code'), ssrc: rows[0].url_qr})
      }
    })     
  }
})

router.get('/settingp/',function(req, res) {
  users.findAll({
    where: {
      username: req.user.username
    }
  }).then(function(rows) {
    var verifytoken = twoFactor.verifyToken(rows[0].secretkey, req.query.token);
    console.log(req.query.token)
    if (verifytoken !== null) {
      // users.update({
      //   two_fa: 'enable',
      // }, {where: {
      //   username: [req.user.username]
      // }}
      // ).then(function(update) {
        req.flash('valid','valid token')
        req.flash('code',rows[0].secretkey)
        res.render('setting',{'valid': req.flash('valid'), stwo_fa: 'enable', 'enable': req.flash('code'),ssrc: rows[0].url_qr, stoken: req.query.token, username: req.user.username})
      // })
    } else {
      req.flash('failed','wrong token, try again !')
      req.flash('code',rows[0].secretkey)
      res.render('setting',{'failed': req.flash('failed'), username: req.user.username, stwo_fa: 'disable', 'enable': req.flash('code'),ssrc: rows[0].url_qr, stoken: req.query.token, username: req.user.username})
    }
    console.log(twoFactor.verifyToken(rows[0].secretkey, req.query.token));
  })
})

router.post('/settingcon', function(req,res) {
  users.update({
    two_fa: 'enable'
  }, { where: {
    username: req.user.username
  }}).then(function(rows) {
    req.flash('success', 'Two-factor authentication is enabled')
    res.render('setting',{'valid': req.flash('success'), stwo_fa: 'enable'})
  })
})

router.get('/form', function(req, res) {
  res.render('form', {username: req.user.username})
})

router.get('/student/', function(req, res, next) {
  if(req.query.keyword === undefined || req.query.sort === undefined || req.query.by === undefined ) {
    var by = 'id_student';
    var keyword = '';
    var sort = 'desc';
  } else {  
    var by = req.query.by;
    var key = req.query.keyword;
    var keyword = key.toString();
    var sort = req.query.sort;
  }

  student.findAll({
    where: { [by]: { [op.like]: '%' + keyword + '%' } },
    order: [
    [by , sort]
    ]
  }).then(rows => {
    res.render('index', {title: 'STUDENT LIST', data:rows, skeyword: keyword, ssort: sort, sby: by, username: req.user.username});
  })

  // var query = con.query("SELECT * FROM student WHERE ?? LIKE CONCAT('%', ? ,'%') ORDER BY ?? "+sort, [by, keyword, by], function(err, rows, fields) {
  //   if (err) {
  //     res.status(500).json({"status_code": 500,"status_message": "internal server error"});
  //   } else {
  //     res.render('index', {title: 'STUDENT LIST', data:rows, skeyword: keyword, ssort: sort, sby: by});
  //   }
  // });
  // console.log(query.sql)
});

router.post('/', function (req, res) {
  var dob_age = moment().diff(req.body.dob,'years');
  schemastudent.validate({ name: req.body.name , email: req.body.email , dob: req.body.dob, age: dob_age}, function(err, value) {
    if (err) {
      req.flash('error',err)
      res.render('form', { 'error_add': req.flash('error') , saddress: req.body.address, sname:req.body.name , semail:req.body.email, sdob: req.body.dob, sgender: req.body.gender });
      return;
    } else {
      var createStudent = {
        name: req.body.name,
        address: req.body.address,
        gender: req.body.gender,
        dob: req.body.dob,
        email: req.body.email,
        adm_date: new Date()
        }

      student.bulkCreate([
        createStudent
      ]).then(() => res.redirect('/student')).catch(error => {
        console.log(error)
      })
      // con.query('INSERT INTO student SET ?', createStudent, function (err, resp) {
      //   if (err) throw err;
      //   res.redirect('/student')
      // });  
    }
  });
});

router.get('/student/:id', function(req, res) {
  student.findAll({
    where: {id_student: req.params.id}
  }).then( rows => {
    res.render('edit', {
      title: 'Edit Student', 
      //data: rows[0],
      sid: rows[0].id_student,
      sname: rows[0].name,
      saddress: rows[0].address,
      sgender: rows[0].gender,
      sdob: moment(rows[0].dob).format('YYYY-MM-DD'),
      semail: rows[0].email,
      username: req.user.username
      })
    }
  ).catch( error => {
    console.log(error)
  })

  // con.query('SELECT * FROM student WHERE id_student = ?', [req.params.id], function(err, rows, fields) {
  //   if(err) throw err

  //   if (rows.length <= 0) {
  //     req.flash('error', 'Student not found with id = ' + req.params.id)
  //     res.redirect('/student')
  //   } else { 
  //     var studentDoB = moment(rows[0].dob).format('YYYY-MM-DD')
  //     console.log(studentDoB)
  //     res.render('edit', {
  //         title: 'Edit Student', 
  //         //data: rows[0],
  //         sid: rows[0].id_student,
  //         sname: rows[0].name,
  //         saddress: rows[0].address,
  //         sgender: rows[0].gender,
  //         sdob: studentDoB,
  //         semail: rows[0].email
  //     })
  //   }            
  // });
});

router.post('/update/:id', function(req, res) {
  var dob_age = moment().diff(req.body.dob,'years');
  schemastudent.validate({ name: req.body.name , email: req.body.email , dob: req.body.dob, age: dob_age}, function(err, value) {
    if (err) {
      req.flash('error',err)
      res.render('edit', { 'error_update': req.flash('error'),
      sid: req.body.id_student,
      saddress: req.body.address, sname:req.body.name , semail:req.body.email, sdob: req.body.dob, sgender: req.body.gender     
      });
    } else {
      var studentId = req.body.id_student;  
      var studentName = req.body.name;
      var studentAddress = req.body.address;
      var studentGender = req.body.gender;
      var studentDoB = req.body.dob;
      var studentEmail = req.body.email;
      var postData  = {id_student: studentId, name: studentName, address: studentAddress, gender: studentGender, dob: studentDoB, email: studentEmail};

      // if(studentId !== undefined && studentId !== '') {
      student.update(
        postData,
        { where: {id_student: studentId}}
      ).then(() => res.redirect('/student'))

      // con.query('UPDATE student SET id_student = ?, name = ?, address = ?, gender = ?, dob = ? , email = ? WHERE id_student = ?', [studentId, studentName, studentAddress, studentGender, studentDoB, studentEmail, studentId], function (error, results, fields) {
      //   if (error) throw error;
      //   res.redirect('/student');
      // });
      // } else {
      //   con.query('INSERT INTO student SET ?', postData, function (error, results, fields) {
      //     if (error) throw error;
      //     res.redirect('/student');
      //   });
      // }
    }
  })
});



router.post('/delete/:id', function (req, res, next) {
  student.destroy({
    where: {id_student: req.params.id}
  }).then(() => {
    res.redirect('/student')
  }).catch(error => {
    console.log(error)
  })
  // con.query('DELETE FROM student WHERE id_student = ?', [req.params.id], function(err, result) {
  //   if(err) throw err
  //   console.log(result);
  //   res.redirect('/student');
  // });
});


function adapt(original) {
  var copy = [];
  for (var i = 0; i < original.length; ++i) {
    for (var j = 0; j < original[i].length; ++j) {
      // skip undefined values to preserve sparse array
      if (original[i][j] === undefined) continue;
      // create row if it doesn't exist yet
      if (copy[j] === undefined) copy[j] = [];
      // swap the x and y coords for the copy
      copy[j][i] = original[i][j];
    }
  }
  return copy;
}

router.get('/stat/',function(req, res)  {
  var getmonth = []; getfrek = []; temp_monthfrek=[]; trans_month=[]; getgender = []; getfrekgen = []; temp_genderfrek=[]; trans_gend=[]; val = [];
  var thn = 2018;
  if (req.query.thn === undefined) {
    var thn = 2018;
  } else {
    var thn = req.query.thn
  }

  student.findAll({
    attributes: [[sequelize.fn('MONTH', sequelize.col('adm_date')), 'month'],[sequelize.fn('COUNT', sequelize.col('id_student')), 'Frek']],
    where: sequelize.where(sequelize.fn('YEAR', sequelize.col('adm_date')), [thn]),
    group: sequelize.fn('MONTH', sequelize.col('adm_date'))
  }).then(function(rows)  {
    // console.log(stud)
    console.log(rows[1].dataValues.month);
    console.log(rows[1].dataValues.Frek);
    getmonth.push('MONTH','January','February', 'March', 'April', 'May', 'June', 'July', 'August','September','October','November','December')
    getfrek.push('FREKUENSI',0,0,0,0,0,0,0,0,0,0,0,0)
    for (var j = 0 ; j < rows.length ; j++) {
      if (rows[j].dataValues.month === 1) {
        getfrek.splice(1,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 2) {
        getfrek.splice(2,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 3) {
        getfrek.splice(3,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 4) {
        getfrek.splice(4,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 5) {
        getfrek.splice(5,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 6) {
        getfrek.splice(6,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 7) {
        getfrek.splice(7,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 8) {
        getfrek.splice(8,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 9) {
        getfrek.splice(9,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 10) {
        getfrek.splice(10,1,rows[j].dataValues.Frek)
      } else if (rows[j].dataValues.month === 11) {
        getfrek.splice(11,1,rows[j].dataValues.Frek)
      } else {
        getfrek.splice(12,1,rows[j].dataValues.Frek)
      }          
    }
    temp_monthfrek.push(getmonth,getfrek)
    const trans_month = adapt(temp_monthfrek);
    student.findAll({
      attributes: ['gender', [sequelize.fn('COUNT', sequelize.col('gender')), 'frek_gend']],
      group: 'gender'
    }).then(rows=>  {
      for (var j = 0 ; j < rows.length ; j++) {
        if (rows[j].dataValues.gender === 'f') {
          getgender.push('FEMALE')
          getfrekgen.push(rows[j].dataValues.frek_gend)
        } else {
          getgender.push('MALE')
          getfrekgen.push(rows[j].dataValues.frek_gend)
        }   
      }
      temp_genderfrek.push(getgender,getfrekgen)
      var trans_gend = adapt(temp_genderfrek);  
      student.findAll({
        attributes: [[sequelize.fn('YEAR', sequelize.col('adm_date')), 'year']],
        group: sequelize.fn('YEAR', sequelize.col('adm_date'))
      }).then(rows=>  {
        for (j = 0; j < rows.length; j++) {
          val.push(rows[j].dataValues.year)
        }
        res.render('stat',{obj1: JSON.stringify(temp_monthfrek), obj2: JSON.stringify(trans_gend), obj3: val, sval: thn,username: req.user.username});
      }).catch(error => {
        console.log(error)
      });
    }).catch(error => {
      console.log(error)
    });
  }).catch(error => {
    console.log(error)
  });


  // student.findAll({
  //   attributes: ['gender', [sequelize.fn('COUNT', sequelize.col('gender')), 'frek_gend']],
  //   group: 'gender'
  // }).then(rows=>  {
  //   console.log(rows.length)
  //   console.log(rows[1].dataValues.frek_gend)
  //   console.log(rows[1].dataValues.gender)
  //   for (var j = 0 ; j < rows.length ; j++) {
  //     if (rows[j].dataValues.gender === 'f') {
  //       getgender.push('FEMALE')
  //       getfrekgen.push(rows[j].dataValues.frek_gend)
  //     } else {
  //       getgender.push('MALE')
  //       getfrekgen.push(rows[j].dataValues.frek_gend)
  //     }   
  //   }
  //   // // console.log(getfrekgen)
  //   temp_genderfrek.push(getgender,getfrekgen)
  //   //console.log(temp_genderfrek)
  //   var trans_gend = adapt(temp_genderfrek);  
  //   console.log(trans_gend)
  // }).catch(error => {
  //   console.log(error)
  // });

  // student.findAll({
  //   attributes: [[sequelize.fn('YEAR', sequelize.col('adm_date')), 'year']],
  //   group: sequelize.fn('YEAR', sequelize.col('adm_date'))
  // }).then(rows=>  {
  //   console.log(rows)
  // }).catch(error => {
  //   console.log(error)
  // });
  
  // con.query("select month(adm_date) as month, count(*) as Frek from student where year(adm_date)= "+thn+" group by month(adm_date)", function(err, rows, fields) {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     getmonth.push('MONTH','January','February', 'March', 'April', 'May', 'June', 'July', 'August','September','October','November','December')
  //     getfrek.push('FREKUENSI',0,0,0,0,0,0,0,0,0,0,0,0)
  //     for (var j = 0 ; j < rows.length ; j++) {
  //       if (rows[j].month === 1) {
  //         getfrek.splice(1,1,rows[j].Frek)
  //       } else if (rows[j].month === 2) {
  //         getfrek.splice(2,1,rows[j].Frek)
  //       } else if (rows[j].month === 3) {
  //         getfrek.splice(3,1,rows[j].Frek)
  //       } else if (rows[j].month === 4) {
  //         getfrek.splice(4,1,rows[j].Frek)
  //       } else if (rows[j].month === 5) {
  //         getfrek.splice(5,1,rows[j].Frek)
  //       } else if (rows[j].month === 6) {
  //         getfrek.splice(6,1,rows[j].Frek)
  //       } else if (rows[j].month === 7) {
  //         getfrek.splice(7,1,rows[j].Frek)
  //       } else if (rows[j].month === 8) {
  //         getfrek.splice(8,1,rows[j].Frek)
  //       } else if (rows[j].month === 9) {
  //         getfrek.splice(9,1,rows[j].Frek)
  //       } else if (rows[j].month === 10) {
  //         getfrek.splice(10,1,rows[j].Frek)
  //       } else if (rows[j].month === 11) {
  //         getfrek.splice(11,1,rows[j].Frek)
  //       } else {
  //         getfrek.splice(12,1,rows[j].Frek)
  //       }          
  //     }
  //     temp_monthfrek.push(getmonth,getfrek)
  //   }
  //   var trans_month = adapt(temp_monthfrek);  

  //   con.query('SELECT gender, count(gender) as frek_gend FROM student GROUP BY gender', function(err, rows, fields) {
  //     if (err) {
  //       console.log(err)
  //     } else {
  //       for (var j = 0 ; j < rows.length ; j++) {
  //         if (rows[j].gender === 'f') {
  //           getgender.push('FEMALE')
  //         } else {
  //           getgender.push('MALE')
  //         }
  //         getfrekgen.push(rows[j].frek_gend)       
  //       }
  //       temp_genderfrek.push(getgender,getfrekgen)
  //     }
  //     var trans_gend = adapt(temp_genderfrek);  

  //     con.query('SELECT year(adm_date) as year from student group by year(adm_date);', function(err, rows, fields) {
  //       for (j = 0; j < rows.length; j++) {
  //         val.push(rows[j].year)
  //       }
  //       res.render('stat',{obj1: JSON.stringify(temp_monthfrek), obj2: JSON.stringify(trans_gend), obj3: val, sval: thn});
  //     })
  //   })  
  // })  
});

router.get('/logout', function (req, res) {
  if(!req.isAuthenticated()) {
     notFound404(req, res, next);
  } else {
     req.logout();
     res.redirect('/login');
  }
})


module.exports = router;
