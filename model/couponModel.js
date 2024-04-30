let mongoose = require('mongoose');

let couponSchema = mongoose.Schema({
    couponName:{
        type:String,
        required: true
    },
        description:{
        type:String,
        },
        minAmount:{
            type:Number,
            required:true,
        },
        discount:{
            type:Number,
           
        },
        couponCode:{
            type:String,
            required:true,
        },
        expiryDate:{
            type:Date,
            require:true,
        },
        status:{
            type:Boolean,
            default:true
        },
        userUsed:[{
            userid:{
                type:mongoose.Types.ObjectId,
                ref:'User'
            },
            used:{
                type:Boolean,
                default:false
            }
        }]
    },{timestamps:true})


    couponSchema.pre('find', async function () {
        const currentDate = new Date();
        await this.model.updateMany(
            { expiryDate: { $lt: currentDate }, status: true },
            { $set: { status: false } }
        );
      });
      
      module.exports = mongoose.model('Coupon',couponSchema)

module.exports = mongoose.model('Coupon',couponSchema)









