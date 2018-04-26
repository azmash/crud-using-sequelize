// var expect = require('chai').expect;
// var app = require('../app');
// var request = require('supertest');

// describe('GET /', function(done){
//   const userCredentials = {
//     username: 'admin',
//     password: 'azma'
//   }
//   var authenticatedUser = request.agent(app);
//   before(function(done){
//     authenticatedUser
//       .get('/signin')
//       .set('Content-Type', 'application/x-www-form-urlencoded')
//       .send(userCredentials)
//       .expect(200)
//       .end(function(err, response){
//         expect('Location', '/');
//         done();
//       });
//   });
//   it('should return a 200 response if the user is logged in', function(done){
//     authenticatedUser.get('/')
//     .expect(200, done)
//   });
//   it('should return a 302 response and redirect to /login', function(done){
//     request(app).get('/')
//     .expect('Location', '/login')
//     .expect(302, done);
//   });
// });