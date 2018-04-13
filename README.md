# Simple CRUD project

This is simple project to create, read, update and delete student's data. include reset password content and add admin to access the project. This project is build with Express.js using Pug.
This project using :
1. Tailwind and Bootstrap 4.0.0 CSS
2. Drawing Graph using C3-D3.js
3. Validation input (email and date) using express-validator and moment.js
4. Email delivery using SendGrid

## Requirements

- nodejs
- npm
- express generator
- express validator
- moment.js
- express session
- bcrypt
- connect-flash

## Installation

1. Clone this repo
    ```
    git clone git@github.com:azmash/mysql-nodejs.git
    ```
2. `cd mysql-nodejs`
3. Run `npm install` on the project root director
4. create database `stu` and import `mhs.sql` (`mysql -u root mhs.sql > stu`)
5. To run the the project simply type.
    ``` 
    npm start
    ```
6.  And access this code from browser
    ``` 
    http://localhost:3000/ 
    ```

Skeleton of this project
```
╭─azmasholiha@MacBook-Air-Azma ~/project-collab/express-locallibrary-tutorial
╰─$ tree
.
├── app.js
├── bin
│   └── www
├── node_modules (containing 1000 more files/dorectory)
├── package-lock.json
├── package.json
├── public
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── edit.pug
    ├── error.pug
    ├── form.pug
    ├── home.pug
    ├── index.pug
    ├── layout.pug
    ├── search.pug
    └── stat.pug
```

