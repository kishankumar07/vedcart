let mongoose = require("mongoose");


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
addressField: [{
  name: {
      type: String,
      required: true
  },
  mobile: {
      type: Number,
      required: true
  },
  
  addressDetails: {
      type: String,
      required: true
  },

  city: {
      type: String,
      required: true
  },
  state: {
      type: String,
      required: true,
      enum: [
          'Andhra Pradesh',
          'Arunachal Pradesh',
          'Assam',
          'Bihar',
          'Chhattisgarh',
          'Goa',
          'Gujarat',
          'Haryana',
          'Himachal Pradesh',
          'Jharkhand',
          'Karnataka',
          'Kerala',
          'Madhya Pradesh',
          'Maharashtra',
          'Manipur',
          'Meghalaya',
          'Mizoram',
          'Nagaland',
          'Odisha',
          'Punjab',
          'Rajasthan',
          'Sikkim',
          'Tamil Nadu',
          'Telangana',
          'Tripura',
          'Uttar Pradesh',
          'Uttarakhand',
          'West Bengal'
        ]
  },
  
  pincode: {
      type: Number,
      required: true
  }
}],


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
  createdAt: {
        type: Date,
        default: Date.now
      },
      wallet:{
        type:Number,
        default:0
    },
    wallet_history:[{
        date:{
            type:Date
        },
        amount:{
            type:Number
        },
        reason:{
            type:String
        }
    }],

});
module.exports=mongoose.model('User',userSchema)


// In Mongoose, the model name is typically used to determine the collection name in MongoDB. By default, Mongoose will use the lowercase, pluralized version of the model name as the collection name.

// In your case, the model name is "User," and Mongoose will automatically use the pluralized version "users" as the collection name. This behavior is part of Mongoose's conventions.

