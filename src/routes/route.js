const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { route } = require("express/lib/application");
const loginController = require("../controllers/loginController");

router.post("/register", userController.createUser);
router.post("/login", loginController.userLogIn);


module.exports = router;