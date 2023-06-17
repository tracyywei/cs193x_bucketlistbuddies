import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";

let api = express.Router();
let Users;
let Posts;

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1";

const initApi = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);

  //let conn = await MongoClient.connect("mongodb://127.0.0.1");
  let conn = await MongoClient.connect(MONGODB_URL);
  let db = conn.db("cs193xproject_buddies");
  Users = db.collection("users");
  Posts = db.collection("posts");
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

// GET /users
api.get("/users", async (req, res) => {
  let allUsers = await Users.find().toArray();
  let users = [];
  for (let u of allUsers) {
    users.push(u.id);
  }
  res.json({ "users": users });
});

/* Middleware */
api.use("/users/:id", async (req, res, next) => {
  let id = req.params.id;
  let user = await Users.findOne({ id: id });
  // 404 if the user does not exist
  if (!user) {
    res.status(404).json({ error: `No user with ID ${id}` });
    return;
  }
  res.locals.user = user;
  next();
});

// GET /users/:id
api.get("/users/:id", async (req, res) => {
  let user = res.locals.user;
  delete user._id;
  res.json(user);
});

// POST /users
api.post("/users", async (req, res) => {
  let id = req.body.id;
  let phone = req.body.phone;
  // 400 if the request body is missing an id property, or the id is empty
  if (!id && !phone) {
    res.status(400).json({ error: "Missing id and phone number" });
    return;
  }
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  if (!phone) {
    res.status(400).json({ error: "Missing phone number" });
    return;
  }
  // 400 if the user already exists
  let repeatedUser = await Users.findOne({ id: id });
  if (repeatedUser) {
    res.status(400).json({ error: `${id} already exists` });
    return;
  }
  let newUser = { "id": id, "name": id, "avatarURL": "images/default.png", "phone": phone, "activities": [] };
  await Users.insertOne(newUser);
  delete newUser._id;
  res.json(newUser);
});


// PATCH /users/:id
api.patch("/users/:id", async (req, res) => {
  let id = req.params.id;
  let name = req.body.name;
  let avatarURL = req.body.avatarURL;
  let user = res.locals.user;
  if (name === "") {
    user = await Users.updateOne({ id: id }, { $set: { name: id } });
  }
  if (name) {
    user = await Users.updateOne({ id: id }, { $set: { name: name } });
  }
  if (avatarURL === "") {
    user = await Users.updateOne({ id: id }, { $set: { avatarURL: "images/default.png" } });
  }
  if (avatarURL) {
    user = await Users.updateOne({ id: id }, { $set: { avatarURL: avatarURL } });
  }
  user = await Users.findOne({ id: id });
  delete user._id;
  res.json(user);
});

// GET /users/:id/myposts
api.get("/users/:id/myposts", async (req, res) => {
  let user = res.locals.user;
  let activities = user.activities;
  let userPosts = await Posts.find({ text: { $in: activities } }).toArray();
  let userFeed = [];
  for (let post of userPosts) {
    let u = await Users.findOne({ id: post.userId });
    delete u._id;
    delete u.activities;
    let p = { "user": u, "time": post.time, "text": post.text };
    userFeed.push(p);
  }
  res.json({ "posts": userFeed });
});

// GET /users/:id/feed
api.get("/users/:id/feed", async (req, res) => {
  let user = res.locals.user;
  let activities = user.activities;
  let allPosts = await Posts.find().toArray();
  let userFeed = [];
  for (let post of allPosts) {
    if (!activities.includes(post.text)) {
      let u = await Users.findOne({ id: post.userId });
      delete u._id;
      delete u.phone;
      delete u.activities;
      let p = { "user": u, "time": post.time, "text": post.text };
      userFeed.push(p);
    }
  }
  res.json({ "posts": userFeed });
});


/* Middleware */
api.use("/posts/:text", async (req, res, next) => {
  let text = req.params.text;
  let buddies = [];
  let allUsers = await Users.find().toArray();
  for (let u of allUsers) {
    if (u.activities.includes(text)) {
      buddies.push(u);
    }
  }
  res.locals.buddies = buddies;
  next();
});

// GET /posts/:text
api.get("/posts/:text", async (req, res) => {
  let buddies = res.locals.buddies;
  res.json({ "users": buddies });
});

// POST /users/:id/posts
api.post("/users/:id/posts", async (req, res) => {
  let text = req.body.text;
  // 400 if the request body is missing a text property, or the text is empty
  if (!text) {
    res.status(400).json({ error: "Missing text" });
    return;
  }
  let user = res.locals.user;
  // make a new post
  await Posts.insertOne({ userId: user.id, time: new Date(), text: text });
  // add to current bucket list
  let bucketList = user.activities;
  bucketList.push(text);
  await Users.updateOne({ id: user.id }, { $set: { activities: bucketList } });
  res.json({ success: true });
});


// POST /users/:id/add
api.post("/users/:id/add", async (req, res) => {
  let user = res.locals.user;
  let target = req.query.target;
  // 400 if the query string is missing a target property, or the target is empty
  if (!target) {
    res.status(400).json({ error: "Missing target" });
    return;
  }
  let targetPost = await Posts.findOne({ text: target });
  // 404 if user target does not exist
  if (!targetPost) {
    res.status(404).json({ error: `No post of ${target}` });
    return;
  }
  let bucketList = user.activities;
  let index = bucketList.indexOf(target);
  // 400 if the user is already following the target
  if (index > -1) {
    res.status(400).json({ error: `${user.id} has already added ${target} to their bucket list` });
    return;
  }
  // add item to bucket list
  bucketList.push(target);
  await Users.updateOne({ id: user.id }, { $set: { activities: bucketList } });
  res.json({ success: true });
});

// DELETE /users/:id/add
api.delete("/users/:id/add", async (req, res) => {
  let user = res.locals.user;
  let target = req.query.target;
  // 400 if the query string is missing a target property, or the target is empty
  if (!target) {
    res.status(400).json({ error: "Missing target" });
    return;
  }
  let bucketList = user.activities;
  let index = bucketList.indexOf(target);
  // 400 if the target item isn't on the bucket list of the requesting user
  if (index < 0) {
    res.status(400).json({ error: `${user.id} does not have "${target}" on their bucket list` });
    return;
  }
  // deleting the activity
  bucketList.splice(index, 1);
  await Posts.deleteOne({ text: target });
  await Users.updateOne({ id: user.id }, { $set: { activities: bucketList } });

  // delete the activity from all the users who put that in their bucket list
  let allUsers = await Users.find().toArray();
  for (let u of allUsers) {
    let curIndex = u.activities.indexOf(target);
    if (curIndex >= 0) {
      let bList = u.activities;
      bList.splice(curIndex, 1);
      await Users.updateOne({ id: u.id }, { $set: { activities: bList } });
    }
  }
  res.json({ success: true });
});

/* Catch-all route to return a JSON error if endpoint not defined.
   Be sure to put all of your endpoints above this one, or they will not be called. */
api.all("/*", (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
