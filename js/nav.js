"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories() {
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  userNavOnPage(currentUser);
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show new story form on click on "Submit" */

function navSubmitClick() {
  hidePageComponents();
  $newStoryForm.show();
}

$navSubmit.on("click", navSubmitClick);

function navFavoritesClick() {
  hidePageComponents();
  putFavoritesOnPage();
  $favStoriesList.show();
}

$navFavorites.on("click", navFavoritesClick);
