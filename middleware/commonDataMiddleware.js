
const User = require('../model/userModel');
const Cart = require('../model/cartModel');
const Category = require('../model/categoryModel');
let Product = require("../model/productModel");
let Wishlist = require("../model/wishListModel");

// helper function to find the greatest of product or category offer present
const chooseOffer = (productOffer, categoryOffer) => {
  if (!productOffer && !categoryOffer) return null;
  if (!productOffer) return categoryOffer;
  if (!categoryOffer) return productOffer;
  return productOffer.discount > categoryOffer.discount ? productOffer : categoryOffer;
};


const fetchCommonData = async (req, res, next) => {
    try {

  let categoriesWithProducts = await Category.aggregate([
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
     
      if(req.session.userData){
        const userId = req.session.userData;
        const [userNameforProfile, cart, wishlist] = await Promise.all([
            User.findById(userId), 
            Cart.findOne({ userId }).populate({ path: "products.productId", 
            model: 'Product' }),
            Wishlist.findOne({user:userId}),
         ]);
    
           
            let productIds = cart?.products.map(product =>product.productId._id);

        

 const productsDetailsInCart = await Product.find({ _id: { $in: productIds } }).populate({
      path: 'category',
      populate: {
        path: 'offer',
      }
    }).populate({
      path: 'offer'
    });


//the optional chaining below this line is necessary in the sense that ,if a new user logins without any cart data , then there will be no error handling
    cart?.products.forEach(cartProduct => {
      const product = productsDetailsInCart.find(product => product._id.equals(cartProduct.productId._id));
      if (product) {
        const chosenOffer = chooseOffer(product.offer, product.category.offer);
        if (chosenOffer) {
          const discount = chosenOffer.discount ? Math.round(product.price * (chosenOffer.discount / 100)) : 0;
          cartProduct.appliedOffer = chosenOffer.name;
          cartProduct.appliedOfferDiscount = chosenOffer.discount;
          cartProduct.productId.offerprice = product.price - discount;
        
        } else {
          cartProduct.productId.offerprice = product.price;
         
        }
      } else {
        req.flash('message', "Product does not exist");
        return res.redirect('/cart');
      }
    });


            // to find the total of cart products to be displayed
            let totalPriceOfCartProducts = cart?.products.reduce((total,product)=>{
             let price = product.productId.offerprice || product.productId.price;
             return total + price * product.quantity;
            },0)
      
            //to display the count of cart items at header
            const cartProductCount = cart?.products.reduce((count, product) => count + product.quantity, 0) || 0;

            // to count the total of wishlist items 
            const wishlistProductCount = wishlist?.products.length || 0;



        res.locals.commonData = { userNameforProfile, cart,userId, categoriesWithProducts, totalPriceOfCartProducts,cartProductCount,wishlistProductCount };
          }else{
            res.locals.commonData = {categoriesWithProducts}
          }
        next();

    } catch (error) {
        console.log("Error fetching common data at common data middleware:", error);
        res.status(500).redirect('/error');
    }
};

module.exports = fetchCommonData;
