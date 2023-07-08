// installed npm (express) for server side (npm install)
// installed mysql for access to database on server side (npm install --save mysql)
// installed sessions to create sessions (to know which user is logged in) on server side (npm install --save express-session)
// installed google auth library on server side (npm install --save google-auth-library)
// installed argon2 for password encryption (npm install --save argon2)
// installed multer for image handling (used in user.js) - NOT USING (DONT INSTALL)

var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/images/uploads' });

const CLIENT_ID = '989015259007-9tdrv6j1vtb0bb5jbuduo8v70dqgoeco.apps.googleusercontent.com';
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// Add Argon2 for hashing + salting
const argon2 = require('argon2');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// router for logging in manually or with google account
router.post('/login', async function (req, res, next) {
    //console.log(req.body);
    if ('client_id' in req.body && 'credential' in req.body) {
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        req.pool.getConnection(function (cerr, connection) {
            if (cerr) {
                console.log('this 1');
                res.sendStatus(500);
                return;
            }
            // for google login, all fields
            let query = "SELECT Username, First_name, Last_name, Email, User_type FROM User WHERE Email = ?";
            connection.query(query, [payload['email']], function (qerr, rows, fields) {
                if (qerr) {
                    console.log('this 2');
                    res.sendStatus(500);
                    return;
                }
                //console.log(JSON.stringify(rows));
                if (rows.length > 0) {
                    connection.release();
                    // There is a user
                    let [user_session] = rows;
                    req.session.user = user_session;
                    res.redirect('homePage.html');
                } else {
                    // There is no user so we will add one for future logins via Google
                    let user_email = payload['email'];
                    let user_name = payload['given_name'] + " " + payload['family_name'];
                    let first_name = payload['given_name'];
                    let last_name = payload['family_name'];
                    let user_type = "normal_user";

                    let query2 = 'INSERT INTO User (Username, First_name, Last_name, Email, User_type) VALUES (?, ?, ?, ?, ?);';
                    connection.query(query2, [user_name, first_name, last_name, user_email, user_type], function (qerr2) {
                        connection.release();
                        if (qerr2) {
                            console.log('this 3');
                            console.log(qerr2); // Logging the error for debugging
                            res.sendStatus(500);
                            return;
                        }
                        req.session.user = {
                            Username: user_name,
                            First_name: first_name,
                            Last_name: last_name,
                            Email: user_email,
                            User_type: user_type
                        };
                        res.redirect('homePage.html');
                        return;
                    });
                }
            });
        });
    } else if ('username' in req.body && 'password' in req.body) {
req.pool.getConnection(function (cerr, connection) {
            if (cerr) {
                console.log('this 4');
                res.sendStatus(500);
                return;
            }
            // We do need the password field which contains the Argon2 hash
            let query = "SELECT Pass, Username FROM Password WHERE Username = ?";
            connection.query(query, req.body.username, async function (qerr, rows, fields) {
                if (qerr) {
                    console.log('this 5');
                    res.sendStatus(500);
                    return;
                }
                if (rows.length > 0) {
                    // User exists with the provided Username
                    // Use  Argon2 to verify method to see if the plaintext password
                    // matches the Hash+Salt
                    if (await argon2.verify(rows[0].Pass, req.body.password)) {
                      //console.log(rows[0].Pass);
                      //console.log(req.body.password);
                      let [passward_information] = rows;
                      delete passward_information.pass;
                      let query2 = "SELECT * FROM User WHERE Username = ?";
                      connection.query(query2, req.body.username, async function (qerr2, rows2, fields2) {
                          connection.release();
                          if (qerr) {
                              res.sendStatus(500);
                              return;
                          }
                          let [user_information] = rows2; // JSON
                          // There is a user
                          req.session.user = user_information; // attaching session to user
                          // to access username, it is req.session.user.Username
                          //console.log(req.session.user);
                          res.redirect('homePage.html');
                          return;
                      });
                    } else {
                        // The user exists, but the password doesn't match
                        console.log("This 2");
                        res.sendStatus(401);
                    }
                } else {
                    // There is no password with this username
                    console.log("This 3");
                    res.sendStatus(401);
                }
            });
        });
    } else {
        console.log("This 4");
        res.sendStatus(401);
    }
  });



