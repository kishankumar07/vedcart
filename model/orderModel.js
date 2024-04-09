const mongoose = require("mongoose")
const ordersSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    Products: [{

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',

        },
        name: {
            type: String,

        },
        price: {
            type: Number,

        },
        quantity: {
            type: Number,

        },
        subTotal: {
            type: Number,

        },
      
        orderStatus: {
            type: String,
            default: 'placed',
           
        },
        reason:{
            type: String
        },
        image:{
            type:[String],
            required:true
        }
    }
],
total: {
    type: Number,

},
shipping: {
    type: String,

},
grandTotal: {
    type: Number,

},

    paymentMode: {
        type: String,

    },
    paymentStatus:{
        type:String,
        default:"pending"
    },
    
    time:{
    type:String,
  },

     date:{
    type:String,
   },

    address: {
        type: Object
    },

},
{ timestamps: true }
);

const Orders=mongoose.model('Orders',ordersSchema)
module.exports=Orders