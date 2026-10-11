const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const sql = require("./db/connect");

const app = express();

const readDataFile = async () => {
  const data = (await fs.readFile("./data.json")).toString("utf-8");
  const file = JSON.parse(data);
  return file;
};

app.use(cors());
app.use(express.json());
app.post("/", async (req, res, next) => {
  const file = await readDataFile();
  const users = file.users;
  const user = users.find((item) => item.username === req.body.username);
  if (user) {
    next({ status: 400, message: "User already exists" });
    return;
  }
  users.push(req.body);
  await fs.writeFile("./data.json", JSON.stringify(file));

  res.status(200).send("This is response");
});

app.post("/signup", async (req, res, next) => {
  const file = await readDataFile();
  const users = file.users;
  const user = users.find((item) => item.username === req.body.username);
  if (!user) {
    next({ status: 400, message: "No such user" });
    return;
  }
  if (user.password !== req.body.password) {
    next({ status: 400, message: "Wrong password" });
    return;
  }
  res.status(200).json(user);
});

app.post("/note", async (req, res, next) => {
  const file = await readDataFile();
  const users = file.users;
  const user = users.find((item) => item.username === req.body.username);
  if (!user) {
    next({ status: 400, message: "No such user" });
    return;
  }
  file.note.push(req.body);
  await fs.writeFile("./data.json", JSON.stringify(file));
  res.status(200).send("note created");
});

app.get("/note", async (req, res, next) => {
  const { user } = req.query;
  if (!user) {
    next({ status: 400, message: "No params" });
    return;
  }
  const file = await readDataFile();
  const notes = file.note.filter((item) => item.username === user);
  res.json(notes);
});

app.use((req, res) => {
  res.status(404).send("Wrong endpoint");
});

app.use((err, req, res, next) => {
  res.status(err.status).send(err.message);
});

app.listen(3001, () => {
  console.log("Server is runing on port 3001");
});
