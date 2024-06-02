const mongoose=require("mongoose")

const dbConnect=async(req,res)=>{
    try{
        const conn= await mongoose.connect(process.env.MONGODB_URL);

        console.log("Database connected at atlas");
    }catch(error){
        console.error("Database error",error);
    }
}

module.exports = dbConnect




