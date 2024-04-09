const express = require("express");
const router = express();
let path = require("path");
let User = require('../model/userModel')
const passport = require('passport');
let userController = require("../controller/userController");
let userAuth = require("../middleware/userAuth");
let cartController  = require('../controller/cartController')
let orderController  = require('../controller/orderController')
const {aProductPage,shopProduct}=require('../controller/productController');
// const GoogleSignIn = require('../model/googleModel');
const googleModel = require("../model/googleModel");

//Setting view engine
router.set("view engine", "ejs");
router.set("views", path.join(__dirname, "../views/user"));

//=======================error route========================
router.get("/error", userController.errorPage);

//=====User login==================================





router.get("/", userController.loadIndex);
router.get("/signin",userAuth.isLoggedOut, userController.signinUser); // If no session it will render login page
router.post("/signin", userController.verifyLogin);
router.get("/signup", userController.signUpUser);
router.post("/signup", userController.createUser);
router.post("/verifyOTP", userController.verifyOTP);
router.post("/resendOTP",userController.resendOTP);
router.get('/signout',userController.signout);


router.get("/shop", userController.shopPage);
router.get("/productPage", userController.aProductPage);


//  -- -- -- -- -- -- -- c a r t -- -- -- -- -- -- -- - - - - - - -- --

router.get("/cart",userAuth.isBlocked,userAuth.isLoggedIn,cartController.loadCart);

router.post("/addToCart",userAuth.isBlocked,userAuth.isLoggedIn,cartController.addToCart);

router.post("/addToCart/:productId/:quantity/:userId?",cartController.addToCart)


router.delete("/deleteCartItem", userAuth.isBlocked, userAuth.isLoggedIn, cartController.deleteCartItem);

router.post("/updatequantity",userAuth.isBlocked,userAuth.isLoggedIn,cartController.updateCartItemCount);

router.get('/checkout',userAuth.isBlocked,userAuth.isLoggedIn,cartController.loadCheckout)

router.post("/addAddressAtCheckout",userAuth.isBlocked,userAuth.isLoggedIn,cartController.addAddressAtCheckout);


router.post('/placeorder',userAuth.isBlocked,userAuth.isLoggedIn,orderController.placeTheOrder)

router.get('/ordersuccess',userAuth.isBlocked,userAuth.isLoggedIn,orderController.orderSuccess)

// router.post("/moveToSaveForLater",userAuth.isBlocked,userAuth.isLoggedIn,cartController.moveToSaveForLater);




//================= user profile page --------------------------

router.get('/userProfile',userAuth.isBlocked,userAuth.isLoggedIn,userAuth.isVerified,userController.loadUserProfile)

router.post('/editProfile',userController.editProfile)
  
router.post('/changePassword',userController.changePassword)

router.post("/addAddressatProfile",userAuth.isBlocked,userAuth.isLoggedIn,userController.addAddressatProfile);

router.post('/updateaddress/:id',userController.editAddress)

router.delete('/removeaddress/:id', userController.removeAddress);

router.get("/orderdetails",orderController.loadOrderDetailsPage)
  
router.post('/cancelOrder', orderController.cancelOrPlacedOrder);



  














//----------  w i s h l i s t --------------------------------
router.get("/wishlist", userAuth.isBlocked,userAuth.isLoggedIn, userController.wishList);

router.post('/productaddtowishlist',userController.addProductToWishList)

router.post('/productremovefromwishlist',userController.productremovefromwish)




// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google authentication callback route
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signin' }), async(req, res) => {
  // Successful authentication
  // Associate Google user with local user account
  try {
    console.log('here at callback google');
      // Retrieve the Google user data stored in req.user
      const googleUserData = req.user;
      
      // Find or create a local user based on email
      let user = await User.findOne({ email: googleUserData.email });
      console.log('this is the user data at google auth route: ',user);
      if (!user) {
          // Create a new local user
          user = new User({
              name: googleUserData.name,
              email: googleUserData.email,
              googleUser: googleUserData._id // Associate with Google user
          });
          await user.save();
      } else {
          // Update existing user to associate with Google user
          user.googleUser = googleUserData._id;
          await user.save();
      }
      
      // Set user data in session
      req.session.userData = user;


      console.log('user successfully logged at google auth and this is present in the session',req.session.user);


      // Redirect to home page
      res.redirect('/');
  } catch (error) {
      console.error('Error associating Google user with local user:', error);
      // Handle error
      res.redirect('/signin');
  }
});



  




module.exports = router;










  










