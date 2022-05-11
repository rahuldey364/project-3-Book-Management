const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const isvalid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isvalidRequestBody = function (requestbody) {
  return Object.keys(requestbody).length > 0;
};

let createUser = async function (req, res) {
  try {
    let requiredBody = req.body;

    if (!isvalidRequestBody(requiredBody)) {
      return res.send({ status: false, msg: "please provide  details" });
    }

    let { title, name, email, password, phone, address } = req.body;

    if (!isvalid(title)) {
      return res.status(400).send({ status: false, msg: "title is required" });
    }

    if (["Mr", "Mrs", "Miss"].indexOf(title) == -1) {
      return res
        .status(400)
        .send({ status: false, message: "title should be Mr,Miss,Mrs" });
    }

    if (!isvalid(name)) {
      return res.status(400).send({ status: false, msg: "Name is required" });
    }
    if (!isvalid(email)) {
      return res.status(400).send({ status: false, msg: "Email is required" });
    }

    if (address) {
      var check = Object.values(address);
      if (check.length > 0) {
        for (let i = 0; i < check.length; i++) {
          if (!isvalid(check[i])) {
            return res
              .status(400)
              .send({ status: false, msg: "address is not valid" });
          }
        }
      }
    }
    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
      return res
        .status(400)
        .send({ status: false, data: "plz enter the valid Email" });
    }

    let pattern = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/;

    if (!pattern.test(password)) {
      return res
        .status(400)
        .send({ status: false, msg: "password is not valid" });
    }
    let pattern1 = /^(\+91[\-\s]?)?[0]?(91)?[6-9]\d{9}$/;

    if (!pattern1.test(phone)) {
      return res
        .status(400)
        .send({ status: false, msg: "M Number is required" });
    }

    let validEmail = await userModel.findOne({ email: email });
    if (validEmail) {
      return res.status(409).send({ status: false, msg: "Email Alrady Exist" });
    }

    let validNumber = await userModel.findOne({ phone: phone });
    if (validNumber) {
      return res
        .status(409)
        .send({ status: false, msg: "phone Number Alrady Exist" });
    }

    let userData = await userModel.create(req.body);

    return res.status(201).send({ status: true, data: userData });
  } catch (err) {
    return res.status(500).send({ err: err.message });
  }
};

/////=========login=======================
const userLogIn = async function (req, res) {
  try {
    let userEmail = req.body.email;
    if (!userEmail) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }
    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(req.body.email)) {
      return res
        .status(400)
        .send({ status: false, data: "plz enter the valid Email" });
    }
    let userPassword = req.body.password;
    if (!userPassword) {
      return res
        .status(400)
        .send({ status: false, message: "passworrd is required" });
    }
    if (req.body.password.trim().length <= 6) {
      return res
        .status(400)
        .send({ status: false, data: "plz enter the valid Password" });
    }
    let isUser = await userModel.findOne({
      email: userEmail,
      password: userPassword,
    });
    if (!isUser) {
      return res
        .status(404)
        .send({ status: false, data: "No such author exists" });
    }
    let token = jwt.sign(
      {
        userId: isUser._id.toString(),
      },
      "functionUp",
      { expiresIn: "1200s" }
    );
    // res.setHeader("x-api-key",token)
    res.status(201).send({ status: true, data: { token: token } });
  } catch (err) {
    res.status(500).send({ status: false, data: err.message });
  }
};

module.exports.userLogIn = userLogIn;
module.exports.createUser = createUser;
