let User = require("../model/userModel");
const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const OTP = require("../model/otpModel");
let Category = require("../model/categoryModel");
let Product = require("../model/productModel");
let Wishlist = require('../model/wishListModel')

//===========error- 500=======================

let errorPage = async (req, res) => {
  try {
    res.render("Error-500");
  } catch (error) {
    console.log(error.message);
  }
};

//====================Hashing the password=======================================
const securePassword = async (password) => {
  console.log("password received here at securePassword", password);
  const saltRounds = 10; // Number of salt rounds
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

//load index-----------------------------------------------
const loadIndex = async (req, res) => {
  try {
    let user = req.session.userData;
    let userNameforProfile = await User.findById(user);
    
    let category = await Category.find({ status: "active" });

    let product = [];
    const pro = await Product.find({ status: "active" })
      .populate({
        path: "category",
        model: "Category",
      })
      .exec();

    // console.log('this comes in pro after  loading the home page :',pro)

    pro.forEach((e) => {
      if (e.category.status == "active") {
        product.push(e);
      }
    });

   
 

    res.render("home", { userNameforProfile,user,category, product });
  } catch (error) {
    console.log("Error happens in userController loadIndex function:", error);
  }
};

//========================= Login user page rendering================
const signinUser = async (req, res) => {
  try {
    let message = req.flash("message");
    res.render("userSignin", { message });
  } catch (error) {
    console.log("login user error");
  }
};

//================loading the sign up page==================
const signUpUser = async (req, res) => {
  try {
    let message = req.flash("message");
    res.render("userSignup", { message });
  } catch (error) {
    console.log(error.message);
  }
};

//=====================Login page=============================
const verifyUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
      res.render("userSignin", { message: "user does not exists" });
    } else if (findUser.isBlocked) {
      res.render("userSignin", { message: "Your Account has been Blocked" });
    } else if (findUser) {
      req.session.userData = findUser._id;
      console.log(
        "Successful login and in the session this is :",
        req.session.userData
      );
      res.redirect("/");
    } else {
      //req.flash("error", "Incorrect email or password"); // Flash an error message
      console.log("Error in login user");
      res.render("userSignin", { message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error happens in userController userLogin function:", error);
  }
};

const verifyuser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email: email });
    let userPass = findUser.password;
    console.log("this is the findUser.password", userPass);

    if (findUser.isBlocked) {
      req.flash("message", "User blocked");
      res.redirect("/signin");
    } else if (
      findUser &&
      (await bcrypt.compare(password, findUser.password))
    ) {
      req.session.user = findUser._id;

      console.log(
        `User login successful and session created by user id ====${req.session.user}`
      );
      // req.app.locals.user = req.session.user;
      // console.log('locals.user',req.app.locals.user);
      // console.log('once againin',locals.user);

      res.redirect("/");
    } else {
      //req.flash("error", "Incorrect email or password"); // Flash an error message

      req.flash("message", "Invalid email or password");
      res.redirect("/signin");
    }
  } catch (error) {
    console.log("Error happens in userController verifyUser function:", error);
  }
};

//==to generate otp====================
function generateotp() {
  var digits = "1234567890";
  var otp = "";
  for (let i = 0; i < 4; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

async function otpGenerationAndMailSent(email) {
  const otp = generateotp();
  console.log("--------------------------------------", otp);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.AUTH_MAIL,
      pass: process.env.AUTH_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: process.env.AUTH_MAIL,
    to: email,
    subject: "Verify Your Account",
    text: `your OTP is :${otp}`,
    html: `<b> <h4> Your OTP ${otp}</h4> `,
  });
  return { info, otp };
}

//========otp sending after saving to db=====

let otpGenerationSavedAndMailSent = async (
  req,
  res,
  name,
  email,
  mobile,
  password
) => {
  console.log(
    "reached the mail part for sending otp and password is  :",
    password,
    name,
    email,
    mobile
  );

  const spassword = await securePassword(password);

  const user = new User({
    name: name,
    email: email,
    mobile: mobile,
    password: spassword,
  });

  await user.save();

  console.log("User saved successfully:", user);

  req.session.userData = user;

  const secret = speakeasy.generateSecret({ length: 20 }); // Generate secret for OTP

  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });

  const otpDB = new OTP({
    userId: req.session.userData._id,
    otp: otp,
  });
  console.log("otp generated is :", otp);
  await otpDB.save();

  console.log("OTP saved to database:", otpDB);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.AUTH_MAIL,
      pass: process.env.AUTH_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: process.env.AUTH_MAIL,
    to: email,
    subject: "Verify Your Account",
    text: `your OTP is :${otp}`,
    html: `<b> <h4> Your OTP ${otp}</h4> `,
  });
  if (info) {
    res.render("emailOtp", { email });
    console.log("Message sent: %s", info.messageId);
  }
};

