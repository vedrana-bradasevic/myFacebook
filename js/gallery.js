window.onload = function () {
    let user_id = getParameterByName('user_id');
    loadDataFromServer();
    loadProfileImage(user_id);
    loadGeneralInfo(user_id);
    getProfileHtml(user_id);

}

function loadDataFromServer() {
    loadUsers();
}

function getProfileHtml(user_id) {
    let profileA = document.getElementById('timeline');
    profileA.setAttribute('href', 'profile.html?user_id=' + user_id);
}


/**
 *Extract query parameter
 * @param {} name 
 * @param {*} url 
 */
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
            users = {}
            response.data.forEach(function (user_data) {
                users[user_data.id] = user_data;
            });
            console.log(users);
            // LOAD STATUSES
            loadStatuses();
        }
    };
    xhr.send(null);
}


/** 
 * This function gets filtered statuses 
 * Returns only statuses that belong to selected personal profile
*/
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
            getAllPhotos(statuses);
            // LOAD STATUS USER IMAGES
            loadStatusComments();
        }
    }
    xhr.send(null);
}


let comments;
function loadStatusComments() {
    //get comments from server
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
        }
    }
    xhr.send(null);
}



function loadProfileImage(user_id) {
    let users = [];
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
/**
 * This function gets photos from statuses and puts them into one container in gallery
 * @param {*} statuses 
 */
function getAllPhotos(statuses) {
    statuses.forEach(function (status) {
        if (status.image) {
            let galleryContainer = document.getElementById('gallery');
            let galleryDiv = document.createElement('div');
            let image = document.createElement('img');
            image.setAttribute('src', 'img/' + status.image);
            galleryContainer.appendChild(galleryDiv);
            galleryDiv.appendChild(image);
            image.onclick = (ev) => activateModal(ev, status);
        }

    });
}


document.getElementById("upload_button").onclick = addStatuses;

function addStatuses() {
    let userId = localStorage.getItem('userId');
    //provera validnosti statusa
    let valid = true;
    // let errorMsg = document.getElementById("error_msg");
    let imgDiv = document.getElementById("upload_image").files[0];

    /* if (statusInput.length > 140) {
         errorMsg.setAttribute("style", "display: block;");
         valid = false;
     } else {
         errorMsg.setAttribute("style", "display: none;");
     }*/

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

    if (valid) {
        let status = {
            id: makeid(),
            user_id: userId,
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


function refreshStatuses(statuses) {
    clearViewStatuses();
    loadStatuses(statuses);
}

function clearViewStatuses() {
    let statusContainer = document.getElementById('gallery');
    let statusLength = statusContainer.children.length;
    for (let i = 0; i < statusLength; i++) {
        statusContainer.removeChild(statusContainer.children[0]);
    }
}

function clearStatusContent() {
    document.getElementById("upload_image").value = document.getElementById("upload_image").defaultValue;
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

function addComment(commentInput, user_id) {
    let statusId = commentInput.parentNode.parentNode.getAttribute("id");
    let commentValue = commentInput.value;

    let comment = {
        id: makeid(),
        user_id: user_id,
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



/**
 * This function activates new window with selected image and comments.
 * @param {*} ev 
 * @param {*} status 
 * 
 */
function activateModal(ev, status) {
    let comment_Container = document.getElementById('comment_container');
    let newcommentInput = document.getElementById('new_comment');
    let newcommentInputlength = newcommentInput.children.length;
    let commentLength = comment_Container.children.length;

    // This for loops remove html content from parent, so it don't duplicate when selected again.
    for (let i = 0; i < commentLength; i++) {
        comment_Container.removeChild(comment_Container.children[0]);
    }
    for (let y = 0; y < newcommentInputlength; y++) {
        newcommentInput.removeChild(newcommentInput.children[0]);
    }

    // Renders html for status in modal window
    let user_id = getParameterByName('user_id');
    let modalImage = document.getElementById('modal_image');
    modalImage.setAttribute('src', ev.target.getAttribute('src'));
    let modal = document.getElementById('myModal');
    modal.style.display = "block";
    let statusUserImgLink = document.createElement('a');
    statusUserImgLink.setAttribute('href', 'profile.html?user_id=' + users[user_id].id);
    let statusUserImg = document.getElementById('users_image');
    statusUserImg.setAttribute('src', "img/" + users[status.user_id].image);
    statusUserImgLink.appendChild(statusUserImg);
    let statusProfileImage = document.getElementById('status_profile_image');
    statusProfileImage.appendChild(statusUserImgLink);
    document.getElementById('name_div_link').setAttribute('href','profile.html?user_id=' + users[user_id].id);
    let name = document.getElementById('nameDiv');
    name.innerHTML = users[status.user_id].firstName + " " + users[status.user_id].lastName;
    let statusContentDiv = document.getElementById('status');
    statusContentDiv.innerHTML = status.status;

    // Renders html for comments in modal window
    comments.forEach(function (comment) {
        if (status.id == comment.status_id) {
            let commentContainer = document.getElementById('comment_container');
            let commentTextCont = document.createElement('div');
            commentTextCont.setAttribute('class', 'comment_text_cont')
            let commentContent = document.createElement('div');
            commentContent.setAttribute('class', 'comment_content')
            let innertext = document.createElement('div');
            innertext.innerHTML = comment.comment;
            let commentUserDivLink = document.createElement('a');
            commentUserDivLink.setAttribute('href','profile.html?user_id=' + users[comment.user_id].id);
            let commentUserDiv = document.createElement('div');
            commentUserDiv.setAttribute('class', 'name');
            commentUserDivLink.appendChild(commentUserDiv);
            let commentUserName = document.createTextNode(users[comment.user_id].firstName);
            commentUserDiv.appendChild(commentUserName);
            let commentUserImageLink = document.createElement('a');
            commentUserImageLink.setAttribute('href', 'profile.html?user_id=' + users[comment.user_id].id);
            let commentUserImage = document.createElement('img');
            commentUserImage.setAttribute('src', 'img/' + users[comment.user_id].image);
            commentUserImage.setAttribute('class', 'comment_users_img');

            commentUserImageLink.appendChild(commentUserImage);
            commentContent.appendChild(commentUserImageLink);
            commentTextCont.appendChild(commentUserDivLink);
            commentTextCont.appendChild(innertext);
            commentContent.appendChild(commentTextCont);
            commentContainer.appendChild(commentContent);
        }
    });


    // Renders html for enetering new comment in modal window
    let userId = localStorage.getItem('userId');
    let input = document.getElementById('new_comment');
    let newComment = document.createElement('div');
    let commentInput = document.createElement('input');
    let commentInputProfileImg = document.createElement('a');
    commentInputProfileImg.setAttribute('href', 'profile.html?user_id=' + users[userId].id);
    newComment.setAttribute('class', 'new_comment');
    commentInput.setAttribute('class', 'comment_input input')
    commentInput.setAttribute('placeholder', 'Comment...');
    let commentImg = document.createElement('img');
    commentImg.setAttribute('src', 'img/' + users[userId].image);
    commentImg.setAttribute('class', 'comment_users_img');
    commentInputProfileImg.appendChild(commentImg);
    newComment.appendChild(commentInputProfileImg);
    newComment.appendChild(commentInput);
    input.appendChild(newComment);

    commentInput.addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            addComment(this, user_id);
        }
    });

}
