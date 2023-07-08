var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



// Everything below this middleware is accessible by a user
// who is logged in and in a session (every route starting with / will go through this first)
//-----------------------------------------------------------------
router.use('*', function (req, res, next) {
  if (!req.session.user || !req.session.user.Username) {
      res.sendStatus(403);
  } else {
    console.log('user exists');
    next();
  }
});

//-----------------------------------------------------------------



// GETTING CLUB POSTs ROUTER for user's clubs (for myprofile)

// GETTING CLUB RSVPs ROUTER  for user's rsvps(for myprofile)

// GETTING CLUB EVENTS ROUTER for user's club events (for myprofile)



// JOINING A CLUB router (on the page when user is logged in) -
// user_status in #home vue states whether they are logged in; for clubPage)

// RSVPing ROUTER (on the page when the user is logged in for clubPage)

// ACCEPTING TO RECIEVE EMAILS (on the club page when the user is logged in for clubPage)



// MAKING A CLUB EVENT ROUTER (on clubManager.html)

// MAKING CLUB POST ROUTER (on clubManager.html)

// MAKING AND SENDING EMAIL (on club Manager.html)




// RETURNING ALL SIGNED UP USERS (on clubManager.html)
router.post('/return_club_users', function(req,res,next) {
  req.pool.getConnection(function(err1, connection){
    if (err1){
      console.log('this 1');
      res.sendStatus(500);
      return;
    }
    var query1 = 'SELECT Username FROM Memberships WHERE Club_name = ?';
    connection.query(query1, [req.body.club_name], function(err2, rows, fields){
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



// MAKING A CLUB POST ROUTER
router.post('/makeclub', function(req,res){

  console.log(req.body);

  req.pool.getConnection(function(err, connection) {
    if (err) {
      console.log('This 1');
      res.sendStatus(500);
      return;
    }

    // query to check if a club with the same name exists
    let query_club_exists = `SELECT * FROM Club WHERE Club_name = ?;`;

    connection.query(query_club_exists, [req.body.Club_name], function(errExists, club_row){
      if (errExists){
        console.log('This 1.5');
        res.sendStatus(500);
        return;
      }

      // if a row is returned, then a club with given name exists
      // hence, a new club cannot be created with the same name
      if(club_row.length > 0) {
        res.sendStatus(409); // conflict
        return;
      }

      // Query to check if the user manages a club
      let query_checking = `SELECT * FROM Club_Manager WHERE Username = ?;`;

      connection.query(query_checking, [req.session.user.Username], function(errCheck, row_checking){
        if (errCheck){
          console.log('This 2');
          res.sendStatus(500);
          return;
        }

        // if a row is returned, then a user exists as a club manager and a club exists
        // associated with them. Hence, they cannot proceed with the rest of the router
        // and make a club
        if(row_checking.length > 0) {
          res.sendStatus(409); // unauthorised
          return;
        }

        let query1 = `INSERT INTO Club (
                      Club_name,
                      Founding_year,
                      Club_bio
                    ) VALUES (
                      ?,
                      ?,
                      ?
                    );`;

        connection.query(query1, [req.body.club_name, req.body.club_year, req.body.club_description], function(err2, rows, fields){
          if (err2){
            console.log('This 3');
            res.sendStatus(500);
            return;
          }

          let query2 = `INSERT INTO Club_Manager (
                        First_name,
                        Last_name,
                        Email,
                        Club_name,
                        Username
                      ) VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                      );`;

          connection.query(query2, [req.session.user.First_name, req.session.user.Last_name, req.session.user.Email, req.body.club_name, req.session.user.Username], function(err3, rows2, fields2){
            connection.release();
            if (err3){
                console.log('This 4');
                res.sendStatus(500);
                return;
            }
            res.redirect('../homePage.html');
          });
        });
      });
    });
  });
});



// LOADING MYPROFILE PAGE router (we need user information)
router.get('/getuserinfo', function(req,res,next) {

  if (!req.session || !req.session.user || !req.session.user.Username) {
    res.sendStatus(401);
    return;
}

  req.pool.getConnection(function(err1,connection){
    if (err1) {
      console.log('this 1');
      res.sendStatus(500);
      return;
    }

    console.log(req.session.user.Username);
    var query1 = 'SELECT * FROM User WHERE Username = ?';

    connection.query(query1, [req.session.user.Username], function(err2, rows, fields) {
      connection.release();
      if (err2){
        console.log('this 2');
        res.sendStatus(500);
        return;
      }
      console.log(rows);
      res.json(rows);
    });
  });
});


// CHECKING IF A MANAGER EXISTS FOR A CLUB (clubManager page)
router.get('/check_manager', function(req,res,next){

  if (!req.session || !req.session.user) {
      res.sendStatus(401);
      return;
  }

  req.pool.getConnection(function(err, connection) {
    if (err) {
      console.log('This 1');
      res.sendStatus(500);
      return;
    }

    // New query to check if the user already manages a club
    let query_checking = `SELECT * FROM Club_Manager WHERE Username = ?;`;

    connection.query(query_checking, [req.session.user.Username], function(errCheck, row_checking){
      if (errCheck){
        console.log('This 1.5');
        res.sendStatus(500);
        return;
      }

      // if a row is returned, then a user exists as a club manager and a club exists
      // associated with them.
      if(row_checking.length > 0) {
        console.log(row_checking[0].Club_name);
        res.send(row_checking[0].Club_name); // user exists with a club
      } else {
        res.sendStatus(404);
      }
    });
});
});

// UPDATES USER INFO IN THE MYPROFILE PAGE
router.post('/update_userinfo', function(req,res,next){
  req.pool.getConnection(function(err1, connection){
    if (err1){
      console.log('this 1');
      res.sendStatus(500);
      return;
    }
    var query1 = 'UPDATE User SET First_name = ?, Last_name = ? WHERE Username = ?';
    connection.query(query1, [req.body.first_name, req.body.last_name, req.body.Username], function(err2, rows, fields){
      if (err2) {
        console.log('this 2');
        res.sendStatus(500);
        return;
      }
      res.end();
    });
  });
});


module.exports = router;
