const booksModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")
const userModel = require("../models/userModel")
// const validation = require("../validation/validation.js")


// POST /books/:bookId/review
// Add a review for the book in reviews collection.
// Check if the bookId exists and is not deleted before adding the review. Send an error response with appropirate status code like this if the book does not exist
// Get review details like review, rating, reviewer's name in request body.
// Update the related book document by increasing its review count
// Return the updated book document with reviews data on successful operation. The response body should be in the form of JSON object like this

const createReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!bookId){ return res.status(400).send({ status: false, msg: "Bad Request, please provide BookId in params" })}
        let check = await booksModel.findById({ _id: bookId, isDeleted: false })
        if (!check) {
            return res.status(404).send({ status: false, message: "No book found" })
        } else {
            let data = req.body

            if (!validation.isValidRequestBody(data)) {
                return res.status(400).send({ status: false, msg: "please provide  details" })
            }

            let { review, rating, reviewedBy } = data

            if (!validation.isValid(review)) {
                return res.status(400).send({ status: false, msg: "Not a valid review" })
            }

            if (!validation.isValidNumber(rating)) {
                return res.status(400).send({ status: false, msg: "Rating should be a valid number " })
            }

            if (!validation.isValid(reviewedBy)) {
                return res.status(400).send({ status: false, msg: "Name should be a valid String " })
            }

            let savedData = await reviewModel.create(data)
            return res.status(201).send({ status: true, data: savedData })

        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: "error", err: err.message })

    }
}




// PUT /books/:bookId/review/:reviewId
// Update the review - review, rating, reviewer's name.
// Check if the bookId exists and is not deleted before updating the review. Check if the review exist before updating the review. Send an error response with appropirate status code like this if the book does not exist
// Get review details like review, rating, reviewer's name in request body.
// Return the updated book document with reviews data on successful operation. The response body should be in the form of JSON object like this

const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!bookId) return res.status(400).send({ status: false, msg: "Bad Request, please provide BookId in params" })
        if (!validation.isValidObjectId(bookId)) {
            return res.status(400).send({
                status: false,
                msg: "not a valid userId"
            })
        }
        const reviewId = req.params.reviewId
        if (!reviewId) return res.status(400).send({ status: false, msg: "reviewId should be present in params" })
        if (!validation.isValidObjectId(reviewId)) {
            return res.status(400).send({
                status: false,
                msg: "not a valid userId"
            })
        }
        let data = req.body
        if (!validation.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide  details" })
        }

        let check = await reviewModel.findById({ _id: bookId, isDeleted: false })
        if (!check) return res.status(400).send({ status: false, msg: "Books not found" })

        let updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewId }, {
            $set: {
                review: data.review,
                rating: data.rating,
                reviewedBy: data.reviewedBy
            }
        }, { new: true, upsert: true })

        if (updatedReview.length == 0) {

            return res.status(404).send({ status: false, msg: "Invalid Request" })
        }
        else {
            res.status(200).send({ status: true, data: updatedReview })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: "error", err: err.message })
    }
}



// DELETE /books/:bookId/review/:reviewId
// Check if the review exist with the reviewId. Check if the book exist with the bookId. Send an error response with appropirate status code like this if the book or book review does not exist
// Delete the related reivew.
// Update the books document - decrease review count by one

const deleteBooksbyId = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if (!bookId) return res.status(400).send({ status: false, msg: "BookId should be present in params" })
        if (!validation.isValidObjectId(bookId)) {
            return res.status(400).send({
                status: false,
                msg: "not a valid userId"
            })
        }
        const reviewId = req.params.reviewId
        if (!reviewId) return res.status(400).send({ status: false, msg: "reviewId should be present in params" })
        if (!validation.isValidObjectId(reviewId)) {
            return res.status(400).send({
                status: false,
                msg: "not a valid userId"
            })
        }
        let check = await booksModel.findById({ _id: bookId })
        let checking = check.isDeleted
        if (checking == true) return res.status(404).send({ status: false, msg: "Book is already deleted , no review is available" })
        if (checking == false) {

            let deleteReview = await booksModel.findOneAndUpdate({ _id: reviewId }, {
                $inc: {
                    review: - 1
                }
            }, { new: true, upsert: true })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: "error", err: err.message })
    }
}

module.exports = {createReview,updateReview,deleteBooksbyId }