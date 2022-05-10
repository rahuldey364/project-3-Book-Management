const bookModel = require("../models/bookModel.js");
const userModel = require("../models/userModel.js");
const reviewModel = require("../models/reviewModel");

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

// // -----------CreateBooks-----------------------------------------------------------------------------------
// const createBook = async function(req, res) {
//     try{
//         const book = req.body
//         if(!isvalidRequestBody(book)){
//             res.status(400).send({status:false, msg:"Please provide the Book details"})   //Validate the value that is provided by the Client.
//         }
//         const {title, excerpt, userId, ISBN, category, subcategory} = book
//         if (!isvalid(title)){
//             return res.status(400).send({status:false, msg:"Please provide the Title"})   //Title is Mandory
//         }
//         const isDuplicateTitle = await bookModel.findOne({title: title})
//         if (isDuplicateTitle){
//             return res.status(400).send({status:true, msg:"Title is already exists."})   //Title is Unique
//         }
//         if (!isvalid(excerpt)){
//             return res.status(400).send({status:false, msg:"Please provide the excerpt"})   //Excerpt is Mandory
//         }
//         const isValidUserId = await userModel.findById(userId)
//         if (!isValidUserId){
//             return res.status(404).send({status:true, msg:"User not found."})   //find User in userModel
//         }

//         if (!/^[\d*\-]{10}|[\d*\-]{13}$/.test(ISBN)){
//             return res.status(400).send({status:false, msg:"Please provide a valid ISBN"})   //ISBN is mandory
//         }
//         const isDuplicateISBN = await bookModel.findOne({ISBN: ISBN})   //ISBN is unique
//         if (isDuplicateISBN){
//             return res.status(400).send({status:true, msg:"ISBN is already exists."})   //ISBN is unique
//         }
//         if (!isvalid(category)){
//             return res.status(400).send({status:false, msg:"Please provide a Category"})   //Category is mandory
//         }
//         if (subcategory.length == 0){
//             return res.status(400).send({status:false, msg:"Please provide a subCategory"})   //subcategory is mandory
//         }
//         book.releasedAt = Date.now()
//         const saved = await bookModel.create(book)  //creating the Book details
//         res.status(201).send({status: true, msg : "Book is created successfully.", data: saved})

//     }
//     catch(err) {
//         console.log(err)
//         res.status(500).send({msg: err.message})
//     }
// }

let createBook = async function (req, res) {
  let requiredBody = req.body;
  if (!isvalidRequestBody(requiredBody)) {
    return res
      .status(400)
      .send({ status: false, msg: "please provide College details" });
  }
  let {
    title,
    excerpt,
    userId,
    ISBN,
    category,
    subcategory,
    reviews,
    isDeleted,
    releasedAt,
  } = req.body;

  if (isDeleted) {
    if (isDeleted == true) {
      return res.status(400).send({ status: false, msg: "data is not vailid" });
    }
  }

  if (!isvalid(title)) {
    return res.status(400).send({ status: false, msg: "title is required" });
  }
  let uniqueTitle = await bookModel.findOne({ title: title });
  if (uniqueTitle)
    return res
      .status(409)
      .send({ status: false, msg: " title already exists" });

  if (!isvalid(excerpt)) {
    return res.status(400).send({ status: false, msg: "excerpt is required" });
  }

  if (!isvalid(category)) {
    return res.status(400).send({ status: false, msg: "category is required" });
  }

  if (subcategory) {
    for (let i = 0; i < subcategory.length; i++) {
      if (!isvalid(subcategory[i])) {
        return res
          .status(400)
          .send({ status: false, message: "subategory is not valid" });
      }
    }
  }

  if (reviews) {
    if (!isValidNumber(reviews)) {
      return res.status(400).send({ status: false, msg: "number is required" });
    }
  }
  let pattern = /^[0-9A-Fa-f]{24}$/;

  if (!pattern.test(userId)) {
    return res
      .status(400)
      .send({ status: false, message: "userId is not valid" });
  }
  let validUserId = await userModel.findById({ _id: userId });

  if (!validUserId) {
    return res.status(404).send({ status: false, msg: `userId not Exists` });
  }

  let pattern1 = /^[\d*\-]{10}|[\d*\-]{13}$/;

  if (!pattern1.test(ISBN)) {
    return res
      .status(400)
      .send({ status: false, message: "ISBN is not valid" });
  }

  let uniqueISBN = await bookModel.findOne({ ISBN: ISBN });
  if (uniqueISBN)
    return res.status(409).send({ status: false, msg: " ISBN already exists" });

  let check =
    /^(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\/|-|\.)0?2\3(?:29)$/;
  if (releasedAt) {
    if (!check.test(releasedAt)) {
      // need to solve this later
      return res
        .status(409)
        .send({ status: false, msg: " date must be in yyyy-mm-dd" });
    }
  }

  if (!releasedAt) {
    req.body.releasedAt = new Date();
  }

  let dataBook = await bookModel.create(req.body);

  return res.status(201).send({ status: true, data: dataBook });
};

