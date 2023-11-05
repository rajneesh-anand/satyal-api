const express = require('express');
const router = express.Router();
const {
  addWorksheetToOnlineClass,
  deleteWorksheetFromOnlineClass,
  getWorksheet,
} = require('../controllers/worksheet');

router.post('/onlineClass/add', addWorksheetToOnlineClass);
router.delete('/onlineClass/delete', deleteWorksheetFromOnlineClass);
router.get('/:id', getWorksheet); // Implement a route to serve worksheets

module.exports = router;
