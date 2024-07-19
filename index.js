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
    const response = await axios.get(
      "https://submit-jokes-microservice-production.up.railway.app/jokes"
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Add a type
app.post("/type", authMiddleware, async (req, res) => {
  try {
    const newType = req.body; // Get the new type from the request body
    const response = await axios.post(
      "https://submit-jokes-microservice-production.up.railway.app/add-type",
      newType
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Get all types
app.get("/types", authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(
      "https://submit-jokes-microservice-production.up.railway.app/jokes/types"
    );
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
      `https://submit-jokes-microservice-production.up.railway.app/jokes/${id}`,
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
    const response = await axios.delete(
      `https://submit-jokes-microservice-production.up.railway.app/jokes/${id}`
    );
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
    const response = await axios.post(
      "https://deliver-jokes-microservice-production.up.railway.app/jokes/add",
      {
        type: type,
        content: content,
        jokeId: jokeId,
        status: status,
      }
    );
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
      `https://deliver-jokes-microservice-production.up.railway.app/jokes/delete/${jokeId}`
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
