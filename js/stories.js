"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <label>Favorite<input class="story-favorite" type="checkbox" /></label>
        <button class="story-remove" type="button" >Remove</button>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
  checkFavorites();
}

// Submit new story to API and display it on page
async function postAndShowNewStory(evt) {
  evt.preventDefault();

  const storyObj = {
    title: $("#new-story-title").val(),
    author: $("#new-story-author").val(),
    url: $("#new-story-url").val(),
  };

  $("#new-story-title").val("");
  $("#new-story-author").val("");
  $("#new-story-url").val("");

  await storyList.addStory(currentUser, storyObj);
  hidePageComponents();
  await getAndShowStoriesOnStart();
}

$newStoryForm.on("submit", postAndShowNewStory);

// /******************************************************************************

//  *  Logic for when user removes a story
//  */

async function handleRemoveClick(evt) {
  const favID = evt.target.parentElement.id;

  if (currentUser) {
    const url = `${BASE_URL}/stories/${favID}`;
    if (currentUser) {
      await axios({
        headers: { "Content-Type": "application/json" },
        method: "delete",
        url,
        data: {
          token: currentUser.loginToken,
        },
      });
    }
    // updates page UI
    // await getAndShowStoriesOnStart();
    storyList = await StoryList.getStories();
    putStoriesOnPage();
  }
}

$allStoriesList.on("click", "button.story-remove", handleRemoveClick);
