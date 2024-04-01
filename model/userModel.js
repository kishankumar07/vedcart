let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");

let userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  mobile: {
    type: Number,
    require: true,
  },
  password: {
   
      type: String,
      // required: function () {
      //   return !this.googleUser; // Password is required if user is not created via Google
      // },
  
},

googleUser: {
  type: String,
  ref: "GoogleSignin", // Reference to the Google user
},
  isVerified: {
    type: Boolean,
    default: false,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
 


  
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

// In Mongoose, the model name is typically used to determine the collection name in MongoDB. By default, Mongoose will use the lowercase, pluralized version of the model name as the collection name.

// In your case, the model name is "User," and Mongoose will automatically use the pluralized version "users" as the collection name. This behavior is part of Mongoose's conventions.








