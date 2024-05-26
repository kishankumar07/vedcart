
const User = require('../model/userModel');
const Cart = require('../model/cartModel');
const Category = require('../model/categoryModel');

const fetchCommonData = async (req, res, next) => {
    try {

      console.log('what is at session now :',req.session.userData)
     

        const userId = req.session.userData;
        const [userNameforProfile, cart, categoriesWithProducts] = await Promise.all([
            User.findById(userId),
            Cart.findOne({ userId }).populate({ path: "products.productId", model: 'Product' }),
            Category.aggregate([
                {
                  $match: {
                    status: "active"
                  }
                },
                {
                  $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'products'
                  }
                },
                {
                  $addFields: {
                    products: {
                      $filter: {
                        input: "$products",
                        as: "product",
                        cond: { $eq: ["$$product.status", "active"] }
                      }
                    }
                  }
                },
                {
                  $project: {
                    name: 1,
                    image: 1,
                    description: 1,
                    status: 1,
                    offer: 1,
                    products: 1
                  }
                }
              ])
        //after aggregation if the id field is not required, then specify _id:0 
            ]);
       

        const totalPriceOfCartProducts = cart?.products.reduce((acc, curr) => acc + curr.totalPrice, 0) || 0;

        res.locals.commonData = { userNameforProfile, cart,userId, categoriesWithProducts, totalPriceOfCartProducts };

         
           

              // Continue to the next middleware
        next();

    } catch (error) {
        console.log("Error fetching common data at common data middleware:", error);
        res.status(500).redirect('/error');
    }
};

module.exports = fetchCommonData;
