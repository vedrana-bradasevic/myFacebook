
window.onload = function () {
    let user_id = getParameterByName('user_id');
    // loadStatuses(user_id);
    // loadUsers();
    loadDataFromServer();
    loadProfileImage(user_id);
    loadGeneralInfo(user_id);
    getPhotosHtml(user_id);
}
function loadDataFromServer() {
    loadUsers();
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


let users;
function loadUsers() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_users.php', true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            users = {};
            response.data.forEach(function (user_data) {
                users[user_data.id] = user_data;
            });
            // LOAD STATUSES
            loadStatuses();
        }
    };
    xhr.send(null);
}

let statuses = [];
function loadStatuses() {
    let user_id = getParameterByName('user_id');
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_statuses.php', true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            statuses = response.data;
            statuses = statuses.filter(function (status) {
                return status.user_id === user_id;
            });
            loadStatusUserImage(statuses);
        }
    }
    xhr.send(null);
}

/// Upload profile image on status
function loadStatusUserImage(statuses) {
    let users = [];
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_users.php', true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            users = response.data;
            // createStatuses(statuses, users);
            // NOW LOAD STATUS COMMENTS
            loadStatusComments();
        }
    }
    xhr.send(null);
}

let comments;
function loadStatusComments() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_comments.php', true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.data) {
                comments = response.data;
            } else {
                comments = [];
            }
            // NOW CREATE STATUSES
            createStatuses(statuses, users);
        }
    }
    xhr.send(null);
}



function loadProfileImage(user_id) {
    let users = [];
    let userId = localStorage.getItem('userId');
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_users.php', true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            users = response.data;
            users.forEach(function (user_data) {
                if (user_id == user_data.id) {
                    if (user_data.image) {
                        document.getElementById("profile_image").src = "img/" + user_data.image;
                    } else {
                        document.getElementById("profile_image").src = "img/unknownperson.png";
                    }

                }
            });
        }
    }
    xhr.send(null);
}


/**
 *  Getting to photos.html
 * @param {*} user_id 
 */
function getPhotosHtml(user_id) {
    let photosA = document.getElementById('photos');
    photosA.setAttribute('href', 'gallery.html?user_id=' + user_id);
}

/**
 * Rendering status html
 * @param {*} statuses 
 * @param {*} users 
 */
