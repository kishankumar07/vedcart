const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products:[{
    productId:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required: true
    },
    productPrice:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        default:1,
        required:true
    },

    totalPrice : {
        type:Number,
        default: 0
    },
}],
  
});

module.exports = mongoose.model("Cart", cartSchema);








