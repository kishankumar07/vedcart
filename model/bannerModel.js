
const mongoose=require("mongoose")
const bannerSchema=mongoose.Schema({

    image:{
        type:[String],
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:false
    },
    location: {
        type: String,
       
      },
      status: {
        type: Boolean,
        default: true,
      },
      date: {
        type: Date,
        required: true, //location
      },
})
const Banner=mongoose.model('Banner',bannerSchema)
module.exports=Banner



