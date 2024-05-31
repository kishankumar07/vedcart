const mongoose=require("mongoose")

const dbConnect=async(req,res)=>{
    try{
        const conn= await mongoose.connect(process.env.MONGODB_URL);

        console.log("Database connected");
    }catch(error){
        console.log("Database error");
    }
}

module.exports = dbConnect




