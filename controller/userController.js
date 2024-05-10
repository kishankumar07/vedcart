let User = require("../model/userModel");
const bcrypt = require("bcrypt");
let fs = require('fs')
let path = require('path');
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const OTP = require("../model/otpModel");
let moment = require("moment");
let Category = require("../model/categoryModel");
let Product = require("../model/productModel");
let Wishlist = require("../model/wishListModel");
const Orders = require("../model/orderModel");
let Banner = require('../model/bannerModel');

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
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
   res.redirect("/500")
  }
}


//load index-----------------------------------------------
const loadIndex = async (req, res) => {
  try {
    let user = req.session.userData;
    // console.log('this is present in the user: ',user);
   
    let userNameforProfile = await User.findById(user);

    let category = await Category.find({ status: "active" });

let banner = await Banner.find();

    console.log('banner found at load index :',banner);
    
    const productData = await Product.find({
      status: { $ne: "blocked" },
      quantity: { $ne: 0 }
  }) .populate({
    path: 'category',
    populate: {
      path: 'offer',
      match: {
        startingDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }
    }
  })
  .populate({
    path: 'offer',
    match: {
      startingDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }
  }).limit(7)


  //with this condition the unlisted categories product wont be displayed
  const product = productData.filter((product) => product.category.status !== "blocked")


  //planning a field for upcoming products
let upcomingProducts = await Product.find({date:{$gt:new Date()}
})


    
    res.render("home", { userNameforProfile, user,banner, category, product,upcomingProducts });
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



const verifyLogin = async (req, res) => {
  try {
    let {email,password} = req.body;
    const userData = await User.findOne({ email: email });

// console.log('this is the user data',userData);

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.isBlocked === false && userData.isVerified == true) {

          if (req.session) {
            req.session.userData = userData._id;


console.log('user successfully logged at verify user : sessin :',req.session.userData);

            return res.redirect('/');


          } else {
            console.error('req.session is undefined');
            return res.status(500).send('Internal Server Error');
          }
        } else {
          req.flash('er', ' Account blocked by the administrator or user not verified')
          // User not found
          return res.render('userSignin', { message: req.flash('er') });
        }
      } else {
        req.flash('er', 'Incorrect username and password')
        // User not found
        return res.render('userSignin', { message: req.flash('er') });
      }
    } else {
      req.flash('er', 'No user found')
      // User not found
      return res.render('userSignin', { message: req.flash('er') });
    }
  } catch (error) {
    console.log('error at verify login ,:',error)
    res.redirect("/error")
    
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

// async function otpGenerationAndMailSent(email) {
//   const otp = generateotp();
//   console.log("--------------------------------------", otp);
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     port: 587,
//     secure: false,
//     requireTLS: true,
//     auth: {
//       user: process.env.AUTH_MAIL,
//       pass: process.env.AUTH_PASS,
//     },
//   });
//   const info = await transporter.sendMail({
//     from: process.env.AUTH_MAIL,
//     to: email,
//     subject: "Verify Your Account",
//     text: `your OTP is :${otp}`,
//     html: `<b> <h4> Your OTP ${otp}</h4> `,
//   });
//   return { info, otp };
// }

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
    let { name, email, mobile, password } = req.body;
  
    // Case-insensitive email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

    // Check if the email matches the regex pattern
    if (!emailRegex.test(email)) {
      req.flash("message", "Invalid email address");
      return res.redirect("/signup");
    }

    const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    console.log(
      "existing user is found at the starting of db si :",
      existingUser
    );

    if (existingUser && existingUser.isVerified === true) {
      //create a new user because it checked in database and found no matches
      console.log("user already exists,if condition at createUser");

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

    // console.log("otp type from fetch is :", typeof otp);
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
        //if user entered otp is different from the otp present in the database.
        res.json({
          otp: "invalidOtp",
          message: `invalid otp...`,
        });
      } else {
        //case where user enterd data is correct and going to save data into the database that user is verified

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
          res.json({ otp: true, linkGoogle: true }); // Adding linkGoogle flag
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




// Calculate discounts for products kept as a seperate function=====
const updatedProductsDiscount = async (products) => {
  try {


    return await Promise.all(products.map(async (product) => {
      if (product.offer) {

        let discount = Math.round(product.price * (product.offer.discount / 100));
        
        product.offerprice = product.price - discount;
       
        
      }
       else if (product.category && product.category.offer) {
        let discount = Math.round(product.price * (product.category.offer.discount / 100));
        product.offerprice = product.price - discount;
        
      } 
      else {
        product.offerprice = undefined;
        
      }
      await product.save();
      return product;
    }));
  } catch (error) {
    console.error("Error updating products:", error);
    throw error;
  }
};




//=============shop list page======================
let shopPages = async (req, res) => {
  try {
    const user = req.session.userData;
    const userNameforProfile = await User.findById(user);


    //all the categories that exist without being blocked will be shown at the shop page
    const category = await Category.find({ status: {$ne:'blocked'} });


//By default the category filter is set to 'all' and when the  page loads no category based filtration would be there
    let categoryName = "All"; 
    let selectedCategoryId = req.query.category || "";

    //Default sorting is for price category 'Low to high'
    let selectedFilter = req.query.filter || "lowToHigh"; 

//The products displayed would be based on this filter
    let filters = { status: { $ne: "blocked" }, quantity: { $gt: 0 } }; 




    if (selectedCategoryId && selectedCategoryId !== "all") {


      // Only apply category filter if a valid category is selected

      const selectedCategory = await Category.findById(selectedCategoryId);

      if (selectedCategory) {

        console.log( `${selectedCategory.name} i.e was selected at if case`)

        categoryName = selectedCategory.name;
        filters.category = selectedCategoryId;
      } else {
        console.log( `all was selected at else case`)

        // If the selected category is invalid, reset it to "all"
        selectedCategoryId = "all";
      }
    }

    console.log('these are the filters :',filters)
    //only existing offers will be displayed here , upcoming and expired offers are not displayed
    let product = await Product.find(filters)
    .populate({
      path: 'category',
      populate: {
        path: 'offer',
        match: {
          startingDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }
      }
    })
    .populate({
      path: 'offer',
      match: {
        startingDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }
    })


    

    // Apply price sorting based on the selected filter
   
let productSortFunction;
if (selectedFilter === "lowToHigh") {
  productSortFunction = (a, b) => parseFloat(a.price) - parseFloat(b.price);
} else if (selectedFilter === "highToLow") {
  productSortFunction = (a, b) => parseFloat(b.price) - parseFloat(a.price);
} else if (selectedFilter === "AtoZ") {
  productSortFunction = (a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  };
  
} else if (selectedFilter === "ZtoA") {
  productSortFunction = (a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA > nameB) {
      return -1;
    }
    if (nameA < nameB) {
      return 1;
    }
    return 0;
  };
  
} else if (selectedFilter === "newlyLaunched") {
  productSortFunction = (a, b) => b.createdAt - a.createdAt;
}

// Sort the product array using the selected sorting function
if (productSortFunction) {
  product.sort(productSortFunction);
}


// ======  pagenation part===========
const productsPerPage = 8; 

let currentPage = parseInt(req.query.page) || 1;
const totalProducts = await Product.countDocuments(filters);
const totalPages = Math.ceil(totalProducts / productsPerPage);

// Ensure currentPage is within valid range
currentPage = Math.max(1, Math.min(currentPage, totalPages));



     // Call updatedProductsDiscount function and await its result
     let updatedProducts = await updatedProductsDiscount(product);


    res.render("shopPage", {
      product: updatedProducts,
      user,
      category,
      currentPage,
      productsPerPage,
      totalPages,
      userNameforProfile,
      selectedCategoryId,
      categoryName,
      selectedFilter,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/error')
  }
};


//============== a product page selected====================

const aProductPage = async (req, res) => {
  try {
    let user = req.session.userData;
    let userNameforProfile = await User.findById(user);

    let queriedProduct = req.query.id;

    console.log(`this is the queried product ${queriedProduct}`)

    const aProductFoundFromDb = await Product.findById(queriedProduct)
      .populate("category")
      .exec();

console.log(`this is the full details of the queried product ${aProductFoundFromDb}`)


    let relatedProductCat = aProductFoundFromDb.category;

console.log( `this is the relatedProductCat : ${relatedProductCat}`)

    let category = await Category.find({ status: "active" });




    let product = await Product.find({ status: "active" })
      .populate("category")
      .exec();

    let relatedProd = product.filter(
      (product) =>
        product.category._id.toString() === relatedProductCat._id.toString()
    );

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
    let wishlist = await Wishlist.findOne({ user: user });
    // let product = await Product.find({ status: "active" }).populate("category").exec();

    // console.log('wishlist at wishlist controller: ',wishlist);
    res.render("wishlist", { userNameforProfile, user, category, wishlist });
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
        res.json({ success: false, message: "Already added" });
      } else {
        // Product is not in the wishlist, add it
        wishFind.products.push({
          product: product._id,
          price: product.price,
          name: product.name,
          image: product.images,
          quantity: product.quantity,
        });

        await wishFind.save();
        res.json({ success: true, message: "Added" });
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
            image: product.images,
            quantity: product.quantity,
          },
        ],
      });

      await wishAdd.save();
      res.json({ success: true, message: "Added" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//==========remove a product from wishlist======================

const productremovefromwish = async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);
    console.log("this is the wishfound from remove wish:", product);

    const currentUser = await User.findById(req.query.userId);

    // Ensure productId is included in the request query parameters
    if (!req.query.productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required." });
    }

    // Correctly use the productId in the $pull operation
    await Wishlist.updateOne(
      { user: currentUser._id },
      { $pull: { products: { product: product.id } } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    res.json({ success: false });
  }
};





//=============loading the user profile page =====================
const loadUserProfile = async (req, res) => {
  try {

//It is found that the orders is actually an array of that users all orders, because the Array.isArray(orders) returned true 



    const userId = req.session.userData;

    if (!userId) {
      res.redirect("/")
    }

    let category = await Category.find({ status: "active" });
    const userNameforProfile  = await User.findById(userId);

    console.log('this is the full user details of this user :',userNameforProfile);

   // Query orders sorted by createdAt field in descending order
   const orders = await Orders.find({ userId: userId })
   .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
  

    // console.log(`total ${orders.length} order made by ${userNameforProfile.name} and these are the orders : ${orders}`)

  


    // console.log(`want to know the type of the orders :${typeof orders} and to whether it is an array :::${Array.isArray(orders)}`)

    const deletePending = await Orders.deleteMany({paymentStatus:"pending"})

      .populate({
        path: "Products.productId",
        model: "Products",
      })
      .exec();


      let states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
      ];
  


    res.render("userProfile", { moment,userNameforProfile , orders,category,states,orders });
  } catch (error) {
    console.log('error at loading userProfilePage',error)
   res.redirect("/error")
  }
};



//================== Edit profile========================================

const editProfile = async (req, res) => {
  try {
    const userId = req.session.userData
    const user = await User.findById(userId)

    if (!user) {
      return res.redirect('/')
    }

    user.name = req.body.name
    user.mobile = req.body.mobile

    await user.save()

    return res.redirect('/userProfile')
  } catch (error) {
   res.redirect("/error")
    console.log('error at edit profile of user',error);
  }
}




//Change password

const changePassword = async (req, res) => {
  console.log('change password controller at userProfile reached');
  const userId = req.session.userData;
  const currentPassword = req.body.currentPassword
  const newPassword = req.body.newPassword
  const confirmNewPassword = req.body.confirmNewPassword

  try {


    const user = await User.findById(userId)


    if (!user) {
      console.log('user was not found');
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentPassword) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password)
      if (!passwordMatch) {
      
        return res.json({ message: 'Current password is incorrect' });
      }
    }

    if (newPassword !== confirmNewPassword) {
     
      return res.json({ message: 'New password and confirm password do not match' });
    }


    // Update the user's password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;

    await user.save()
    // console.log('this is saved at database: ',user);

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
   res.redirect("/error")
    return res.status(500).json({ error: 'Internal server error' })
  }
}




