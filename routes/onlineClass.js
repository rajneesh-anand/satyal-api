const express = require('express');
const router = express.Router();

const {
  createClass,
  enrollClass,
  getClassDetails,
  getAllClassesCreated,
  getAllClassesEnrolled,
  updateMeetingLink,
} = require('../controllers/onlineClass');
// Define your routes
router.post('/create', createClass);
router.post('/enroll', enrollClass);
router.get('/details/:classId', getClassDetails);
router.get('/details', getAllClassesCreated);
router.get('/details', getAllClassesEnrolled);
// router.post('/add-note/:classId', onlineClass.addNote);
// router.post('/add-worksheet/:classId', onlineClass.addWorksheet);

module.exports = router;
