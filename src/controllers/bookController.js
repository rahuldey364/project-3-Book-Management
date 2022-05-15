const bookModel = require("../models/bookModel.js");
const userModel = require("../models/userModel.js");
const reviewModel = require("../models/reviewModel");
const validation = require("../validation/validation")
// const moment = require("moment");

const isvalid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isvalidRequestBody = function (requestbody) {
  return Object.keys(requestbody).length > 0;
};

const isValidNumber = function (number) {
  if (typeof number === NaN || number === 0) return false;
  return true;
};

let createBook = async function (req, res) {
  try {

      let requiredBody = req.body;

//  -------------------------------VALIDATION BEGINS--------------------------------------------------------------------------------------------------------------------------------       

      if (!validation.isValidRequestBody(requiredBody)) {
          return res.send({ status: false, msg: "please provide  details" })
      }

      let { title, excerpt, userId, ISBN, category, subcategory,  reviews, releasedAt } = req.body   // destructuring method 

      // if (isDeleted) { if (isDeleted == true) { return res.status(400).send({ status: false, message: "data is not vailid" }) } }         // Imp condition to check

      if (!validation.isValid(title)) {                                                                                 // title validation
          return res.status(400).send({ status: false, message: "title is required and it should be valid" })
      }

      let uniqueTitle = await bookModel.findOne({ title: title })                                                      // title uniqueness
      if (uniqueTitle) return res.status(409).send({ status: false, message: " title already exists" })

      if (!validation.isValid(excerpt)) {                                                                               // excerpt validation
          return res.status(400).send({ status: false, message: "excerpt is required and it should be valid" })

      }

      if (!validation.isValidObjectId(userId)) {                                                                         // userId validation
          return res.status(400).send({
              status: false,
              message: "not a valid userId"
          })
      }

      let checkUserI = await userModel.findById({_id: userId})
      if (!checkUserI){
      return res.status(400).send({status : false , message : "Not a valid UserId"})}

      
      if (!validation.isValidISBN(ISBN)) {                                                                               //
          return res.status(400).send({ status: false, msg: "Invalid ISBN" });
      }

      let uniqueISBN = await bookModel.findOne({ ISBN: ISBN })                                                          // ISBN uniqueness
      if (uniqueISBN) return res.status(409).send({ status: false, msg: " ISBN already exists" })

      if (!validation.isValid(category)) {                                                                               // category validation
          return res.status(400).send({ status: false, msg: "category is required" })
      }

      if (subcategory) {                                                                                                 // subcategory validation
          for (let i = 0; i < subcategory.length; i++) {
              if (!validation.isValid(subcategory[i])) { return res.status(400).send({ status: false, message: "subategory is not valid" }) }
          }
      }
    //   if(reviews){
    //   if (!validation.isValidNumber(reviews)) {                                                                     // category validation
    //       return res.status(400).send({ status: false, msg: "reviews should be a valid number" })
    //   }}
     
        if (!validation.isValid(releasedAt)) {
          return res
            .status(400)
            .send({ status: false, msg: "released date is required" });
        }
// -------------------------------------validation Ends-------------------------------------------------------------------------------------------------------------------------------          

      let check = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
      if (releasedAt) {
          if (!check.test(releasedAt)) {
              // need to solve this later
              return res
                  .status(409)
                  .send({ status: false, msg: " date must be in yyyy-mm-dd" });
          }
      }

     let userData = await bookModel.create(req.body)
      return res.status(201).send({ status: true, data: userData })

  }
  catch (err) {
      return res.status(500).send({ err: err.message })

  }
}


// ==========================================================================================================================================================================================================================================

// GET /books
// Returns all books in the collection that aren't deleted. Return only book _id, title, excerpt, userId, category, releasedAt, reviews field. Response example here
// Return the HTTP status 400 if any documents are found. The response structure should be like this
// If no documents are found then return an HTTP status 404 with a response like this
// Filter books list by applying filters. Query param can have any combination of below filters.
// By userId
// By category
// By subcategory example of a query url: books?filtername=filtervalue&f2=fv2
// Return all books sorted by book name in Alphabatical order

const getBooks = async function (req, res) {
  try {
      let data = req.query

  
      let getBooks = await bookModel.find({ isDeleted: false, ...data }).sort({title: 1}).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
      if (!getBooks) {
          return req.status(404).send({ status: false, msg: "Documents not found" })
      }
      return res.status(200).send({ status: true, msg: "list of books", data: getBooks })
  }
  catch (err) {
      console.log(err)
      res.status(500).send({ status: false, msg: "error", err: err.message })

  }
}

// =============================================================================================================================================================================================================


// GET /books/:bookId

