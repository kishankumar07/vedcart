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
    category:{
        type:String,
       required:true,
    },
    quantity:{
        type:Number,     
        default:0
    },
    
    price:{
        type:String,
        required:true
    },
    images:{
        type:[String]
    },
    status:{
        type:Boolean,
        default:true
    }

})
module.exports = mongoose.model('Product',productSchema);