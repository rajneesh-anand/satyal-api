const router = require("express").Router();
const {
  userRegisterController,
} = require("../controllers/usersControllers/userRegister");

// tesing router for register end point
router.get("/register", (req, res) => {
  res.status(200).type("html").send("hellow this is user register");
  console.log("register user end point is hited");
});

// this route used to register student currently
// but we can used it to register both teacher and student after
router.post("/register", userRegisterController);

module.exports = router;
