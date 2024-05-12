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
       
    }],
    
})
module.exports = mongoose.model('Wishlist',wishlist)