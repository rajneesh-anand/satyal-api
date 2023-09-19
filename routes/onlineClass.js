const express = require('express');
const router = express.Router();

// Import necessary controllers or services
// const onlineClass = require('./onlineClass'); // You'll create this file
const {createClass} =require('../controllers/onlineClass');
// Define your routes
router.post('/create', createClass);
// router.post('/enroll', onlineClass.enrollClass);
// router.get('/details/:classId', onlineClass.getClassDetails);
// router.post('/add-note/:classId', onlineClass.addNote);
// router.post('/add-worksheet/:classId', onlineClass.addWorksheet);

module.exports = router;
