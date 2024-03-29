const mongoose=require('mongoose')


const wishlist = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Products:[{
        product:{
            type : mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required: true
        },
        price:{
            type:Number,
            required:true
        },
        
        name:{
            type:String,
            required:true
        }
    }],
    
})
module.exports = mongoose.model('Wishlist',wishlist)