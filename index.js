const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createConnection, getRepository } = require("typeorm");
require("reflect-metadata");
const cors = require("cors");

const JokeEntity = require("./entity/Joke");

const app = express();
app.use(bodyParser.json());

// Use CORS middleware
app.use(cors());

const mongoURI =
  "mongodb+srv://praveenk:Z4uq2BwMcoJWDZ3k@jokesapp.khokyn1.mongodb.net/?retryWrites=true&w=majority&appName=JokesApp";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const jokeSchema = new mongoose.Schema({
  type: String,
  content: String,
  status: String,
});

const Joke = mongoose.model("Joke", jokeSchema);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ userId: user._id }, "secret");
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, "secret");
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};

app.get("/jokes", authMiddleware, async (req, res) => {
  const jokes = await Joke.find();
  res.json(jokes);
});

app.put("/jokes/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const joke = await Joke.findByIdAndUpdate(id, req.body, { new: true });
  res.json(joke);
});

app.delete("/jokes/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Joke.findByIdAndDelete(id);

    if (result) {
      res.send("Joke deleted");
    } else {
      res.status(404).send("Joke not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.delete("/mysql/jokes/:jokeId", authMiddleware, async (req, res) => {
  const { jokeId } = req.params;
  const jokeRepository = getRepository(JokeEntity);

  try {
    const joke = await jokeRepository.findOne({ where: { jokeId: jokeId } });

    if (joke) {
      await jokeRepository.remove(joke);
      res.send("Joke deleted");
    } else {
      res.status(404).send("Joke not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.post("/mysql/jokes", authMiddleware, async (req, res) => {
  const { type, content, jokeId } = req.body;
  const jokeRepository = getRepository(JokeEntity);
  const newJoke = jokeRepository.create({ type, content, jokeId });
  await jokeRepository.save(newJoke);
  res.json(newJoke);
});

const seedAdminUser = async () => {
  const email = "admin@admin.com";
  const password = "admin123";
  const hashedPassword = bcrypt.hashSync(password, 8);
  const user = new User({ email, password: hashedPassword });
  await user.save();
};

const startServer = async () => {
  await createConnection();
  await seedAdminUser();
  app.listen(3002, () => {
    console.log("Moderate Jokes Microservice running on port 3000");
  });
};

startServer();
