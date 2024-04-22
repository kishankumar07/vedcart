let mongoose = require('mongoose');

let offerSchema = mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true,
    },
    startingDate:{
        type:Date,
        
    },
    endDate:{
        type:Date,
        required: true
    },
    status:{
        type:Boolean,
        default:true,
    }
})
module.exports = mongoose.model('Offer',offerSchema)





// mongoose.Schema({ ... }): You're creating a Mongoose schema using the mongoose.Schema() function. Inside the function, you define the structure of documents for the 'Users' collection. Each document will have a name field of type String and an age field of type Number.

// mongoose.model('User', userSchema): You're creating a Mongoose model using the mongoose.model() function. This function takes two arguments: the name of the collection ('User' in this case) and the schema (userSchema). It returns a constructor function (User) that you can use to create new instances of documents for the 'Users' collection.

// So, User is not the actual collection or schema; it's a constructor function created by Mongoose based on the schema you defined. You use this constructor function to interact with the 'Users' collection in your MongoDB database. For example, you can create a new user document using new User({ ... }), save it to the database using .save(), query existing documents using .find(), and so on.






