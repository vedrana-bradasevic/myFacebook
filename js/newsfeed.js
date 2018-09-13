
window.onload = function () {
    // This function loads users,statuses, status comments and prints statuses.
    loadDataFromServer();
    // Loads only profile image from logged in user.
    loadProfileImage();
    // Loads only information from logged in user.
    loadGeneralInfo();
}

function loadDataFromServer() {
    loadUsers();
}

let users;
/**
 * This method retrieves all users from backend 
 * and store in global variable.
 */
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


/**
 * This function loads all statuses.
 * It loads filtered statuses if statuses are filtered f.ex on personal profiles
 */
function loadStatuses(filteredStatuses) {
    if (filteredStatuses) {
        // If statuses already exist just print statuses
        loadStatusComments(filteredStatuses);
    } else {
        // If statuses are not loaded, load them now
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'php/get_statuses.php', true);
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                if (response.data) {
                    statuses = response.data;
                } else {
                    statuses = [];
                }
                loadStatusComments();
            }
        }
        xhr.send(null);
    }
}


/**
 * This function gets all comments from service.
 */
let comments;
function loadStatusComments(filteredStatuses) {
    // Get comments from server
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
            if (filteredStatuses) {
                // Print statuses
                createStatuses(filteredStatuses, users);
            } else {
                createStatuses(statuses, users);
            }
        }
    }
    xhr.send(null);
}

/**
 * Getting profile image from backend if there is one, 
 * and if there isn't, I put default image on profile.
 */
function loadProfileImage() {
    let users = [];
    let userId = localStorage.getItem('userId');
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_users.php', true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            users = response.data;
            users.forEach(function (user_data) {
                if (userId == user_data.id) {
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
 * This method renders statuses in html.
 * Statuses is global variable because I use it multiple functions.
 */
let statuses = [];
document.getElementById("share_btn").onclick = addStatuses;
function createStatuses() {
    statuses.forEach(function(status) {
        let userId = localStorage.getItem('userId');
        let statusContainer = document.getElementById("status_container")
        let statusSection = document.createElement('section');
        statusSection.setAttribute('id', status.id);
        statusSection.setAttribute('class', 'status_section')

        let statusUsers = document.createElement('div');
        let statusUsersImg = document.createElement('img');
        let imageName;

        // Create username for status owner.
        let usersName = document.createElement('div');
        usersName.setAttribute('class', 'users_name');
        statusUsers.appendChild(usersName);

        // Create delete status icon.
        let x = document.createElement('i');
        x.setAttribute('class', 'fa fa-times');
        if (userId == status.user_id) {
            statusUsers.appendChild(x);
        }
        x.onclick = deleteStatus;


        // Get status users name and image from users.
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

        // If status has text, then create status in html.
        if (status.status != '') {
            let statusDiv = document.createElement("div");
            statusDiv.setAttribute('class', 'status_text');
            let statusText = document.createTextNode(status.status)
            statusDiv.appendChild(statusText);
            statusSection.appendChild(statusDiv);
        }

        // If status has image, then create status with image in html.
        if (status.image) {
            let imgDiv = document.createElement("div");
            imgDiv.setAttribute('class', 'status_image');
            let img = document.createElement("img");
            img.setAttribute("src", 'img/' + status.image);
            img.setAttribute("class", 'statusImage');
            imgDiv.appendChild(img);
            statusSection.appendChild(imgDiv);
        }

        //** Create comments html code **//
        let oldComments = document.createElement('div');
        oldComments.setAttribute('class', 'old_comments');
        let section = document.createElement('section');
        section.setAttribute('class', 'section');

        // Filter status comments.
        let statusComments = comments.filter(function (comment) {
            return comment.status_id == status.id;
        });

        // Create status comments html and load data.
        for (let i = 0; i < statusComments.length; i++) {
            let commentDiv = document.createElement('div');
            let commentSpan = document.createElement('span');
            let commentText = document.createTextNode(statusComments[i].comment);
            let commentsUserImg = document.createElement('img');
            let commentsProfileImg = document.createElement('a');
            let commentTextContent = document.createElement('div');
            commentTextContent.setAttribute('class', 'comment_text_cont');
            let commentUserName = document.createElement('div');
            let commentUserNameText = document.createTextNode(users[statusComments[i].user_id].firstName + " " + users[statusComments[i].user_id].lastName);
            commentUserName.setAttribute('class', 'comment_user_name');
            commentsProfileImg.setAttribute('href', 'profile.html?user_id=' + users[statusComments[i].user_id].id);
            commentsUserImg.setAttribute('src', 'img/' + users[statusComments[i].user_id].image);
            commentsUserImg.setAttribute('class', 'comments_user_img');
            commentDiv.setAttribute('class', 'old_comments_div')
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

        if (oldComments.children.length) {
            statusSection.appendChild(oldComments);
        }

        // Create new comment, input field for entering comments.
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

        // Enabling enter key on input field for sending input value.
        commentInput.addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                addComment(this, userId);
            }
        });

    });
}


/**
 * This function detects selected status and removes it.
 */
function deleteStatus() {
    let parentSection = this.parentNode.parentNode.getAttribute('id');
    if (confirm("Do you want to remove this post?")) {
        document.getElementById(parentSection);
        //php delete + status refresh()
    }
}


/**
 *  Function that adds new statuses.
 *  Using AJAX to send requests to backend.
 *  Two requests are sent, one that contains image if there is any in status, and the other
 * send whole status (image and text or just text).
 */
function addStatuses() {
    let userId = localStorage.getItem('userId');
    // Checking validity of status
    let valid = true;
    let errorMsg = document.getElementById("error_msg");
    let statusInput = document.getElementById("status_update").value;
    let imgDiv = document.getElementById("share_image").files[0];

    if (statusInput.length > 140) {
        errorMsg.setAttribute("style", "display: block;");
        valid = false;
    } else {
        errorMsg.setAttribute("style", "display: none;");
    }

    // Xhr sending status image
    if (imgDiv !== undefined) {
        let xhr = new XMLHttpRequest();
        let url = 'php/upload.php?user_id=' + userId + '&timestamp=' + getTimestamp();
        xhr.open('POST', url, true);
        let formData = new FormData();
        formData.append('image', imgDiv);
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("slika uspesno dodata");
            }
        }
        xhr.send(formData);
    }


    /**
     * Xhr sending status 
     * It is sending both, image and status in one request.
     */
    if (valid) {
        let status = {
            id: makeid(),
            user_id: userId, // UserId in newsfeed is the one from localStorage.
            status: statusInput,
            image: imgDiv ? imgDiv.name : '',
            created_at: getDateTime(),
            timestamp: getTimestamp()
        }

        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'php/add_status.php', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                if (response.success != '') {
                    refreshStatuses();
                    clearStatusContent();
                }
            }
        }
        let data = JSON.stringify(status);
        xhr.send(data);

    }
}

