import apiRequest from "./apirequest.js";

/* A small data model to represent a Post. */
export class Post {
  /* data is the post data from the API. */
  constructor(data) {
    /* Technically we don't have a full User object here (no followers list), but this is still useful. */
    this.user = new User(data.user);
    this.time = new Date(data.time);
    this.text = data.text;
  }
}

/* A data model representing a user of the app. */
export default class User {
  /* Returns an array of user IDs. */
  static async listUsers() {
    let data = await apiRequest("GET", "/users");
    return data.users;
  }

  /* data is the user object from the API. */
  constructor(data) {
    Object.assign(this, data);
  }

  /* Returns a User instance, creating the user if necessary. */
  static async loadOrCreate(id, phone) {
    let data;
    try {
      data = await apiRequest("GET", `/users/${id}`);
      if (data.phone !== phone) {
        alert("Incorrect phone number");
        return null;
      }
    } catch (error) {
      if (error.status === 404) {
        data = await apiRequest("POST", "/users", { id: id, phone: phone });
      }
    }
    return new User(data);
  }

  /* The string representation of a User is their display name. */
  toString() {
    return this.name;
  }

  /* Returns an Object containing only the instances variables we want to send back to the API when we save() the user. */
  toJSON() {
    return {
      name: this.name,
      avatarURL: this.avatarURL
    };
  }

  /* Save the current state (name and avatar URL) of the user to the server. */
  async save() {
    let data = await apiRequest("PATCH", `/users/${this.id}`, this.toJSON());
    this.name = data.name;
    this.avatarURL = data.avatarURL;
  }

  /* Gets the user's own posts. Returns an Array of Post objects. */
  async getUserPosts() {
    let data = await apiRequest("GET", `/users/${this.id}/myposts`);
    return data.posts;
  }

  /* Gets the user's current feed. Returns an Array of Post objects. */
  async getFeed() {
    let data = await apiRequest("GET", `/users/${this.id}/feed`);
    return data.posts;
  }

  /* Gets the post's buddies. Returns an Array of User objects. */
  async getBuddies(text) {
    let data = await apiRequest("GET", `/posts/${text}`);
    return data.users;
  }

  /* Create a new post with the given text. */
  async makePost(text) {
    await apiRequest("POST", `/users/${this.id}/posts`, { text });
  }

  async deleteItem(text) {
    await apiRequest("DELETE", `/users/${this.id}/add?target=${text}`);
    await this._reload();
  }

  async addItem(text) {
    await apiRequest("POST", `/users/${this.id}/add?target=${text}`);
    await this._reload();
  }

  async _reload() {
    let userProfile = await apiRequest("GET", `/users/${this.id}`);
    this.id = userProfile.id;
    this.phone = userProfile.phone;
    this.name = userProfile.name;
    this.avatarURL = userProfile.avatarURL;
    this.activities = userProfile.activities;
  }
}
