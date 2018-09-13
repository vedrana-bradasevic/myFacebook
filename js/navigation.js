(function() {

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
                loadProfileImageinNav();
                getUsernameinNav();
                setProfileLink();
            }
        };
        xhr.send(null);
    }


    /**
     *  Search bar for filtering statuses
     */
    document.getElementById('search_button').onclick = filterStatuses;
    function filterStatuses() {
        let wantedWord = document.getElementById("search").value.toLowerCase();
        let filteredStatuses = [];
        statuses.forEach(function (status) {
            let user = users[status.user_id];
            let includesFirstName = user.firstName.toLowerCase().includes(wantedWord);
            let includesLastName = user.lastName.toLowerCase().includes(wantedWord);
            let includesStatus = includesFirstName || includesLastName;
            if (includesStatus) {
                filteredStatuses.push(status);
            }
        });
        console.log(filteredStatuses);
        refreshStatuses(filteredStatuses);
    }
    


    // Upload profile image in navigation
    function loadProfileImageinNav() {
        let userId = localStorage.getItem('userId');
        let user = users[userId];
        if (user.image) {
            document.getElementById("user_profile").src = "img/" + user.image;
        } else {
            document.getElementById("user_profile").src = "img/unknownperson.png";
        }

    }

    // Get username in navigation bar
    function getUsernameinNav(){
        let userId = localStorage.getItem('userId');
        let user = users[userId];
        document.getElementById('profile_username').innerHTML = user.firstName;
    }
  
    function setProfileLink(){
        let userId = localStorage.getItem('userId');
        document.getElementById('profile_link').setAttribute('href','profile.html?user_id=' + userId);
    }





    // ON LOAD
    let users;
    loadUsers();

})();
