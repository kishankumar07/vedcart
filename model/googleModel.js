const mongoose = require('mongoose');

// Define GoogleSignIn schema
const GoogleSignInSchema = new mongoose.Schema({
  googleId: {
    type:String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

// Create and export GoogleSignIn model
module.exports = mongoose.model('GoogleSignin', GoogleSignInSchema);













