const cluster = require('cluster');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const totalCPUs = require('os').cpus().length;
require('dotenv').config();

// Server Port
const app = express();
const port = process.env.PORT || 8080;

// api routes
const user = require('./routes/user');
const auth = require('./routes/auth');
const student = require('./routes/student');
const teacher = require('./routes/teacher');
const test = require('./routes/test');
const file = require('./routes/file');
const payment = require('./routes/payment');
const mailer = require('./routes/mailer');
const pricing = require('./routes/pricing');
const books = require('./routes/books');
const questions = require('./routes/questions');
const profile = require('./routes/profile');
const onlineClassTeacher = require('./routes/onlineClassTeacher');
const onlineClassStudent = require('./routes/onlineClassStudent');
// middelewere

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Cors

// let allowedDomains = [
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

app.use(
  cors({
    origin: '*',
  })
);

if (cluster.isMaster) {
  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    cluster.fork();
  });
} else {
  app.use((req, res, next) => {
    console.log(req.path, req.method);
    return next();
  });

  app.use('/api/auth', auth);
  app.use('/api/user', user);
  app.use('/api/student', student);
  app.use('/api/teacher', teacher);
  app.use('/api/test', test);
  app.use('/api/file', file);
  app.use('/api/payment', payment);
  app.use('/api/mailer', mailer);
  app.use('/api/pricing', pricing);
  app.use('/api/books', books);
  app.use('/api/questions', questions);
  app.use('/api/profile', profile);
  app.use('/api/onlineClassTeacher', onlineClassTeacher);
  app.use('/api/onlineClassStudent', onlineClassStudent);
  app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
  });
}