//==================registring part=======================
const createUser = async (req, res) => {
  try {
    // this will be there in the session after all the actions:  req.session.userData = user;
    console.log("user enterd the createUser");
    let { name, email, mobile, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    console.log(
      "existing user is found at the starting of db si :",
      existingUser
    );

    if (existingUser && existingUser.isVerified === true) {
      //create a new user because it checked in database and found no matches
      console.log("user already exists");

      req.flash("message", "User already registered");
      res.redirect("/signup");
    } else if (existingUser && existingUser.isVerified !== true) {
      console.log("user already exists but not verified");

      await User.deleteMany({ email: email });

      otpGenerationSavedAndMailSent(req, res, name, email, mobile, password);
    } else {
      console.log("new user is hrer");
      console.log("password is :", password, mobile, email, name);
      await otpGenerationSavedAndMailSent(
        req,
        res,
        name,
        email,
        mobile,
        password
      );
    }
  } catch (err) {
    console.log("error at create user catch is :  ", err.message);
  }
};

//=============Verify OTP======================
let verifyOTP = async (req, res) => {
  try {
    let otp = req.body.otp;
    console.log("otp type from fetch is :", typeof otp);
    console.log("otp sent by fetch is ", otp);
    if (!otp) {
      res.json({ otp: "noRecord", message: "Field should not be blank" });
    } else if (otp.length !== 6) {
      console.log("otp length in otp.length is ", otp.length);
      res.json({
        otp: "lessNum",
        message: `Please enter all the 6 digits sent to Email`,
      });
    } else {
      let userId = req.session.userData._id;

      let otpFromDatabase = await OTP.findOne({ userId: userId });

      console.log("balue of otpFromDatabase", otpFromDatabase);

      let otpFromdb = otpFromDatabase.otp;

      if (otp !== otpFromdb) {
        res.json({
          otp: "lessNum",
          message: `invalid otp...`,
        });
      } else {
        let userverified = await User.findByIdAndUpdate(
          userId,
          { isVerified: "true" },
          { new: true }
        );
        console.log(
          "user  successfully verified this is there in the session",
          req.session.userData
        );

        if (userverified) {
          res.json({ otp: true });
        }
      }
    }
  } catch (err) {
    console.log(`Here is the error ${err.message}`);
  }
};
//==================RESEND OTP======================================
const resendOTP = async (req, res) => {
  try {
    let { email } = req.body;
    // Delete existing OTP  of user
    await OTP.deleteOne({ userId: req.session.userData._id });
    console.log("exisiting otp deleted just before");

    // Generate new OTP
    const secret = speakeasy.generateSecret({ length: 20 });
    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    // Save new OTP to the database
    const otpDB = new OTP({
      userId: req.session.userData._id,
      otp: otp,
    });
    await otpDB.save();

    console.log("OTP saved to database:", otpDB);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.AUTH_MAIL,
        pass: process.env.AUTH_PASS,
      },
    });
    const info = await transporter.sendMail({
      from: process.env.AUTH_MAIL,
      to: email,
      subject: "Verify Your Account",
      text: `your OTP is :${otp}`,
      html: `<b> <h4> Your OTP ${otp}</h4> `,
    });
    if (info) {
      res.json({ success: true });

      console.log("Message sent: %s", info.messageId);
    }
  } catch (error) {
    console.log("error in resend otp function", error);
  }
};

//=================logout----------------------------
const signout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      // console.log(`Data reached at signout,and this is present in the session after destroy- ${req.session}`);
      if (err) throw err;
      res.redirect("/");
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("Internal Server Error");
  }
};