// SIGN UP USER
router.post('/signing_up', function (req, res, next) {

    // Check for required fields (if one or is missing error is sent back)
    if (!req.body.username || !req.body.password || !req.body.first || !req.body.last || !req.body.email || !req.body.user_type) {
        res.sendStatus(400);
        return;
    }

    if ('username' in req.body && 'password' in req.body) {

        req.pool.getConnection(async function (cerr, connection) {
            if (cerr) {
                res.sendStatus(500);
                connection.release();
                return;
            }

            const hash = await argon2.hash(req.body.password);

            var query1 = `INSERT INTO User (
                          Username,
                          First_name,
                          Last_name,
                          Email,
                          User_type
                        ) VALUES (
                          ?,
                          ?,
                          ?,
                          ?,
                          ?
                        );`;

            var query2 = `INSERT INTO Password (
                          Pass,
                          Username
                        ) VALUES (
                          ?,
                          ?
                        );`;

            connection.query(query1, [req.body.username, req.body.first, req.body.last, req.body.email, req.body.user_type], function (qerr, rows, fields) {

                if (qerr) {
                    console.error("Error in first query:", qerr);

                    // a user already exists in the system with the same username
                    if (qerr.code === 'ER_DUP_ENTRY') {
                        res.sendStatus(409);
                        connection.release();
                        return;
                    }

                    res.sendStatus(401);
                    connection.release();
                    return;
                }

                connection.query(query2, [hash, req.body.username], function (qerr2, rows2, fields2) {
                    connection.release();

                    if (qerr2) {
                        console.error("Error in second query:", qerr2);
                        res.sendStatus(401);
                        return;
                    }

                    res.redirect('/loginPage.html');
                });

            });
        });

    } else {
        res.sendStatus(401);
    }

});

// LOGOUT USER - deleting current user (implement button for this)
router.post('/logging_out', function (req, res, next) {

    // checking if user exists
    if (req.session.user) {
        delete req.session.user;
        res.sendStatus(200); // Send a 200 status code if the user was logged out
    } else {
        res.sendStatus(403); // You could send a different status code if there's no user to log out
    }
});

// CHECK IF USER EXISTS FOR TAB IN PAGES
router.post('/check_user', function(req, res, next) {
    if (!req.session) {
        return res.status(500);
    }

    if (req.session.user) {
        res.send('user');
    } else {
        res.send('no user');
    }
});


// LOADING CLUB PAGE router (name, bio, founding year)
router.post('/get_club', function(req,res,next){
    req.pool.getConnection(function(err1, connection){
        if (err1){
          console.log('this 1');
          res.sendStatus(500);
          return;
        }
        var query1 = 'SELECT * FROM Club WHERE Club_name = ?';
        connection.query(query1, [req.body.clubname], function(err2, rows, fields){
          connection.release();
          if (err2) {
            console.log('this 2');
            res.sendStatus(500);
            return;
          }
          console.log(rows);
          res.json(rows);
        });
      });
});

// LOADING CLUBS ON THE HOMEPAGE router (showing all of the clubs so that user can click on them)
router.get('/get_allclubs_names', function(req,res,next){
    req.pool.getConnection(function(err1, connection){
        if (err1){
          console.log('this 1');
          res.sendStatus(500);
          return;
        }
        var query1 = 'SELECT Club_name FROM Club';
        connection.query(query1, function(err2, rows, fields){
          connection.release();
          if (err2) {
            console.log('this 2');
            res.sendStatus(500);
            return;
          }
          res.json(rows);
        });
      });
});


// GETTING CLUB POSTs ROUTER (for club page)
router.post('/get_posts_clubpage', function(req,res,next){
    req.pool.getConnection(function(err1, connection){
        if (err1){
          console.log('this 1');
          res.sendStatus(500);
          return;
        }
        console.log('clubname', req.body.clubname);
        var query1 = 'SELECT * FROM Club_posts WHERE Club_name = ?';
        connection.query(query1, [req.body.clubname], function(err2, rows, fields){
          connection.release();
          if (err2) {
            console.log('this 2');
            res.sendStatus(500);
            return;
          }
          console.log('this is posts', rows);
          res.json(rows);
        });
      });
});

// GETTING CLUB EVENTS ROUTER (for clubpage)
router.post('/get_events_clubpage', function(req,res,next){
    req.pool.getConnection(function(err1, connection){
        if (err1){
          console.log('this 1');
          res.sendStatus(500);
          return;
        }
        var query1 = 'SELECT * FROM Events WHERE Club_name = ?';
        connection.query(query1, [req.body.clubname], function(err2, rows, fields){
            connection.release();
          if (err2) {
            console.log('this 2');
            res.sendStatus(500);
            return;
          }
          console.log('this is events', rows);
          res.json(rows);
        });
      });
});

//--------------------------------------------------------------------------------------------------
// ALL ROUTERS BELOW ARE USED FOR HANDLING UPLOADS OF CLUB PHOTOS AND HANDLING ASSOCIATED META DATA
var club_photos = [];

// tekk us what to do with files when they come into path
// middleware which extracts fules
router.post('/upload', upload.array('file',12));

// handles metadata about the files
router.post('/upload', function(req,res,next){

    console.log(req.files);
    req.files.forEach(function(file){
        club_photos.push(file.filename);
    });

    res.send();

});

// retrieve information of uploaded files
router.get('/get_images', function(req,res,next){
    res.json(club_photos);
});

//--------------------------------------------------------------------------------------------------

module.exports = router;
