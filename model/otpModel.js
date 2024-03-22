const mongoose=require('mongoose')

   const ObjectId= mongoose.Schema.Types.ObjectId


const OTPSchema=new mongoose.Schema({

    
    otp:{
        type:String,
        require:true
    },

    userId:{
        type:ObjectId,
        required:true
},
    isVerified:{   
        type:String,
        default:false
},
    createDate:{
        type:Date,
        default:Date.now,
        expires:20
}

})



module.exports=mongoose.model('OTP',OTPSchema)