//=============shop list page======================
let shopPage = async (req, res) => {
  try {
    let user = req.session.userData;
    let userNameforProfile = await User.findById(user);
    const category = await Category.find({ status: "active" });
    let categoryName = "All"; // Default category name

    if (req.query.category) {
      const selectedCategory = await Category.findOne({
        _id: req.query.category,
      });
      if (selectedCategory) {
        categoryName = selectedCategory.name;
      }
    }

    let product = [];

    if (req.query.category) {
      // console.log("reached shopPage whre a particular category was selected");
      // Filter products based on the selected category
      product = await Product.find({
        status: "active",
        category: req.query.category,
      })
        .populate({
          path: "category",
          model: "Category",
        })
        .exec();
    } else {
      // Fetch all products if no category is selected
      // console.log("reached shopPage where no specific category is selcted");
      product = await Product.find({ status: "active" })
        .populate({
          path: "category",
          model: "Category",
        })
        .exec();
    }
// console.log('to check whether user is passed to the shop page',user);
    res.render("shopPage", {
      product,
      user,
      category,
      userNameforProfile,
      selectedCategoryId: req.query.category || "",
      categoryName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("/error");
  }
};

//============== a product page selected====================


const aProductPage = async (req, res) => {
  try {
    let user = req.session.userData;
    let userNameforProfile = await User.findById(user);


      let queriedProduct = req.query.id;

      const aProductFoundFromDb = await Product.findById(queriedProduct).populate("category").exec();

      let relatedProductCat = aProductFoundFromDb.category;

      let category = await Category.find({ status: "active" });

      let product = await Product.find({ status: "active" }).populate("category").exec();
      
      let relatedProd = product.filter(product => product.category._id.toString() === relatedProductCat._id.toString());

      res.render("aProductPage", {
          user,
          userNameforProfile,
          product,
          category,
          relatedProd,
          aProductFoundFromDb,
      });
  } catch (error) {
      console.error("Error during aProductPage:", error);
      res.redirect("/error");
  }
};

// const aProductPage = async (req, res) => {
//   try {
//     let user = req.session.userData;
//     let queriedProduct = req.query.id;
//     let relatedProd = [];
   
//     const aProductFoundFromDb = await Product.findById(queriedProduct)
//       .populate({
//         path: "category",
//         model: "Category",
//       })
//       .exec();
//     let relatedProductCat = aProductFoundFromDb.category;

//     let category = await Category.find({ status: "active" });

//     let product = [];
//     const pro = await Product.find({ status: "active" })
//       .populate({
//         path: "category",
//         model: "Category",
//       })
//       .exec();

   

//     pro.forEach((e) => {
//       if (e.category.status == "active") {
//         product.push(e);
//       }
//     });

//     for (let i = 0; i < product.length; i++) {
//       if (
//         product[i].category._id.toString() === relatedProductCat._id.toString()
//       ) {
//         relatedProd.push(product[i]);
        
//       }
//     }

//     res.render("aProductPage", {
//       user,
//       category,
//       product,
//       relatedProd,
//       aProductFoundFromDb,
//     });
//   } catch (error) {
//     console.error("Error during aProductPage:", error);
//     res.redirect("/error");
//   }
// };




//============== wish list page ===================
const wishList = async (req, res) => {
  try {
    let user = req.session.userData;
    let userNameforProfile = await User.findById(user);

    let category = await Category.find({ status: "active" });
      let wishlist = await Wishlist.findOne({user:user})
      // let product = await Product.find({ status: "active" }).populate("category").exec();

// console.log('wishlist at wishlist controller: ',wishlist);
   res.render('wishlist',{userNameforProfile,user,category,wishlist})
  } catch (error) {
    console.error("Error during wishlist:", error);
    res.redirect("/error");
  }
};



//==========add to wishlist list page====================


//add products to wishlist
const addProductToWishList = async (req, res) => {
  try {
    let user = req.session.userData;
    // let userNameforProfile = await User.findById(user);

    const product = await Product.findById(req.query.productId);

    // Check if the user already has a wishlist document
    const wishFind = await Wishlist.findOne({ user: user });

    // console.log('this is wiishFind at wish controller', wishFind);

    if (wishFind) {
      // User already has a wishlist document
      const existingProduct = wishFind.products.find(
        (prod) => prod.name === product.name
      );

      if (existingProduct) {
        res.json({ success: false, message: 'Already added' });
      } else {
        // Product is not in the wishlist, add it
        wishFind.products.push({
          product: product._id,
          price: product.price,
          name: product.name,
          image:product.images,
          quantity: product.quantity,
        });

        await wishFind.save();
        res.json({ success: true, message: 'Added' });
      }
    } else {
      // User does not have a wishlist document, create a new one
      const wishAdd = new Wishlist({
        user: user,
        products: [
          {
            product: product._id,
            price: product.price,
            name: product.name,
            image:product.images,
            quantity: product.quantity,
          }
        ]
      });

      await wishAdd.save();
      res.json({ success: true, message: 'Added' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//==========remove a product from wishlist======================

const productremovefromwish = async (req, res) => {
  try {
     const product = await Product.findById(req.query.productId);
     console.log('this is the wishfound from remove wish:', product);
 
     const currentUser = await User.findById(req.query.userId);
 
     // Ensure productId is included in the request query parameters
     if (!req.query.productId) {
       return res.status(400).json({ success: false, message: 'Product ID is required.' });
     }
 
     // Correctly use the productId in the $pull operation
     await Wishlist.updateOne(
       { user: currentUser._id },
       { $pull: { 'products': { 'product': product.id } } }
     );
 
     res.json({ success: true });
  } catch (error) {
     console.error('Error removing product from wishlist:', error);
     res.json({ success: false });
  }
 };
 










module.exports = {
  loadIndex,
  verifyUser,
  signinUser,
  signUpUser,
  errorPage,
  createUser,
  verifyOTP,
  resendOTP,
  signout,
  shopPage,
  aProductPage,
  wishList,
  addProductToWishList,
  productremovefromwish,
};