//============GET /books=====================
const GetData = async function (req, res) {
  try {
    let query = req.query;

    //   console.log(query);
    let GetRecord = await bookModel
      .find({
        $and: [{ isDeleted: false, ...query }],
      })
      .sort({ title: 1 })
      .select({
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        releasedAt: 1,
        reviews: 1,
      });

    //   let arranged = GetRecord.sort({title: -1})

    // let arranged = GetRecord.sort(function (a, b) {
    //     if (a.title.toLowerCase().split(" ").join("") < b.title.toLowerCase().split(" ").join("")) return -1;
    //     // if (a.title.toLowerCase().split(" ").join("") > b.title.toLowerCase().split(" ").join("")) return 1;
    //     return 0;
    // })
    if (GetRecord.length == 0) {
      return res.status(404).send({
        data: "No such document exist with the given attributes.",
      });
    }
    res.status(200).send({ status: true, data: GetRecord });
  } catch (err) {
    res.status(500).send({ status: false, data: err.message });
  }
};

// const getBookDetails = async function (req, res) {
//     try {
//       let bookId = req.params.bookId
//       if (!bookId) {
//         return res.status(400).send({
//           status: false,
//           message: "enter a Book Id  first",
//         });
//       }
//       const isValidBook = await bookModel.findOne({ _id: bookId }); //{ _Id}
//       if (!isValidBook) {
//         return res.status(404).send({
//           status: false,
//           message: "you have entered a invalid book id  ",
//         });
//       }
//       const getReviews = await reviewModel.find({ collegeId: isValidBook._id, isDeleted: false })
//     //   if (getIntern.length == 0) {
//     //     return res.status(404).send({
//     //       status: false,
//     //       message: "no intern found with your provided college details",
//     //     });
//     //   }
//     //   const getAllIntern = {

//     //     reviewsData: getReviews
//     //   };
//     isValidBook.reviewsData=getReviews
//       res.status(200).send({ status: true, data: isValidBook });
//     } catch (err) {
//       res.status(500).send({ status: false, message: err.message });
//     }
//   };

const getBookDetails = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!bookId) {
      return res
        .status(400)
        .send({ status: false, message: "enter a Book Id  first" });
    }
    const isValidBook = await bookModel.findOne({ _id: bookId }); //{ _Id}
    if (!isValidBook) {
      return res.status(404).send({
        status: false,
        message: "you have entered a invalid book id  ",
      });
    }
    const getReviews = await reviewModel.find({
      bookId: bookId,
      isDeleted: false,
    });
    let len = getReviews.length;

    let Data = {
      _id: isValidBook._id,
      title: isValidBook.title,
      excerpt: isValidBook.excerpt,
      userId: isValidBook.userId,
      category: isValidBook.category,
      subcategory: isValidBook.subcategory,
      deleted: isValidBook.isDeleted,
      reviews: len,
      deletedAt: isValidBook.deletedAt,
      releasedAt: isValidBook.releasedAt,
      createdAt: isValidBook.createdAt,
      updatedAt: isValidBook.updatedAt,
      reviewsData: getReviews,
    };

    // isValidBook.reviewsData = (getReviews.length != 0) ? getReviews : "No reviews"
    res.status(200).send({ status: true, data: Data });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

const updateBooks = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!bookId) {
      return res
        .status(400)
        .send({ status: false, message: "enter a Book Id  first" });
    }
    let data = req.body;
    let { title, excerpt, releaseDate, ISBN } = req.body;
    if (!data)
      return res
        .status(400)
        .send({ status: false, msg: "BookId is required in params" });

    let uniqueTitle = await bookModel.findOne({ title: title });
    if (uniqueTitle)
      return res
        .status(409)
        .send({ status: false, msg: " title already exists" });

    let uniqueISBN = await bookModel.findOne({ ISBN: ISBN });
    if (uniqueISBN)
      return res
        .status(409)
        .send({ status: false, msg: " ISBN already exists" });

    let updateBooks = await bookModel.findOneAndUpdate(
      { _id: bookId },
      {
        $set: {
          title: title,
          excerpt: excerpt,
          releasedAt: releaseDate,
          ISBN: ISBN,
        },
      },
      { new: true, upsert: true }
    );

    if (updateBooks.length == 0) {
      return res.status(404).send({ status: false, msg: "Invalid Request" });
    } else {
      res.status(200).send({ status: true, data: updateBooks });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: false, msg: "error", err: err.message });
  }
};



const deleteBooksbyId = async function(req ,res){
    try {
        const bookId = req.params.bookId
        if(!bookId) return res.status(400).send({status : false, msg : "BookId should be present in params"})
        let check = await booksModel.findOne({ _id : bookId})
        let checking = check.isDeleted
        if(checking == true) return res.status(404).send({status : false,msg : "Already deleted"})
        if(checking == false){
        let deleteBlog = await booksModel.findOneAndUpdate({ _id: bookId }, {$set :{ isDeleted: true, deletedAt: new Date() }}, { new: true, upsert : true }) // we can change new Date() to moment().format()
            res.status(200).send({ status:true,msg: "book is deleted successfully" })
        } 
  
    }
    catch(err){
        console.log(err)
        res.status(500).send({ status: false, msg: "error", err: err.message })
    }
}



module.exports.createBook = createBook;
module.exports.GetData = GetData;
module.exports.getBookDetails = getBookDetails;
module.exports.updateBooks = updateBooks;
module.exports.deleteBooksbyId = deleteBooksbyId;
