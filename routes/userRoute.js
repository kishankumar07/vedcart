const express = require("express");
const router = express();
let path = require("path");
const passport = require('passport');
let userController = require("../controller/userController");
let userAuth = require("../middleware/userAuth");
const {aProductPage,shopProduct}=require('../controller/productController');
const GoogleSignIn = require('../model/googleModel');
const googleModel = require("../model/googleModel");

//Setting view engine
router.set("view engine", "ejs");
router.set("views", path.join(__dirname, "../views/user"));

//=======================error route========================
router.get("/error", userController.errorPage);

//=====User login==================================
router.get("/", userController.loadIndex);
router.get("/signin", userController.signinUser); // If no session it will render login page
router.post("/signin", userController.verifyUser);
router.get("/signup", userController.signUpUser);
router.post("/signup", userController.createUser);
router.post("/verifyOTP", userController.verifyOTP);
router.post("/resendOTP",userController.resendOTP);
router.get('/signout',userController.signout);













// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signin' }), async(req, res) => {
  // Successful authentication, redirect to home page or dashboard


  req.session.userData = req.user; // Assuming user object is available on req.user after authentication

 res.redirect('/')
});


  




module.exports = router;
