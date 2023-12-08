require("dotenv").config();
require("./db/connection");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 3000;

const postRouter = require("./routes/Post");
const pageRouter = require("./routes/Page");
const authRouter = require("./routes/Auth");
const contactRouter = require("./routes/Contact");
const requestMethod = require("./middleware/requestMethod");

// ... ... ... ... ... ... REDIS ... ... ... ... ... ... //

const { createClient } = require("redis");
const RedisStore = require("connect-redis").default;

let redisClient;

(async () => {
  // redis@v4
  redisClient = createClient({
    url: "redis://127.0.0.1:6379",
    // url: 'redis://alice:foobared@awesome.redis.server:6380'
  });

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect(console.log("Connected to Redis"));
})();

// Initialize store.
const redisStoreConf = new RedisStore({
  client: redisClient,
  prefix: "simple_blog:",
});

// ... ... ... ... ... ... END ... ... ... ... ... ... //

app.set("trust proxy", 1); // enable this if you run behind a proxy (e.g. nginx)

// Handling XST Attacks
app.use(requestMethod);
app.use(helmet());
app.use(express.json({ limit: "100MB" })); // For using req.body params
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// enabling CORS for some requests
app.use(
  cors({
    origin: "http://127.0.0.1:3001",
    methods: ["POST", "GET", "PUT", "DELETE"],
    // ["POST", "GET", "PUT", "OPTIONS", "HEAD", "DELETE"]
    credentials: true,
  })
);

// Setting up the Session

app.use(
  session({
    store: redisStoreConf,
    name: process.env.SESSION_AUTH_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 1000 * 60 * 60,
      sameSite: true,
    },
  })
);

app.get("/", (req, res) => {
  res.send("/");
});

app.use("/post/", postRouter);
app.use("/page/", pageRouter);
app.use("/user/", authRouter);
app.use("/contact/", contactRouter);

// Handle 404 error
app.use(function (req, res) {
  res.status(404).json({ error: 404 });
});

// Handle 500 error
app.use(function (err, req, res) {
  console.error(err.stack);
  res.status(500).json({ error: 500 });
});

app.listen(PORT, () => {
  console.log(`Blog app listening at http://localhost:${PORT}`);
});
