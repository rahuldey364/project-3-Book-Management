const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")


// const isvalid = function (value) {
//   if (typeof value === "undefined" || value === null) return false;
//   if (typeof value === "string" && value.trim().length === 0) return false;
//   return true;
// };






const userLogIn = async function (req, res) {



  let data1 = req.body.email;
  let data2 = req.body.password;

  if (!data1) { return res.status(400).send({ status: false, message: "email is required" }) }

  if (!data2) { return res.status(400).send({ status: false, message: "password is required" }) }

  let checkData = await userModel.findOne({ email: data1, password: data2 });
  
  if (!checkData) {
      res.status(404).send({ status: false, msg: 'Invalid Credential' });
  }
  else {
    // var token = jwt.sign({email_id:'123@gmail.com'}, "Stack", {
//   expiresIn: '24h' // expires in 24 hours
//    });

      let token = jwt.sign({ userId: checkData._id }, "functionUp",{expiresIn: '120s'});
      res.setHeader("x-api-key",token);
      // res.setHeader("x-userId",checkData._id)
      res.status(200).send({status:true,data:"logged in successfully"})
      
  }
}


module.exports.userLogIn = userLogIn 