/**
 * Removing existing statuses, and again adding them so they don't duplicate.
 */
function refreshStatuses(statuses) {
    // This removes statuses from html
    clearViewStatuses();

    // This function loads them again
    loadStatuses(statuses);
}

function clearViewStatuses() {
    let statusContainer = document.getElementById('status_container');
    let statusLength = statusContainer.children.length;
    for (let i = 0; i < statusLength; i++) {
        statusContainer.removeChild(statusContainer.children[0]);
    }
}


/**
 * Removes text from input field.
 */
function clearStatusContent() {
    document.getElementById("status_update").value = '';
    document.getElementById("share_image").value = document.getElementById("share_image").defaultValue;
}


/**
 *  Before sending image to the backend service, uploaded image is shown to the user
 * and he can decide if he wants to save the change or discard.
 */
let yes = document.getElementById('yes');
yes.onclick = changeProfileImage;
function beforeChangeProfileImage(event) {
    let changeProfileImage = event.target.files[0];
    let profileImage = document.getElementById("profile_image");
    let fileType = changeProfileImage["type"];

    if (fileType.includes('image')) {
        let reader = new FileReader();
        reader.onload = function (event) {
            profileImage.src = event.target.result;
        };
        reader.readAsDataURL(changeProfileImage);
        document.getElementById('right_profile_image').setAttribute('style', 'display:block');
        document.getElementById('wrong_profile_image').setAttribute('style', 'display:none');

    } else {
        profileImage.setAttribute('src', 'img/unknownperson.png');
        document.getElementById('wrong_profile_image').setAttribute('style', 'display:block');
        document.getElementById('right_profile_image').setAttribute('style', 'display:none');
    }
}

/**
 * Using this function logged in user can change his profile image.
 * It takes uploaded image and sends it to backend service.
 */
function changeProfileImage() {
    let changeProfileImage = document.getElementById("change_profile_image").files[0];
    let profileImage = document.getElementById("profile_image");
    let userId = localStorage.getItem('userId');

    if (profileImage !== undefined) {
        let xhr = new XMLHttpRequest();
        let url = 'php/profile_image_upload.php?user_id=' + userId;
        xhr.open('POST', url, true);
        let formData = new FormData();
        formData.append('image', changeProfileImage);
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById('right_profile_image').setAttribute('style', 'display:none');
            }
        }
        xhr.send(formData);
    }
}

/**
 * Retrieves all general info of logged user
 * and shows it the profile section.
 */
function loadGeneralInfo() {
    let users = [];
    let userId = localStorage.getItem('userId');
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_users.php', true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhr.responseText);
            users = response.data;
            users.forEach(function (user_data) {
                if (userId == user_data.id) {
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

// Send comments using xhr
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

// Return random new identifier
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



