var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session'); // for sessions
var mysql = require('mysql'); // open mysql library

var dbConnectionPool = mysql.createPool({ host: 'localhost', database: 'clubDatabase'}); // linking database to web application (name of the db is included)


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// middleware to connect db and make it accessible in every route in system via req.pool
app.use(function(req, res, next) {
    req.pool = dbConnectionPool;
    next();
});

// middleware for session
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'super secret string',
    secure: false
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
