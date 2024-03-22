let mongoose = require("mongoose");

let categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
});
module.exports = mongoose.model('Category',categorySchema);