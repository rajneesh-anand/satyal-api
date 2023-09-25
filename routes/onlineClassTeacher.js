const express = require('express');
const router = express.Router();

const {
  createClass,
  getClassDetails,
  getAllCreatedClasses,
  getAllEnrolledStudentsInAClass,
  updateMeetingLink,
  deleteClass,
} = require('../controllers/onlineClassTeacher');
// Define your routes
router.post('/create', createClass);
router.get('/details/:classId', getClassDetails);
router.get('/createdClasses/:email', getAllCreatedClasses);
router.get('/enrolledClasses/:email', getAllEnrolledStudentsInAClass);
router.patch('/updateLink', updateMeetingLink);
router.delete('/deleteClass/:classId', deleteClass);
// router.post('/add-note/:classId', onlineClass.addNote);
// router.post('/add-worksheet/:classId', onlineClass.addWorksheet);

module.exports = router;
