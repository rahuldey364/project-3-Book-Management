const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController");

router.post("/register", userController.createUser);
router.post("/login", userController.userLogIn);
router.post("/books", bookController.createBook);
router.get("/books", bookController.GetData);
router.get("/books/:bookId", bookController.getBookDetails);
router.put("/books/:bookId", bookController.updateBooks);
router.delete("/books/:bookId", bookController.updateBooks);



module.exports = router;