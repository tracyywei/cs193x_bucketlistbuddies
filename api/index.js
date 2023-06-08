import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

let api = express.Router();
let Users;
let Posts;

const initApi = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);

  // let conn = await MongoClient.connect("mongodb://127.0.0.1");
  // let db = conn.db("cs193xproject_buddies");
  // Users = db.collection("users");
  // Posts = db.collection("posts");
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


/* Catch-all route to return a JSON error if endpoint not defined.
   Be sure to put all of your endpoints above this one, or they will not be called. */
api.all("/*", (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
