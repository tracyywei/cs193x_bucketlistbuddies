import BucketList from "./bucketlist.js";
import User, { Post } from "./user.js";

export default class App {
  constructor() {
    /* Store the currently logged-in user. */
    this._user = null;

    this._onListUsers = this._onListUsers.bind(this);

    this._handleLogin = this._handleLogin.bind(this);
    this._loginForm = document.querySelector("#loginForm");
    this._loginForm.listUsers.addEventListener("click", this._onListUsers);
    this._loginForm.login.addEventListener("click", this._handleLogin);

    this._postForm = document.querySelector("#postForm");
    this._nameForm = document.querySelector("#nameItem");
    this._avatarForm = document.querySelector("#avatarItem");

    // editing display name and avatar
    this._handleNameChange = this._handleNameChange.bind(this);
    this._handleAvatarChange = this._handleAvatarChange.bind(this);
    document.querySelector("#nameSubmit").addEventListener("click", this._handleNameChange);
    document.querySelector("#avatarSubmit").addEventListener("click", this._handleAvatarChange);

    // follow and unfollow
    this._handleFollow = this._handleFollow.bind(this);
    this._handleUnfollow = this._handleUnfollow.bind(this);

    this._followList = new FollowList(document.querySelector("#followContainer"), this._handleFollow, this._handleUnfollow);

    // creating new post
    this._handlePost = this._handlePost.bind(this);
    document.querySelector("#postButton").addEventListener("click", this._handlePost);
  }

  /*** Event handlers ***/

  /* When the user enters their user ID into the login input and clicks "Login," their profile is loaded */
  async _handleLogin(event) {
    event.preventDefault();
    let curID = this._loginForm.userid.value;
    let curPhone = this._loginForm.phoneNum.value;
    this._user = await User.loadOrCreate(curID, curPhone);
    this._loadProfile();
  }

  /* edit their display name and avatar URL */
  async _handleNameChange(event) {
    event.preventDefault();
    this._user.name = document.querySelector("#nameInput").value;
    this._user.save();
    this._loadProfile();
  }

  async _handleAvatarChange(event) {
    event.preventDefault();
    this._user.avatarURL = document.querySelector("#avatarInput").value;
    this._user.save();
    this._loadProfile();
  }

  /* add item to bucket list */


  /* remove item from bucket list */


  /* follow a user */
  async _handleFollow(id) {
    await this._user.addFollow(id);
    this._loadProfile();
  }

  /* unfollow a user */
  async _handleUnfollow(id) {
    await this._user.deleteFollow(id);
    this._loadProfile();
  }

  /* make a new post */
  async _handlePost(event) {
    event.preventDefault();
    let postText = document.querySelector("#newPost").value;
    this._user.makePost(postText);
    this._loadProfile();
    document.querySelector("#newPost").value = "";
  }

  /*** Helper methods ***/

  async _onListUsers() {
    let users = await User.listUsers();
    let usersStr = users.join("\n");
    alert(`List of users:\n\n${usersStr}`);
  }

  /* Add the given Post object to the feed. */
  _displayPost(post) {
    /* Make sure we receive a Post object. */
    if (!(post instanceof Post)) throw new Error("displayPost wasn't passed a Post object");

    let elem = document.querySelector("#templatePost").cloneNode(true);
    elem.id = "";

    let avatar = elem.querySelector(".avatar");
    avatar.src = post.user.avatarURL;
    avatar.alt = `${post.user}'s avatar`;

    elem.querySelector(".name").textContent = post.user;
    elem.querySelector(".userid").textContent = post.user.id;
    elem.querySelector(".time").textContent = post.time.toLocaleString();
    elem.querySelector(".text").textContent = post.text;

    document.querySelector("#feed").append(elem);
  }

  /* Load (or reload) a user's profile. Assumes that this._user has been set to a User instance. */
  async _loadProfile() {
    document.querySelector("#welcome").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
    document.querySelector("#idContainer").textContent = this._user.id;
    /* Reset the feed. */
    document.querySelector("#feed").textContent = "";

    /* Update the avatar, name, and user ID in the new post form */
    this._postForm.querySelector(".avatar").src = this._user.avatarURL;
    this._postForm.querySelector(".name").textContent = this._user;
    this._postForm.querySelector(".userid").textContent = this._user.id;

    // In the sidebar, their user ID is shown, and their display name and avatar URL are filled in the <input>s
    document.querySelector("#avatarInput").value = this._user.avatarURL;
    document.querySelector("#nameInput").value = this._user;

    // "Following" panel shows a list of users they are currently following
    let userList = this._user.followers;
    await this._followList.setList(userList);

    // The feed panel on the left shows the posts by the users they follow, as well as their own posts, from newest to oldest.
    let userFeed = await this._user.getFeed();
    for (let post of userFeed) {
      this._displayPost(new Post(post));
    }
  }
}
