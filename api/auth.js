const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const SECRET_KEY = "your_secret_key";

// Use express-like middleware functions directly
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

const user = {
  username: "testuser",
  password: "12345",
  id: 1,
};

module.exports = (req, res) => {
  if (req.method === "POST" && req.url === "/auth/signin") {
    // Handle login logic
    const { username, password } = req.body;

    if (username === user.username && password === user.password) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.setHeader("Set-Cookie", `token=${token}; HttpOnly`);
      return res.status(200).json({ message: "Login successful" });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (req.method === "GET" && req.url === "/protected") {
    // Protected route logic
    verifyToken(req, res, () => {
      res.status(200).json({ message: "Protected data", user: req.user });
    });
  }

  return res.status(404).json({ message: "Not Found" });
};
