document.getElementById("login_btn").onclick = login;
document.getElementById("signup_btn").onclick = signup;


// Function for registering new user
function signup() {

    let gender;
    let radios = document.getElementsByClassName('gender');
    for (let i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            gender = radios[i].value;
            break;
        }
    }
    let user = {
        id: makeId(),
        firstName: document.getElementById("firstname").value,
        lastName: document.getElementById("lastname").value,
        username: document.getElementById("username").value,
        phoneNumber: document.getElementById("phonenumber").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        birthday: document.getElementById("birthday").value,
        gender: gender
    }



    /* // Validation rules
     var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
     var valid = true;
 
     if (format.test(user.username)) {
         errors.innerHTML += '<div class="error-msg">Username can\'t contain special characters.</div>';
         valid = false;
     }
 
     if (format.test(user.password)) {
         errors.innerHTML += '<div class="error-msg">Password can\'t contain special characters.</div>';
         valid = false;
     }
 
     if (user.username.length < 5 || user.username.length > 12) {
         errors.innerHTML += '<div class="error-msg">Username must contain between 5 and 12 characters.</div>';
         valid = false;
     }
 
     if (user.password.length < 5 || user.password.length > 12) {
         errors.innerHTML += '<div class="error-msg">Password must contain between 5 and 12 characters.</div>';
         valid = false;
     }
 */
    user.password = md5(user.password);
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'php/add_user.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(xhr.responseText);
            if (data.success != '') {
                console.log('New user registered');
            }
        }
    }
    let data = JSON.stringify(user);
    xhr.send(data);

}



// Function for logging in user
function login() {
    let login = {
        id: null,
        username: document.getElementById("login_name").value,
        password: document.getElementById("login_pass").value,
    }

    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_users.php', true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            response.data.forEach(function (user_data) {
                if (user_data.username == login.username && user_data.password == md5(login.password)) {
                    localStorage.setItem('userId', user_data.id);
                    console.log(user_data);
                    login.id = user_data.id;
                }
            });
            if (login.id !== null) {
                document.location.replace('newsfeed.html');
            } else {
                document.getElementById('login-error').innerHTML = 'Wrong username and password combination.';
            }
        }
    }
    xhr.send(null);
}

// Generate random characters for id
function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}


