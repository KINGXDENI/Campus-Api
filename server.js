require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const userRoutes = require("./routes/users");
const reportRoutes = require("./routes/reports");
const errorHandler = require("./middlewares/error");


// Connect to DB
connectDB();

// Express App
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/", userRoutes);
app.use("/api/", reportRoutes);
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'public', 'images', filename);
  res.set('Content-Type', 'image/jpeg'); // Atur tipe konten gambar
  res.sendFile(imagePath);
});

app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:5173', // Atur origin sesuai dengan URL frontend React
  credentials: true, // Jika Anda mengizinkan pengiriman cookie atau header lain dalam permintaan
}));

app.get("/", (req, res) => {
  return res.json({
    message: "Welcome to the Node.js REST API using ExpressJS and MongoDB"
  });
});

app.use(errorHandler);

const server = app.listen(port, () =>
  console.log(`Server started listening on ${port}`)
);

process.on("unhandledRejection", (error, promise) => {
  console.log(`Logged Error: ${error}`);
  server.close(() => process.exit(1));
});