function createStatuses(statuses, users) {
    console.log(statuses);
    statuses.forEach(function (status) {
        let userId = localStorage.getItem('userId');
        let statusContainer = document.getElementById("status_container")
        let statusSection = document.createElement('section');
        statusSection.setAttribute('id', status.id);

        let statusUsers = document.createElement('div');
        let statusUsersImg = document.createElement('img');
        let imageName;
        // kreiram IME i prezime usera
        let usersName = document.createElement('div');
        usersName.setAttribute('class', 'users_name');
        statusUsers.appendChild(usersName);
        // delete X
        let x = document.createElement('i');
        x.setAttribute('class', 'fa fa-times');
        if (userId == status.user_id) {
            statusUsers.appendChild(x);
        }
        x.onclick = deleteStatus;


        //Adding name to user that posts status
        let statusUser = users[status.user_id];
        let name = statusUser.firstName + " " + statusUser.lastName;
        usersName.innerHTML = name;
        imageName = statusUser.image;

        if (!imageName) {
            imageName = "unknownperson.png";
        }
        statusUsersImg.src = "img/" + imageName;
        statusUsers.setAttribute('class', 'status_users');
        statusUsersImg.setAttribute('class', 'status_users_image')
        let profileLink = document.createElement('a');
        profileLink.setAttribute('href', 'profile.html?user_id=' + status.user_id);
        statusUsers.appendChild(profileLink);
        profileLink.appendChild(statusUsersImg);
        statusSection.appendChild(statusUsers);



        if (status.status != '') {
            let statusDiv = document.createElement("div");
            statusDiv.setAttribute('class', 'status_text');
            let statusText = document.createTextNode(status.status)
            statusDiv.appendChild(statusText);
            statusSection.appendChild(statusDiv);
        }

        if (status.image) {
            let imgDiv = document.createElement("div");
            imgDiv.setAttribute('class', 'status_image');
            let img = document.createElement("img");
            img.setAttribute("src", 'img/' + status.image);
            img.setAttribute("class", 'statusImage');
            imgDiv.appendChild(img);
            statusSection.appendChild(imgDiv);
        }

        //Comment section 
        let oldComments = document.createElement('div');
        oldComments.setAttribute('class', 'old_comments');
        let section = document.createElement('section');
        section.setAttribute('class','section');

        // Comment user image
        let statusComments = comments.filter(function (comment) {
            return comment.status_id == status.id;
        });

        for (let i = 0; i < statusComments.length; i++) {
            let commentDiv = document.createElement('div');
            let commentSpan = document.createElement('span');
            let commentText = document.createTextNode(statusComments[i].comment);
            let commentsUserImg = document.createElement('img');
            let commentsProfileImg = document.createElement('a');
            let commentTextContent = document.createElement('div');
            commentTextContent.setAttribute('class','comment_text_cont');
            let commentUserName = document.createElement('div');
            let commentUserNameText = document.createTextNode(users[statusComments[i].user_id].firstName + " " + users[statusComments[i].user_id].lastName);
            commentUserName.setAttribute('class','comment_user_name');
            commentsProfileImg.setAttribute('href', 'profile.html?user_id=' + users[statusComments[i].user_id].id);
            commentsUserImg.setAttribute('src', 'img/' + users[statusComments[i].user_id].image);
            commentsUserImg.setAttribute('class', 'comments_user_img');
            commentDiv.setAttribute('class','old_comments_div')

            commentsProfileImg.appendChild(commentsUserImg);
            commentUserName.appendChild(commentUserNameText);
            commentSpan.appendChild(commentText);
            commentDiv.appendChild(commentsProfileImg);
            commentTextContent.appendChild(commentUserName);
            commentTextContent.appendChild(commentSpan);
            commentDiv.appendChild(commentTextContent);
            section.appendChild(commentDiv);
            oldComments.appendChild(section);
        }
           if (oldComments.children.length){
            statusSection.appendChild(oldComments);
        }


        //Create new comment
        let newComment = document.createElement('div');
        let commentInput = document.createElement('input');
        let commentInputProfileImg = document.createElement('a');
        commentInputProfileImg.setAttribute('href', 'profile.html?user_id=' + users[userId].id);
        newComment.setAttribute('class', 'new_comment');
        commentInput.setAttribute('class', 'comment_input')
        commentInput.setAttribute('placeholder', 'Comment...');
        let commentImg = document.createElement('img');
        commentImg.setAttribute('src', 'img/' + users[userId].image);
        commentImg.setAttribute('class', 'comment_img');
        commentInputProfileImg.appendChild(commentImg);
        newComment.appendChild(commentInputProfileImg);
        newComment.appendChild(commentInput);
        statusSection.appendChild(newComment);
        statusContainer.appendChild(statusSection);

        commentInput.addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                addComment(this, userId);
            }
        });

    });
}

function addComment(commentInput, userId) {
    let statusId = commentInput.parentNode.parentNode.getAttribute("id");
    let commentValue = commentInput.value;

    let comment = {
        id: makeid(),
        user_id: userId,
        comment: commentValue,
        status_id: statusId,
        created_at: getDateTime(),
        timestamp: getTimestamp()
    }
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'php/add_comment.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.success != '') {
                refreshStatuses();
            }
        }
    }
    let data = JSON.stringify(comment);
    xhr.send(data);
}


//izbrisi statuse
function deleteStatus() {
    let parentSection = this.parentNode.parentNode.getAttribute('id');
    console.log(parentSection);
    if (confirm("Do you want to remove this post?")) {
        document.getElementById(parentSection);
        //php delete + status refresh()
    }
}


function refreshStatuses() {
    clearViewStatuses();
    loadStatuses();
}
function clearViewStatuses() {
    let statusContainer = document.getElementById('status_container');
    let statusLength = statusContainer.children.length;
    for (let i = 0; i < statusLength; i++) {
        statusContainer.removeChild(statusContainer.children[0]);
    }
}
function clearStatusContent() {
    document.getElementById("status_update").value = '';
    document.getElementById("share_image").value = document.getElementById("share_image").defaultValue;
}

function loadGeneralInfo(user_id) {
    let users = [];
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_users.php', true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            users = response.data;
            users.forEach(function (user_data) {
                if (user_id == user_data.id) {
                    document.getElementById("name").innerHTML = user_data.firstName + " " + user_data.lastName;
                    document.getElementById("gender").innerHTML = user_data.gender;
                    document.getElementById("phonenumber").innerHTML = user_data.phoneNumber;
                    document.getElementById('birthday').innerHTML = user_data.birthday;
                }

            });
        }
    }
    xhr.send(null);
}

function makeid() {
    let text = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += characters.charAt(Math.floor(Math.random() * characters.length));
    return text;
}


// Return current datetime string
function getDateTime() {
    var currentdate = new Date();
    return currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes();
}

// Return current timestamp as numeric record
function getTimestamp() {
    return new Date().getTime();
}