"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  $allStoriesList.show();
  $favStoriesList.hide();
  updateNavOnLogin();
}

function hideUserElementsOnStart() {
  [$navFavorites, $favStoriesList, $navSubmit].forEach((x) => x.hide());
}

/******************************************************************************
 *  Logic for when user selects favorites
 */

async function handleFavoriteClick(evt) {
  const favID = evt.target.parentElement.parentElement.id;
  const method = evt.target.checked ? "post" : "delete";
  const url = `${BASE_URL}/users/${currentUser.username}/favorites/${favID}`;

  if (currentUser) {
    await axios({
      headers: { "Content-Type": "application/json" },
      method,
      url,
      data: {
        token: currentUser.loginToken,
      },
    });
  }
  // updates CurrentUser favorites
  checkForRememberedUser();
}

$allStoriesList.on("click", "input.story-favorite", handleFavoriteClick);

function checkFavorites() {
  if (currentUser) {
    const favoriteIds = currentUser.favorites.map((fav) => fav.storyId);

    $allStoriesList.children().each((_, li) => {
      if (favoriteIds.includes(li.id)) {
        $(li).find(".story-favorite").prop("checked", true);
      }
    });
  }
}

function putFavoritesOnPage() {
  if (currentUser) {
    console.debug("putFavoritesOnPage");

    $favStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateFavoriteMarkup(story);
      $favStoriesList.append($story);
    }

    $favStoriesList.show();
  }
}

function generateFavoriteMarkup(story) {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        
        
      </li>
    `);
}
