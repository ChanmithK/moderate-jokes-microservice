// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { createConnection, getRepository } = require("typeorm");
// require("reflect-metadata");
// const cors = require("cors");
// const axios = require("axios");

// // const JokeEntity = require("./entity/Joke");

// const app = express();
// app.use(bodyParser.json());

// // Use CORS middleware
// app.use(cors());

// app.post("/auth/login", async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (user && bcrypt.compareSync(password, user.password)) {
//     const token = jwt.sign({ userId: user._id }, "secret");
//     res.json({ token });
//   } else {
//     res.status(401).send("Invalid credentials");
//   }
// });

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).send("Unauthorized");
//   }

//   const token = authHeader.substring(7);
//   try {
//     const payload = jwt.verify(token, "secret");
//     req.user = payload;
//     next();
//   } catch (error) {
//     res.status(401).send("Unauthorized");
//   }
// };

// app.get("/jokes", authMiddleware, async (req, res) => {
//   try {
//     const response = await axios.get("http://localhost:3003/jokes");
//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// app.put("/jokes/:id", authMiddleware, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const response = await axios.put(
//       `http://localhost:3003/jokes/${id}`,
//       req.body
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// app.delete("/jokes/:id", authMiddleware, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const response = await axios.delete(`http://localhost:3003/jokes/${id}`);
//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// app.post("/deliver-joke", authMiddleware, async (req, res) => {
//   const { type, content, jokeId, status } = req.body;

//   try {
//     // const joke = await Joke.findById(id);
//     // if (!joke) {
//     //   return res.status(404).send("Joke not found");
//     // }

//     const response = await axios.post("http://localhost:3000/jokes/add", {
//       type: type,
//       content: content,
//       jokeId: jokeId,
//       status: status,
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// app.delete("/delete-joke", authMiddleware, async (req, res) => {
//   const { jokeId } = req.body;

//   try {
//     const response = await axios.delete(
//       `http://localhost:3000/jokes/delete/${jokeId}`
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// const seedAdminUser = async () => {
//   const email = "admin@admin.com";
//   const password = "admin123";
//   const hashedPassword = bcrypt.hashSync(password, 8);
//   const user = new User({ email, password: hashedPassword });
//   await user.save();
// };

// const startServer = async () => {
//   await createConnection();
//   await seedAdminUser();
//   app.listen(3002, () => {
//     console.log("Moderate Jokes Microservice running on port 3000");
//   });
// };

// startServer();

const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");

// Initialize express app
const app = express();
app.use(bodyParser.json());

// Use CORS middleware
app.use(cors());

// Hardcoded user credentials
const HARD_CODED_EMAIL = "admin@admin.com";
const HARD_CODED_PASSWORD = "admin123";

// Token secret
const TOKEN_SECRET = "secret";

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, TOKEN_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Login route using hardcoded credentials
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (email === HARD_CODED_EMAIL && password === HARD_CODED_PASSWORD) {
    const token = jwt.sign({ userId: "admin" }, TOKEN_SECRET);
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Get all jokes
app.get("/jokes", authMiddleware, async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3003/jokes");
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Update a joke
app.put("/jokes/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.put(
      `http://localhost:3003/jokes/${id}`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Delete a joke
app.delete("/jokes/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.delete(`http://localhost:3003/jokes/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Deliver a joke
app.post("/deliver-joke", authMiddleware, async (req, res) => {
  const { type, content, jokeId, status } = req.body;
  try {
    const response = await axios.post("http://localhost:3000/jokes/add", {
      type: type,
      content: content,
      jokeId: jokeId,
      status: status,
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Delete a joke (alternative endpoint)
app.delete("/delete-joke", authMiddleware, async (req, res) => {
  const { jokeId } = req.body;
  try {
    const response = await axios.delete(
      `http://localhost:3000/jokes/delete/${jokeId}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Start server
const startServer = async () => {
  app.listen(3002, () => {
    console.log("Moderate Jokes Microservice running on port 3002");
  });
};

startServer();