// Returns a book with complete details including reviews. Reviews array would be in the form of Array. Response example here
// Return the HTTP status 200 if any documents are found. The response structure should be like this
// If the book has no reviews then the response body should include book detail as shown here and an empty array for reviewsData.
// If no documents are found then return an HTTP status 404 with a response like this



const getBookById = async function (req, res) {
  try {
      let bookId = req.params.bookId
      if (!bookId) {
          return res.status(400).send({ status: false, message: "enter a Book Id  first", });
      }
      if (!validation.isValidObjectId(bookId)) {
          return res.status(404).send({
              status: false,
              message: "you have entered a invalid book id or book is deleted  ",
          });
      }
      const isValidBook = await bookModel.findOne({ _id: bookId, isDeleted: false }).lean();    //With the Mongoose lean() method, the documents are returned as plain objects.
      if (!isValidBook) {
          return res.status(404).send({
              status: false,
              message: "you have entered a invalid book id or book is deleted  ",
          });
      }
      const getReviews = await reviewModel.find({ bookId: bookId, isDeleted: false })

      delete isValidBook.ISBN
      isValidBook.reviewsData = getReviews
      res.status(200).send({ status: true, data: isValidBook });
  }
  catch (err) {
      console.log(err)
      res.status(500).send({ status: false, message: err.message });
  }
};

// =========================================================================================================================================================================================================================================

// PUT /books/:bookId

// Update a book by changing its
// title
// excerpt
// release date
// ISBN
// Make sure the unique constraints are not violated when making the update
// Check if the bookId exists (must have isDeleted false and is present in collection). If it doesn't, return an HTTP status 404 with a response body like this
// Return an HTTP status 200 if updated successfully with a body like this
// Also make sure in the response you return the updated book document.

const updateBooks = async function (req, res) {
  try {
      let bookId = req.params.bookId
      if (!bookId) return res.status(400).send({ status: false, message: "BookId is required in params" })
      if (!validation.isValidObjectId(bookId)) {
          return res.status(404).send({
              status: false,
              message: "you have entered a invalid book id or book is deleted  ",
          });
      }
      let data = req.body
      if (!data) return res.status(400).send({ status: false, message: "Data is not present in request body" })
      if (!validation.isValidRequestBody(data)) {
          return res.status(400).send({ status: false, msg: "please provide details" })
      }
      if(data.title){
           if (!validation.isValid(data.title)) {
          return res.status(400).send({ status: false, msg: "title is not Valid" })
      }
  }
    
      let uniqueTitle = await bookModel.findOne({ title: data.title })
      if (uniqueTitle) return res.status(409).send({ status: false, msg: " title already exists" })


      if (!validation.isValidISBN(data.ISBN)) {
          return res.status(400).send({ status: false, msg: "Invalid ISBN" });
      }
      let uniqueISBN = await bookModel.findOne({ ISBN: data.ISBN })
      if (uniqueISBN) return res.status(409).send({ status: false, msg: " ISBN already exists" })

      let updateBooks = await bookModel.findOneAndUpdate({ _id: bookId,isDeleted:false }, {
          $set: {
              title: data.title,
              excerpt: data.excerpt,
              releasedAt: data.releasedAt,
              ISBN: data.ISBN
              // name : data.name
          }
      }, { new: true})      // upsert = update and insert (optional in this case)

      if (!updateBooks) {       //
          return res.status(404).send({ status: false, msg: "Invalid Request" })
      }
          res.status(200).send({ status: true, data: updateBooks })
  }
  catch (err) {
      console.log(err)
      res.status(500).send({ status: false, msg: "error", err: err.message })
  }
}

// =============================================================================================================================================================================================================================================


const deleteBooksbyId = async function (req, res) {
  try {
    const bookId = req.params.bookId
    console.log(bookId)
    if (!bookId) return res.status(400).send({ status: false, msg: "BookId should be present in params" })
    // let check = await bookModel.findOne({ _id: bookId,isDeleted:false })
    
    // if (!check) return res.status(404).send({ status: false, msg: "no such book exist" })
   
      let deleteBook = await bookModel.findOneAndUpdate({ _id: bookId,isDeleted:false}, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true }) // we can change new Date() to moment().format()
      if (!deleteBook) return res.status(404).send({ status: false, msg: "no such book exist" })
   
      res.status(200).send({ status: true, msg: "book is deleted successfully" })

  }
  catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: "error", err: err.message })
  }
}

module.exports.createBook = createBook;
module.exports.getBooks = getBooks;
module.exports.getBookById = getBookById;
module.exports.updateBooks = updateBooks;
module.exports.deleteBooksbyId  = deleteBooksbyId ;
