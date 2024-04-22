let mongoose = require('mongoose');

let couponSchema = mongoose.Schema({
    couponName:{
        type:String,
        required: true
    },
        description:{
        type:String,
        },
        minAmount:{
            type:Number,
            required:true,
        },
        discount:{
            type:Number,
           
        },
        couponCode:{
            type:String,
            required:true,
        },
        expiryDate:{
            type:Date,
            require:true,
        },
        status:{
            type:Boolean,
            default:true
        }

})

module.exports = mongoose.model('Coupon',couponSchema)