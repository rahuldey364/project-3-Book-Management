const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController");
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/auth")

router.post("/register", userController.createUser);
router.post("/login", userController.userLogIn);
router.post("/books", auth.authentication,bookController.createBook);
router.get("/books", bookController.GetData);
router.get("/books/:bookId",auth.authentication, bookController.getBookDetails);
router.put("/books/:bookId", auth.authentication,auth.authorization,bookController.updateBooks);
router.delete("/books/:bookId", bookController.deleteBooksbyId);
router.post("/books/:bookId/review",reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteBooksbyId)



module.exports = router;