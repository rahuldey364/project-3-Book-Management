const { default: mongoose } = require("mongoose");



const userSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      // lowercase: true,
      // validate: {
      //   validator: function (email) {
      //     return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)
      //   }, message: 'Please Fill a valid Email Address.',
      //   isAsync: false
      // }
  
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: String,
      city: String,
      pincode: String
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }, { timestamps: true })
  
  module.exports = mongoose.model('User', userSchema)