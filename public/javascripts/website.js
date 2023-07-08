// Vue.js will protect against Cross Site Scripting Attacks (XSS)


// HOMEPAGE.HTML
var home_vue = new Vue({
    el: "#home",
    data: {
      user_status: false, // if they are logged in
      club_names: [],
      club_photos_path: [],
      club_name: localStorage.getItem('club_name'), // localStorage saves the vue value even after switching pages
      club_bio: localStorage.getItem('club_bio'),
      club_year: localStorage.getItem('club_year'),

    // || [] means if posts or events is NULL, then the data will be stored as empty array
      all_posts_clubpage: JSON.parse(localStorage.getItem('all_posts_clubpage')) || [],
      all_events_clubpage: JSON.parse(localStorage.getItem('all_events_clubpage')) || []
    },

    mounted(){
        this.check_user();
        this.get_clubs();
    },

    methods: {

        loggingout: function() {
            let req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if (req.readyState === 4) {
                    if(req.status === 200) {
                        home_vue.user_status = false;
                        alert('You have logged out!');
                    } else {
                        alert('Logout failed.');
                    }
                }
            };
            req.open('POST', '/logging_out');
            req.send();
        },

        check_user: function(){
            let req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200 && req.responseText === 'user') {
                console.log('works');
                home_vue.user_status = true;
                }
            };
            req.open('POST', '/check_user');
            req.send();
        },

        get_clubs: function(){
            let req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    console.log('works');
                    home_vue.club_names = JSON.parse(req.responseText);
                }
            };
            req.open('GET', '/get_allclubs_names');
            req.send();
        },

        get_clubinfo: function(sending_club_name) {
            let req = new XMLHttpRequest();

            let club = {clubname: sending_club_name};

            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    let club_information = JSON.parse(req.responseText);
                    localStorage.setItem('club_name', club_information[0].Club_name);
                    localStorage.setItem('club_bio', club_information[0].Club_bio);
                    localStorage.setItem('club_year', club_information[0].Founding_year);
                    window.location.href = 'clubPage.html';
                }
            };
            req.open('POST', '/get_club');
            req.setRequestHeader('Content-Type','application/json');
            req.send(JSON.stringify(club));
        },

        get_posts_4clubpage: function(sending_club_name) {
            let req = new XMLHttpRequest();

            let club = {clubname: sending_club_name};

            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    let post_information = JSON.parse(req.responseText);
                    localStorage.setItem('all_posts_clubpage', JSON.stringify(post_information));
                    // local storage stores string like key value pairs, hence we convert JSON to string
                }
            };
            req.open('POST', '/get_posts_clubpage');
            req.setRequestHeader('Content-Type','application/json');
            req.send(JSON.stringify(club));
        },

        get_events_4clubpage: function(sending_club_name) {
            let req = new XMLHttpRequest();

            let club = {clubname: sending_club_name};

            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    let event_information = JSON.parse(req.responseText);
                    localStorage.setItem('all_events_clubpage', JSON.stringify(event_information));
                }
            };
            req.open('POST', '/get_events_clubpage');
            req.setRequestHeader('Content-Type','application/json');
            req.send(JSON.stringify(club));

        }
    }
  });











  //VUE FOR CLUB_MANAGER HTML
  var club_manager_vue = new Vue({
    el: '#clubmanager',
    data: {
        club_manager_exists: false,
        my_club_name: '',
        users: []
    },

    mounted(){
        this.check_manager();
    },

    methods: {

        check_manager: function(){
            let req = new XMLHttpRequest();

            req.onreadystatechange = function(){
                if(req.readyState === 4){
                    if (req.status === 200) {
                        club_manager_vue.my_club_name = req.responseText;
                        club_manager_vue.club_manager_exists = true;
                    }
                }
            };

            req.open('GET','/users/check_manager');
            req.setRequestHeader('Content-Type','application/json');
            req.send();
        },

        get_club_users: function(){

            let the_club = {club_name: club_manager_vue.my_club_name};

            let req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    console.log(JSON.parse(req.responseText));
                    club_manager_vue.users = JSON.parse(req.responseText);
                }
            };
            req.open('POST', '/users/return_club_users');
            req.setRequestHeader('Content-Type','application/json');
            req.send(JSON.stringify(the_club));
        }

    }
  });






