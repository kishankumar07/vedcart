let Wishlist = require('../model/wishListModel');
let Category = require("../model/categoryModel");
let Product = require("../model/productModel");
let User = require('../model/userModel')


//============== wish list page ===================

const wishList = async (req, res) => {
    try {
        const { userNameforProfile, cart, categoriesWithProducts, totalPriceOfCartProducts,userId } = res.locals.commonData;
      const wishlist = await Wishlist.findOne({ user: userId }).populate({
        path:'products.product',
        model:'Product',
      })
      res.render("wishlist", { cart,totalPriceOfCartProducts,userNameforProfile, user:userId, wishlist,categoriesWithProducts });
    } catch (error) {
      console.error("Error during wishlist loading:", error);
      res.status(500).redirect("/error");
    }
  };


  //==========add to wishlist list page====================

  const addProductToWishList = async (req, res) => {
    try {
  
       let user = req.session.userData;
        let productId = req.body.id;
        let [product,wishFind] = await Promise.all([
            Product.findById(productId),
            Wishlist.findOne({ user }).populate({
                path:'products.product',
                model:'Product',
              })
        ])

      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
      }
        
       
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
    
      if (wishFind) {
        const existingProduct = wishFind.products.find(
          (prod) => prod.product.id === product.id
        );
       
  
        if (existingProduct) {
         return res.json({ success: false, message: "Already in wishlist" });
        } else {
  
         
         
          wishFind.products.push({
            product: product._id,
            
          });
  
          await wishFind.save();
         return res.json({ success: true, message: "Added to wishlist" });
        }
      } else {
        const newWishlist = new Wishlist({
          user: user,
          products: [
            {
              product: product._id,
             
            },
          ],
        });
  
        await newWishlist.save();
        res.json({ success: true, message: "Added to wishlist" });
      }
    } catch (error) {
      console.log('error at adding product to wishlist :',error.message);
      res.status(500).redirect('/error')
    }
  };
  
  
  //==========remove a product from wishlist======================
  
  const productremovefromwish = async (req, res) => {
    try {

let [product,currentUser] = await Promise.all([
    Product.findById(req.query.productId),
    User.findById(req.query.userId)
])

      // Ensure productId is included in the request query parameters
      if (!req.query.productId) {
        return res
          .status(400)
          .json({ success: false, message: "Product ID is required." });
      }
  
      // Correctly use the productId in the $pull operation
     let value =  await Wishlist.updateOne(
        { user: currentUser._id },
        { $pull: { products: { product: product.id } } },
        {new:true}
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
      res.status(500).redirect('/error')
    }
  };
  


  module.exports = {
    wishList,
    addProductToWishList,
    productremovefromwish
  }