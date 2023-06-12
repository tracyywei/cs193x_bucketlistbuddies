import User, { Post } from "./user.js";

export default class App {
  constructor() {
    /* Store the currently logged-in user. */
    this._user = null;

    this._handleLogin = this._handleLogin.bind(this);
    this._loginForm = document.querySelector("#loginForm");
    this._loginForm.login.addEventListener("click", this._handleLogin);

    this._postForm = document.querySelector("#postForm");
    this._nameForm = document.querySelector("#nameItem");
    this._avatarForm = document.querySelector("#avatarItem");

    // editing display name and avatar
    this._handleNameChange = this._handleNameChange.bind(this);
    this._handleAvatarChange = this._handleAvatarChange.bind(this);
    document.querySelector("#nameSubmit").addEventListener("click", this._handleNameChange);
    document.querySelector("#avatarSubmit").addEventListener("click", this._handleAvatarChange);

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
    if (this._user !== null) {
      this._loadProfile();
    }
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

  /* make a new post */
  async _handlePost(event) {
    event.preventDefault();
    let postText = document.querySelector("#newPost").value;
    await this._user.makePost(postText);
    document.querySelector("#newPost").value = "";
    this._loadProfile();
  }

  /*** Helper methods ***/

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

    let addButton = elem.querySelector(".addToList");
    addButton.addEventListener("click", () => {
      this._user.addItem(post.text); // Add the post to the activities list
      this._loadProfile();
    });

    document.querySelector("#feed").append(elem);
  }

  /* Add the given Post object to the user's own posts feed. */
  async _displayMyPost(post) {
    /* Make sure we receive a Post object. */
    if (!(post instanceof Post)) throw new Error("displayPost wasn't passed a Post object");

    let elem = document.querySelector("#userTemplatePost").cloneNode(true);
    elem.id = "";

    let avatar = elem.querySelector(".avatar");
    avatar.src = post.user.avatarURL;
    avatar.alt = `${post.user}'s avatar`;

    elem.querySelector(".name").textContent = post.user;
    elem.querySelector(".userid").textContent = post.user.id;
    elem.querySelector(".time").textContent = post.time.toLocaleString();
    elem.querySelector(".text").textContent = post.text;

    if (post.user.id === this._user.id) {
      elem.querySelector(".texting").style.display = "none";
    }

    let checkButton = elem.querySelector(".checkoff");
    checkButton.addEventListener("click", () => {
      this._user.deleteItem(post.text); // Delete the post completely
      this._loadProfile();
    });

    let textButton = elem.querySelector(".texting");
    textButton.addEventListener("click", () => {
      alert("Texting " + post.user + " (" + post.user.phone + ")...");
    });

    let text = post.text;
    let buddies = await this._user.getBuddies(text);
    for (let bud of buddies) {
      let buddy = document.querySelector("#buddy").cloneNode(true);
      buddy.classList.remove("hidden");
      buddy.querySelector(".name").textContent = bud.name;
      buddy.querySelector(".userid").textContent = bud.id;
      buddy.querySelector(".profilepic").src = bud.avatarURL;
      buddy.querySelector(".profilepic").alt = `${bud.name}'s avatar`;
      //console.log(buddy);
      //document.querySelector("#buddiesContainer").append(buddy);
      elem.querySelector("#buddy").classList.remove("hidden");
      elem.querySelector("#buddiesContainer").append(buddy);
      //console.log(document.querySelector("#buddiesContainer"));
    }

    document.querySelector("#myFeed").append(elem);
    console.log(elem);
  }

  /* Load (or reload) a user's profile. Assumes that this._user has been set to a User instance. */
  async _loadProfile() {
    document.querySelector("#welcome").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
    document.querySelector("#idContainer").textContent = this._user.id;
    document.querySelector("#phoneContainer").textContent = this._user.phone;
    /* Reset the feed. */
    document.querySelector("#feed").textContent = "";
    document.querySelector("#myFeed").textContent = "";

    /* Update the avatar, name, and user ID in the new post form */
    this._postForm.querySelector(".avatar").src = this._user.avatarURL;
    this._postForm.querySelector(".name").textContent = this._user;
    this._postForm.querySelector(".userid").textContent = this._user.id;

    // Update the avatar in the edit profile panel
    document.querySelector(".profileHeader").querySelector(".avatar").src = this._user.avatarURL;

    // In the sidebar, their user ID is shown, and their display name and avatar URL are filled in the <input>s
    document.querySelector("#avatarInput").value = this._user.avatarURL;
    document.querySelector("#nameInput").value = this._user;

    let myFeed = await this._user.getUserPosts();
    for (let post of myFeed) {
      this._displayMyPost(new Post(post));
    }

    // The feed panel
    let userFeed = await this._user.getFeed();
    for (let post of userFeed) {
      this._displayPost(new Post(post));
    }
  }
}