//============Add address in checkoutPage===========================
const addAddressatProfile = async (req, res) => {
  try {
    console.log('rreadfsdaffdfddfdffdfd');
      const userId = req.session.userData;

      // console.log('this is the user id at add addres ::',userId);

      const { name, mobile, pincode, addressDetails, city, state } = req.body;


      const user = await User.findById(userId);



// console.log('this is the user value at addAddress :',user);


      if (!user) {
          return res.status(404).send('User not found');
      }

      user.addressField.push({
          name,
          mobile,
          pincode,
          addressDetails,
          city,
          state
      });

      const updatedUser = await user.save();
      // console.log('this is the value stored at addAddress : ',updatedUser);
      res.redirect("/userProfile");
  } catch (error) {
    console.log('error at the profile page address addition',error)
     res.redirect("/error")
      
  }
};


// Edit Address========================

const editAddress = async (req, res) => {
  try {
    const userId = req.session.userData;
    const { name, mobile, pincode, address, city, state } = req.body;



    console.log('req.body',req.body);


    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'addressField._id': req.params.id },
      {
        $set: {
          'addressField.$.name': name,
          'addressField.$.mobile': mobile,
          'addressField.$.pincode': pincode,
          'addressField.$.address': address,
          'addressField.$.city': city,
          'addressField.$.state': state,
        },
      },
      { new: true }
    );

    console.log('thsi is hte upated user;',updatedUser);
    if (updatedUser) {
      console.log('Address updated successfully');
      res.status(200).json({ success: true, message: 'Address updated successfully' });
    } else {
      console.log('User or address not found');
      res.status(404).json({ success: false, message: 'User or address not found' });
    }
  } catch (error) {
    res.redirect("/500")
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};



