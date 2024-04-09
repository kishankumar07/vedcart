let User = require("../model/userModel");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const OTP = require("../model/otpModel");

let Category = require("../model/categoryModel");
let Product = require("../model/productModel");
let Wishlist = require("../model/wishListModel");
const Orders = require("../model/orderModel");

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

    let product = [];
    const pro = await Product.find({
      status: { $ne: "blocked" },
      quantity: { $ne: 0 }
      })
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

    res.render("home", { userNameforProfile, user, category, product });
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
    res.redirect("/error")
    return res.status(500).send('Internal Server Error');
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

//=============shop list page======================
let shopPage = async (req, res) => {
  try {
    const user = req.session.userData;
    const userNameforProfile = await User.findById(user);
    const category = await Category.find({ status: "active" });
    let categoryName = "All"; // Default category name
    let selectedCategoryId = req.query.category || "";

    let filters = { status: "active", quantity: { $gt: 0 } }; // Add condition for quantity greater than 0

    if (selectedCategoryId && selectedCategoryId !== "all") {
      // Only apply category filter if a valid category is selected
      const selectedCategory = await Category.findById(selectedCategoryId);
      if (selectedCategory) {
        categoryName = selectedCategory.name;
        filters.category = selectedCategoryId;
      } else {
        // If the selected category is invalid, reset it to "all"
        selectedCategoryId = "all";
      }
    }

    let product = await Product.find(filters)
      .populate({
        path: "category",
        model: "Category",
      })
      .exec();

    // Apply price sorting based on the selected filter
    const selectedFilter = req.query.filter || "lowToHigh";
    if (selectedFilter === "lowToHigh") {
      product.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (selectedFilter === "highToLow") {
      product.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    res.render("shopPage", {
      product,
      user,
      category,
      userNameforProfile,
      selectedCategoryId,
      categoryName,
      selectedFilter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error");
  }
};


//============== a product page selected====================

const aProductPage = async (req, res) => {
  try {
    let user = req.session.userData;
    let userNameforProfile = await User.findById(user);

    let queriedProduct = req.query.id;

    const aProductFoundFromDb = await Product.findById(queriedProduct)
      .populate("category")
      .exec();

    let relatedProductCat = aProductFoundFromDb.category;

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
    const userId = req.session.userData;

    if (!userId) {
      res.redirect("/")
    }

    let category = await Category.find({ status: "active" });
    const userNameforProfile  = await User.findById(userId);

    

    const orders = await Orders.find({ userId: userId })
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
  


    res.render("userProfile", { userNameforProfile , orders,category,states,orders });
  } catch (error) {
   res.redirect("/500")
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
  console.log('resaddsafdfasdfdfdfdsfdfdfdfdfdf');
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
        console.log(' current password was matched from db');
        return res.json({ message: 'Current password is incorrect' });
      }
    }

    if (newPassword !== confirmNewPassword) {
      console.log('new password and conf password is not correct');
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
  shopPage,
  aProductPage,
  wishList,
  addProductToWishList,
  productremovefromwish,
  loadUserProfile,
  editProfile,
  changePassword,
  addAddressatProfile,
  editAddress,
  removeAddress
};


