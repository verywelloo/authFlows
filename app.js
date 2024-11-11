require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const fs = require("fs");
const path = require("path");

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./db/connect");

const bookRoute = require("./routes/bookRoutes");
const authRoute = require("./routes/authRoutes");
const reviewRoute = require("./routes/reviewRoutes");
const userRoute = require("./routes/userRoutes");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const customCss = fs.readFileSync(
  path.join(__dirname, "SwaggerDark.css"),
  "utf8"
);

app.set("trust proxy");

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // limit each IP to 60 requests per windowMs
  })
);

app.use(helmet()); // Security headers
app.use(cors()); // Allow cross-origin requests
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL injections

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerDocument, { customCss })
);

app.use("/api/v1/books", bookRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/user", userRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
