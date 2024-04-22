let mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true, // Assuming a product must belong to a category
      },
    quantity:{
        type:Number,     
        default:0
    },
    date:{
        type: Date,
        required:true
    },
    price:{
        type:String,
        min:0,
        required:true
    },
    offerprice: {
        type: Number,
        required: false,
    },
    images:{
        type:[String]
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active',
      },
      offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
      },

})
module.exports = mongoose.model('Product',productSchema);







