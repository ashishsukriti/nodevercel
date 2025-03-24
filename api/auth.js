const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = 8000;
const SECRET_KEY = "your_secret_key";

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const user = {
  email: "test@test.com",
  password: "12345",
};

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

app.post("/auth/signin", (req, res) => {
  const { username, password } = req.body;

  if (username === user.username && password === user.password) {
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true, secure: false });
    return res.json({ message: "Login successful", status: true, code: 200 });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.get("/zone", verifyToken, (req, res) => {
  const zones = ["North", "South", "East", "West"];
  res.json({ message: "Zone list", zones });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