// PROFILEPAGE.HTML
var myvue = new Vue({
    el: "#profile",
    data: {
        edit: false,
        username: '',
        firstname: '',
        lastname: '',
        email: ''
    },

    mounted(){
        this.get_user_info();
    },

    methods: {
        get_user_info: function(){
            let req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if (req.readyState === 4 && req.status === 200) {
                    let user_info = JSON.parse(req.responseText)[0];
                    this.username = user_info.Username;
                    this.firstname = user_info.First_name;
                    this.lastname = user_info.Last_name;
                    this.email = user_info.Email;
                }
            };
            req.open('GET', '/users/getuserinfo');
            req.setRequestHeader('Content-Type','application/json');
            req.send();
        },

        change_details: function(){
            let updated_details = {
                username: myvue.username,
                first_name: myvue.firstname,
                last_name: myvue.lastname
            };

            let req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    console.log('Details changed');
                } else {
                    console.log('Details not changed');
                }
            };
            req.open('POST', '/users/update_userinfo');
            req.setRequestHeader('Content-Type','application/json');
            req.send(JSON.stringify(updated_details));
        }

    }

});








// LOGINPAGE.HTML
var myvue2 = new Vue({
    el: "#login_and_sign",
    data: {
        login: true,
        Username_login: '',
        Password_login: '',
        Show_Password: true,

        New_username: '',
        New_email: '',
        New_password: '',
        New_password_confirm: '',
        New_first_name: '',
        New_last_name: ''
    },

    methods: {

    // determines whether user wants password hidden or not
     toggle: function () {
        if (this.Show_Password === true) {
            this.Show_Password = false;
        } else {
            this.Show_Password = true;
        }
     },

    //function for user signup
    signup: function () {
        let sign_up = {
            email: this.New_email,
            username: this.New_username,
            password: this.New_password,
            first: this.New_first_name,
            last: this.New_last_name,
            user_type: "normal_user"
        };

        if (myvue2.New_password !== myvue2.New_password_confirm){
            alert("Passwords don't match");
            return;
        }

        let req = new XMLHttpRequest();

        req.onreadystatechange = function(){
            if (req.readyState === 4 && req.status === 400){
                alert('Fail! 1 or more fields have not been filled out.');
            }

            if (req.readyState === 4 && req.status === 409){
                alert('Fail! A user with that username already exists.');
            }

            if(req.readyState === 4 && req.status === 200){
                window.location.href = req.responseURL;
                alert('You have successfully signed up! Now you can login and enjoy all features of the site!'); // redirects user to home page
            } else if(req.readyState === 4 && req.status === 401){
                alert('Fail! You have not signed up');
            }
        };

        req.open('POST','/signing_up');
        req.setRequestHeader('Content-Type','application/json');
        req.send(JSON.stringify(sign_up));
     },

    // function which is called when google login is occuring
    googleLogin: function (response) {

        // console.log(response);
        // Sends the login token provided by google to the server for verification using an AJAX request
        let req = new XMLHttpRequest();

        req.onreadystatechange = function(){
            // Handle response from our server
            if(req.readyState === 4 && req.status === 200){
                // logged in with google - redirected to home page
                window.location.href = req.responseURL;
                alert('You have successfully logged in!');
            } else if(req.readyState === 4 && req.status === 401){
                alert('Did not log in with Google');
            }
        };

        // Open requst
        req.open('POST','/login');
        req.setRequestHeader('Content-Type','application/json');
        // Send the login token
        req.send(JSON.stringify(response));
    },

    // function for logging user in
    login_user: function () {
        let login = {
            username: this.Username_login,
            password: this.Password_login
        };

        // resetting username and password
        this.Username_login = 'Username';
        this.Password_login = 'Password';

        let req = new XMLHttpRequest();

        req.onreadystatechange = function(){
            if(req.readyState === 4 && req.status === 200){
                 // logged in manually - redirected to home page
                 window.location.href = req.responseURL;
                 alert('You have successfully logged in!');
            } else if(req.readyState === 4 && req.status === 401){
                alert('Login attempt has failed. No user found.');
            }
        };

        req.open('POST','/login');
        req.setRequestHeader('Content-Type','application/json');
        req.send(JSON.stringify(login));
    }

  }

});
// google cannot access vue function, so it must be called externally
function login_with_google(response) {
    myvue2.googleLogin(response);
}











// CREATECLUB PAGE
var myvue3 = new Vue({
    el: "#create",
    data: {
        club_name: '',
        club_description: '',
        club_year: ''
    },

    methods: {

    // function which saves the information on database
    make_club: function() {
        let new_club = {
            club_name: this.club_name,
            club_description: this.club_description,
            club_year: this.club_year
        };

        let req = new XMLHttpRequest();

        req.onreadystatechange = function(){
            if(req.readyState === 4){
                if (req.status === 409) {
                    alert('Club has not been created. User is already a club manager and associated with a club or club with the same name exists.');
                } else if (req.status === 200) {
                    alert('club created!');
                    window.location.href = req.responseURL;
                } else {
                    alert('club not created.');
                }
            }
        };

        req.open('POST','/users/makeclub');
        req.setRequestHeader('Content-Type','application/json');
        req.send(JSON.stringify(new_club));
    }

    }

});

