const mongoose=require('mongoose')


const wishlist = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products:[{
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
        },
        image:{
            type:[String],
            required:true
        },
        quantity:{
            type:Number,
            required:true
        }
    }],
    
})
module.exports = mongoose.model('Wishlist',wishlist)