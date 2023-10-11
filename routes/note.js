const express = require("express");
const router = express.Router();

const {
  addNoteAtOnlineClass,
  deleteNoteFromOnlineClass,
} = require("../controllers/note");

router.post("/onlineClass/add", addNoteAtOnlineClass);
router.delete("/onlineClass/delete", deleteNoteFromOnlineClass);

module.exports = router;
