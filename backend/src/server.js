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

// ✅ Ensure JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

// ✅ Connect to database
connectDb();

// ✅ Security middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});
app.use(limiter);

// ✅ SECURE CORS (ONLY allow your frontend)
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // 👈 from Render env
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Body parser
app.use(express.json());

// ✅ Logger
app.use(morgan("dev"));

// ✅ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.statusCode || 500;
  res.status(status).json({
    message:
      status >= 500 && process.env.NODE_ENV === "production"
        ? "Server error"
        : err.message || "Server error",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});