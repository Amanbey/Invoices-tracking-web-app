require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const clientRoutes = require("./routes/clientRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

if (isProduction && process.env.JWT_SECRET === "change_this_secret") {
  throw new Error("JWT_SECRET must be changed for production");
}

connectDb();

if (isProduction && !process.env.ALLOWED_ORIGINS) {
  throw new Error("ALLOWED_ORIGINS is required in production");
}

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:3000,http://localhost:3001,http://localhost:3002"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(limiter);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  const isAuthError =
    err.name === "JsonWebTokenError" || err.name === "TokenExpiredError";
  if (isAuthError) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message:
      status >= 500 && process.env.NODE_ENV === "production"
        ? "Server error"
        : err.message || "Server error",
  });
});

const DEFAULT_PORT = Number(process.env.PORT) || 5001;
const MAX_PORT_ATTEMPTS = 5;

const startServer = (port, attempt = 1) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      console.warn(
        `Port ${port} is busy. Retrying on port ${nextPort}...`
      );
      startServer(nextPort, attempt + 1);
      return;
    }

    console.error("Failed to start server", error);
    process.exit(1);
  });
};

startServer(DEFAULT_PORT);
