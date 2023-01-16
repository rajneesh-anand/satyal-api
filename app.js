const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
const express = require("express");
var cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const user = require("./routes/user");
const auth = require("./routes/auth");
const student = require("./routes/student");

require("dotenv").config();

// let allowedDomains = [
//   "https://vedas.vercel.app",
//   "https://vedas-admin.vercel.app",
//   "https://www.vedusone.com",
//   "https://www.admin.vedusone.com",
//   "https://admin.vedusone.com",
//   "http://localhost:3000",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedDomains.indexOf(origin) === -1) {
//         var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

if (cluster.isMaster) {
  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else {
  const app = express();
  const port = process.env.PORT || 8080;
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: "*",
    })
  );
  app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
  });
  app.use("/api/auth", auth);
  app.use("/api/user", user);
  app.use("/api/student", student);

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}
