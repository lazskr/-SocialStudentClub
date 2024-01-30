--Text is 65,000 characters
--RSVP status is int as 1 indicates going, 0 indicates not going
--Added a password table as a user who signs up with google with not have a password (just emal, first_name, last_name and password,
--whilst user_type will be default as "user" and username will be generated as first_name+last_name as default (can be changed later))
--user_id has been removed and replaced by username as the primary key for User

SET FOREIGN_KEY_CHECKS=0; --I set it to this
SET FOREIGN_KEY_CHECKS=1; --do this for final version

CREATE TABLE User
(
  Username VARCHAR(30) NOT NULL,
  First_name VARCHAR(50) NOT NULL,
  Last_name VARCHAR(50) NOT NULL,
  Email VARCHAR(30) NOT NULL,
  User_type VARCHAR(30) NOT NULL,
  PRIMARY KEY (Username)
);

CREATE TABLE Club
(
  Club_name VARCHAR(50) NOT NULL,
  Founding_year INT NOT NULL,
  Club_bio TEXT NOT NULL,
  Club_image_url TEXT NOT NULL,
  PRIMARY KEY (Club_name)
);


CREATE TABLE Events
(
  Event_ID INT UNIQUE AUTO_INCREMENT,
  Event_name VARCHAR(50) NOT NULL,
  Event_description TEXT NOT NULL,
  Event_date VARCHAR(30) NOT NULL,
  Event_time VARCHAR(30) NOT NULL,
  Event_location TEXT NOT NULL,
  Club_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (Event_ID),
  FOREIGN KEY (Club_name) REFERENCES Club(Club_name)
);

CREATE TABLE Password
(
    Pass TEXT NOT NULL,
    Username VARCHAR(30) NOT NULL,
    FOREIGN KEY (Username) REFERENCES User(Username),
    PRIMARY KEY (Username)
);

CREATE TABLE Memberships
(
  Membership_ID INT UNIQUE AUTO_INCREMENT,
  Username VARCHAR(30) NOT NULL,
  Club_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (Membership_ID),
  FOREIGN KEY (Username) REFERENCES User(Username),
  FOREIGN KEY (Club_name) REFERENCES Club(Club_name)
);

CREATE TABLE Email_notifications
(
  Email_ID INT UNIQUE AUTO_INCREMENT,
  Email_content TEXT NOT NULL,
  Username VARCHAR(30) NOT NULL,
  Club_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (Email_ID),
  FOREIGN KEY (Username) REFERENCES User(Username),
  FOREIGN KEY (Club_name) REFERENCES Club(Club_name)
);

CREATE TABLE Club_posts
(
  Post_ID INT UNIQUE AUTO_INCREMENT,
  Post_content TEXT NOT NULL,
  Post_date DATETIME NOT NULL,
  Post_title TEXT NOT NULL,
  Club_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (Post_ID),
  FOREIGN KEY (Club_name) REFERENCES Club(Club_name)
);

CREATE TABLE RSVPs
(
  RSVP_ID INT UNIQUE AUTO_INCREMENT,
  RSPV_status INT NOT NULL,
  Event_ID INT NOT NULL,
  Username VARCHAR(30) NOT NULL,
  PRIMARY KEY (RSVP_ID),
  FOREIGN KEY (Event_ID) REFERENCES Events(Event_ID),
  FOREIGN KEY (Username) REFERENCES User(Username)
);

CREATE TABLE Club_Manager
(
  Club_Manager_ID INT UNIQUE AUTO_INCREMENT,
  First_name VARCHAR(50) NOT NULL,
  Last_name VARCHAR(50) NOT NULL,
  Email VARCHAR(30) NOT NULL,
  Club_name VARCHAR(50) NOT NULL,
  Username VARCHAR(30) NOT NULL,
  PRIMARY KEY (Club_Manager_ID),
  FOREIGN KEY (Club_name) REFERENCES Club(Club_name),
  FOREIGN KEY (Username) REFERENCES User(Username)
);

CREATE TABLE Club_Manager_Events
(
  Club_Manager_Event_ID INT UNIQUE AUTO_INCREMENT,
  Event_ID INT NOT NULL,
  Club_Manager_ID INT NOT NULL,
  PRIMARY KEY (Club_Manager_Event_ID),
  FOREIGN KEY (Event_ID) REFERENCES Events(Event_ID),
  FOREIGN KEY (Club_Manager_ID) REFERENCES Club_Manager(Club_Manager_ID)
);