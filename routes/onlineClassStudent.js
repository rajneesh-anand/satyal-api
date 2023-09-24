const express = require('express');
const router = express.Router();

const {
  enrollClass,
  //   getClassDetails,
  getAllEnrolledClasses,
} = require('../controllers/onlineClassStudent');
// Define your routes
router.post('/enroll', enrollClass);
router.get('/enrolledClasses/:email', getAllEnrolledClasses);
// router.get('/details/:classId', getClassDetails);

module.exports = router;