//Remove address==================================

const removeAddress = async (req, res) => {
  try {
    const userId = req.session.userData;
    const addressId = req.params.id;
    const user = await User.findById(userId);

    user.addressField.pull({ _id: addressId });
    await user.save();


    res.status(200).json({ message: 'Address removed successfully' });
  } catch (error) {
    res.redirect("/500")

    res.status(500).json({ error: 'Internal Server Error' });
  }
};




//-------------- shop page  =========================================

const ITEMS_PER_PAGE = 8; // Number of items per page

const getPaginationParams = (totalItems, currentPage) => {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  return { totalPages, hasNextPage, hasPrevPage };
};

const applyPagination = (query, page) => {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  return query.skip(skip).limit(ITEMS_PER_PAGE);
};

let shopPage = async (req, res) => {
  try {
    const user = req.session.userData;
    const userNameforProfile = await User.findById(user);
    const category = await Category.find({ status: { $ne: 'blocked' } });

//----------   ------- [banner part] -----   ----------
    const banners = await Banner.find(); // Fetch active banners
let arr =[];
banners.forEach(x=>{
  arr.push( x.image[0])
})
console.log('banners found  is :',arr)
//-------------------- [banner part] ------------------


// out of stock products wont be displayed right now
    let filters = { status: { $ne: 'blocked' }, quantity: { $gt: 0 } };

    // Apply category filter if present in query
    if (req.query.category) {
      filters.category = req.query.category;
    }

    // Apply search query if present in query
    if (req.query.search) {
      filters.name = { $regex: req.query.search, $options: 'i' }; // Case-insensitive search by product name
    }

    // Declare and initialize productQuery
    let productQuery = Product.find(filters)
      .populate({
        path: 'category',
        populate: {
          path: 'offer',
          match: {
            startingDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
          }
        }
      })
      .populate({
        path: 'offer',
        match: {
          startingDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }
      });

      
    // Apply price range filter if present in query
    if (req.query.price) {
      const priceRange = req.query.price;
      if (priceRange === 'low-to-high') {
        productQuery = productQuery.sort({ price: 1 }); // Sort in ascending order by price
      } else if (priceRange === 'high-to-low') {
        productQuery = productQuery.sort({ price: -1 }); // Sort in descending order by price
      }
    }

    // Apply sort filter if present in query
if (req.query.sort) {
  const sortOption = req.query.sort;
  if (sortOption === 'nameAsc') {

console.log('a-z sorting worked----------------------------------------')

    productQuery = productQuery.sort({ name: 1 }); // Sort in ascending order by name
  } else if (sortOption === 'nameDesc') {

console.log('z-a sorting worked=======================================')

    productQuery = productQuery.sort({ name: -1 }); // Sort in descending order by name
  } else if (sortOption === 'date') {
    productQuery = productQuery.sort({ createdAt: -1 }); // Sort in descending order by creation date
  }
}


    const totalProducts = await Product.countDocuments(filters);
    const currentPage = +req.query.page || 1;
    const { totalPages, hasNextPage, hasPrevPage } = getPaginationParams(totalProducts, currentPage);

    const product = await applyPagination(productQuery, currentPage).exec();

    // console.log('products data at new shop page :', product);

    let updatedProducts = await updatedProductsDiscount(product);

    res.render('shopPage', {
      userNameforProfile,
      category,
      user,
      banners: arr[0],
      product: updatedProducts,
      pagination: {
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      query: req.query // Pass the query parameters to the template
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};





module.exports = {
  loadIndex,
  verifyLogin,
  signinUser,
  signUpUser,
  errorPage,
  createUser,
  verifyOTP,
  resendOTP,
  signout,
  shopPages,
  aProductPage,
  wishList,
  addProductToWishList,
  productremovefromwish,
  loadUserProfile,
  editProfile,
  changePassword,
  addAddressatProfile,
  editAddress,
  removeAddress,
  shopPage
};



