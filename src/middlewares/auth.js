const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");

let authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.status(401).send({ status: false, data: "Token not present" });
    }

    let decodedToken = jwt.verify(token, "functionUp"); //{payload and issuedat}
    
    req.decodedToken = decodedToken; //req is our existing object{previous data , decodedtoken:{payload and issuedat}}
    next();
  } catch (err) {
    res.status(401).send({ status: false, data: "Authentication failed" });
  }
};

let authorization = async function (req, res, next) {
  try {
    decodedToken = req.decodedToken;
    bookId = req.params.bookId;
    const isvalidId = await bookModel.findOne({_id:bookId,isDeleted:false});
    if (!isvalidId) {
      return res
        .status(401)
        .send({ status: false, data: "Please enter a valid bookId" });
    }
    // console.log(isvalidId);
    let userToBeModified = isvalidId.userId.toString();
    let userLoggedin = decodedToken.userId;
    if (userToBeModified !== userLoggedin) {
      return res
        .status(403)
        .send({
          status: false,
          data: "user logged is not allowed to modify the requested users data",
        });
    }
    // let user = await userModel.findById(userToBeModified);
    // if (!user) {
    //   return res
    //     .status(404)
    //     .send({ status: false, data: "no such user exists" });
    // }
    next();
  } catch (err) {
    res.status(500).send({ status: false, data: err.message });
  }
};

module.exports.authentication = authentication;
module.exports.authorization = authorization;