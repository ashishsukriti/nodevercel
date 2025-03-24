const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const SECRET_KEY = "your_secret_key";

// Middleware setup
app.use(express.json());  // To parse JSON bodies
app.use(cookieParser());  // To parse cookies
app.use(
  cors({
    origin: "http://localhost:3000",  // Replace with your frontend URL
    credentials: true,  // Allow credentials (cookies) to be sent
  })
);

// User data for authentication
const user = {
  username: "testuser",
  password: "12345",
  id: 1,
};

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Login route
app.post("/auth/signin", (req, res) => {
  const { username, password } = req.body;

  if (username === user.username && password === user.password) {
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`);
    return res.status(200).json({ status: true, message: "Login successful" });
  }

  return res.status(401).json({ status: false, message: "Invalid credentials" });
});

// Protected route that requires a valid token
app.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "Protected data", user: req.user });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
