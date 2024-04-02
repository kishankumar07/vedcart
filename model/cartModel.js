const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  brand:{
    type:String,
    required:true
},
  category:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required:true
  },
  images:{
    type:[String],
    required:true
  },
  quantity: {
    type: Number,
    default: 1,
    required: true,
  },
  subTotal: {
    type: Number,
    default: 0,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Products: [cartItemSchema],
  // savedForLater: [cartItemSchema],
  grandTotal: {
    type: Number,
    default: 0,
    required: true,
  },
  couponApplied: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  shippingCharge: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
