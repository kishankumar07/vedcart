const express = require("express");
const router = express();
let path = require("path");
let User = require('../model/userModel')
const passport = require('passport');
let {logRequest} = require('../middleware/loggingMiddleware');
let userController = require("../controller/userController");
let userAuth = require("../middleware/userAuth");
let cartController  = require('../controller/cartController')
let couponController = require('../controller/couponController');
let orderController  = require('../controller/orderController')
let wishlistController = require('../controller/wishlistController');
const {aProductPage,shopProduct,loadProductSearchQuery,mainProductSearch}=require('../controller/productController');
// const GoogleSignIn = require('../model/googleModel');
const googleModel = require("../model/googleModel");

//Setting view engine
router.set("view engine", "ejs");
router.set("views", path.join(__dirname, "../views/user"));

//=======================error route========================
router.get("/error", userController.errorPage);

// search at the header of all
router.get('/mainSearch',mainProductSearch)




//=====User login==================================

router.get("/", userController.loadIndex);
router.get("/signin",userAuth.isLoggedOut, userController.signinUser); // If no session it will render login page
router.post("/signin", userController.verifyLogin);
router.get("/signup",userAuth.isLoggedOut,  userController.signUpUser);
router.post("/signup", userController.createUser);
router.post("/verifyOTP", userController.verifyOTP);
router.post("/resendOTP",userController.resendOTP);
router.get('/signout',userController.signout);
router.post('/verify-email',userController.verifyEmail)
router.post('/update-password',userController.forgotPasswordChangePassword)



router.get("/shop", userController.shopPage);



router.get("/productPage", userController.aProductPage);
router.get('/loadProductSearchQuery',loadProductSearchQuery)

//  -- -- -- -- -- -- -- c a r t -- -- -- -- -- -- -- - - - - - - -- --

router.get("/cart",userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,cartController.loadCart);

router.post("/addToCart",userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,cartController.addToCart);

router.post("/addToCart/:productId/:quantity/:userId?",userAuth.isLoggedIn,cartController.addToCart)


router.delete("/deleteCartItem",  userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified, cartController.deleteCartItem);

router.post("/updatequantity",userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,cartController.updateCartItemCount);

router.get('/checkout',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,cartController.loadCheckout)

router.post("/addAddressAtCheckout",userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,cartController.addAddressAtCheckout);


router.post('/placeorder',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,orderController.placeTheOrder)

router.post("/verifypayment",orderController.verifyPayment)

router.get('/ordersuccess',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,orderController.orderSuccess)

// router.post("/moveToSaveForLater",userAuth.isBlocked,userAuth.isLoggedIn,cartController.moveToSaveForLater);




//================= user profile page --------------------------

router.get('/userProfile',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,userController.loadUserProfile)

router.put('/editProfile',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,userController.editProfile)
  
router.put('/changePassword',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,userController.changePassword)

router.post("/addAddressatProfile",userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,userController.addAddressatProfile);

router.put('/updateaddress/:id',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,userController.editAddress)

router.delete('/removeaddress/:id', userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,userController.removeAddress);

router.get("/orderdetails",userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,orderController.loadOrderDetailsPage)
  
// router.get("/orderdetails",userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,orderController.loadOrderDetailsPage)


router.get('/download-invoice',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified, orderController.loadDownloadInvoice);

router.patch('/cancelOrder',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified,orderController.cancelOrPlacedOrder)

router.post('/returnOrder/:orderId/:productId',orderController.returnOrder)

router.post('/retryPayment',userAuth.isLoggedIn,userAuth.isBlocked,userAuth.isVerified, orderController.retryPayment);


//------------ applying and removing the coupon -------------------------
router.post("/applyCoupon",userAuth.isLoggedIn,userAuth.isBlocked,couponController.applyCoupon)

router.post('/removeCoupon',userAuth.isLoggedIn,userAuth.isBlocked,couponController.removeCoupon)






//----------  w i s h l i s t --------------------------------
router.get("/wishlist",userAuth.isLoggedIn,userAuth.isBlocked, wishlistController.wishList);

router.post('/wishlist',userAuth.isLoggedIn,userAuth.isBlocked,wishlistController.addProductToWishList)

router.delete('/wishlist',userAuth.isLoggedIn,userAuth.isBlocked,wishlistController.productremovefromwish)



//---------about page------------------------------
router.get('/about',userController.loadAboutPage)

router.get('/contact',userController.loadContactUsPage)

router.get('/blog',userController.loadNewsPage)





// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google authentication callback route
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signin' }), async(req, res) => {
  // Successful authentication
  // Associate Google user with local user account
  try {
    console.log('here at callback google');
      // Retrieve the Google user data stored in req.user
      //by the way this is same as 
      const googleUserData = req.user;
      
console.log('this is the req.user :',googleUserData);


   
      // Set user data in session
      req.session.userData = googleUserData._id; // Store user ID in session


      console.log('user successfully logged at google auth and this is present in the session',req.session.userData);


      // Redirect to home page
      res.redirect('/');
  } catch (error) {
      console.error('Error associating Google user with local user:', error);
      // Handle error
      res.redirect('/signin');
  }
});
















module.exports = router;









  










