require("dotenv").config();
const createError = require("http-errors"),
  express = require("express"),
  path = require("path"),
  cookieParser = require("cookie-parser"),
  compression = require("compression"),
  fileUpload = require("express-fileupload"),
  srRouter = require(path.join(__dirname, "routes", "sr")),
  adminRouter = require(path.join(__dirname, "routes", "admin")),
  port = 3000;

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.locals.rmWhitespace = true;

if (app.get("logging") === "1") {
  const rfs = require("rotating-file-stream"),
  logger = require("morgan");

  // create a rotating write stream
  const accessLogStream = rfs.createStream("access.log", {
    interval: "1d", // rotate daily,
    //compress: "gzip",
    maxFiles: 30,
    path: path.join(__dirname, "log")
  });

  app.use(logger("common", { stream: accessLogStream }));
}

app.use(fileUpload({
  createParentPath: true
}));
//app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.Cookie_secret));
app.use(compression({level:1}));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  res.locals.css = "main";
  res.locals.title = "ARNO Nekretnine: Konsalting, Posredovanje i Marketing";
  next();
});

app.use("/", srRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", {message: err.message});
});

module.exports = app;
app.listen(port);

console.log(`Server is running on localhost:${port}`);