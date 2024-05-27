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
let Cart = require("../model/cartModel");

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
  console.log('error at securePassword creation: ',error);
  res.status(500).redirect('/error')
  }
}


//-----  ------- --- -load index--  ---  -----  ------   ---------
const loadIndex = async (req, res) => {
  try {
   
    const currentDate = new Date();

 // Access common data attached by the middleware
 const { userNameforProfile, cart, categoriesWithProducts, totalPriceOfCartProducts,userId } = res.locals.commonData;

 console.log('at loadIndex controller res.locals------------------------------------------- :',res.locals)

let [upcomingProducts,banner,category,productData] = await Promise.all([

  Product.find({ date : { $gt : currentDate }}),
  Banner.find({
    status:{$ne : false}
  }),
  Category.find({status: { $ne: "blocked" }}),
  Product.find({
    status: { $ne: "blocked" },
    quantity: { $ne: 0 },
  })
  .populate({
    path: 'category',
    populate: {
      path: 'offer',
      match: {
        startingDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      },
    },
  })
  .populate({
    path: 'offer',
    match: {
      startingDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    },
  }).limit(7)
])


    const product = productData.filter((product) => product.category.status !== "blocked");
    res.render("home", { categoriesWithProducts,cart, userNameforProfile, user:userId, banner, product, upcomingProducts, category,totalPriceOfCartProducts });
  } catch (error) {
    console.log("Error happens in userController loadIndex function:", error);
    res.status(500).redirect('/error');
  }
};

//========================= Login user page rendering================
const signinUser = async (req, res) => {
  try {
    let message = req.flash("message");
    console.log('message passed at signin page when session is out:',message)
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
    console.log('reached at verifylogin controller ')
    let {email,password} = req.body;
    const userData = await User.findOne({ email: email });

// console.log('this is the user data',userData);
    if (userData) {
      
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {

        if (userData.isBlocked === false && userData.isVerified == true) {

          if ( req.session.userData !== null ||req.session.userData !== undefined) {


            console.log('at session when user is unblocked ',req.session.userData)
            req.session.userData = userData._id;

console.log('finally at session :',req.session.userData)

            return res.redirect('/');


          } else {
            console.error(`in the session it is ${req.session.userData}`);
            req.flash('er', ' Please login to continue')
            res.redirect('/signin')
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

  console.log("User saved successfully at datavbase as :", user);

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


//---------------- verfiy email for forgot password --------------
let verifyEmail = async(req,res)=>{
  let email = req.query.email;
  try{console.log('req.query.email:',email)
    let userFound = await User.findOne({email:email});
    console.log('email of the user is :',userFound);

    if(!userFound){
      return res.status(400).json(false,{message:"User not registered"})
    }
    


    const secret = speakeasy.generateSecret({ length: 20 }); // Generate secret for OTP

    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });
  
    const otpDB = new OTP({
      userId: userFound.id,
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

  }catch(err){
    console.log('error at verify email :',err)
    res.redirect('/error')
  }
}




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
    res.status(500).redirect('/error')
  }
};



//============== single product view  ====================

const aProductPage = async (req, res) => {
  try {
   
    const { userNameforProfile, cart, categoriesWithProducts, totalPriceOfCartProducts,userId } = res.locals.commonData;
   
    const currentDate = new Date();
    let queriedProductId = req.query.id;
  
    let [aProductFoundFromDb,product] = await Promise.all([
      Product.findById(queriedProductId).populate({
        path: 'category',
        populate: {
          path: 'offer',
          match: {
            startingDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
          },
        },
      })
      .populate({
        path: 'offer',
        match: {
          startingDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
        },
      }),

      Product.find({ status: "active" }).populate({
        path: 'category',
        populate: {
          path: 'offer',
          match: {
            startingDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
          },
        },
      })
      .populate({
        path: 'offer',
        match: {
          startingDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
        },
      })
    ])
   
    let relatedProductCatId = aProductFoundFromDb.category.id;
let relatedProds = product.filter(prod=>prod.category._id.toString() === relatedProductCatId)

    res.render("aProductPage", {
      user:userId,
      cart,
      totalPriceOfCartProducts,
      userNameforProfile,
      categoriesWithProducts,
      product,
      relatedProds,
      aProductFoundFromDb,
    });
  } catch (error) {
    console.error("Error during aProductPage rendering:", error);
    res.status(500).redirect("/error");
  }
};






//=============loading the user profile page =====================
const loadUserProfile = async (req, res) => {
  try {

//It is found that the orders is actually an array of that users all orders, because the Array.isArray(orders) returned true 

 // Access common data attached by the middleware
 const { userNameforProfile, cart, categoriesWithProducts, totalPriceOfCartProducts,userId } = res.locals.commonData;


    

    if (!us-erId) {
      res.redirect("/")
    }

    let category = await Category.find({ status: "active" });
 
    // console.log('this is the full user details of this user :',userNameforProfile);

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
  


    res.render("userProfile", { cart,totalPriceOfCartProducts,moment,categoriesWithProducts,userNameforProfile ,userId, orders,category,states,orders });
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




//------------------- function to calculate offer price-----------------
const updatedProductsDiscount = async (products) => {
  try {
    // Fetch all product offers and category offers concurrently
    const productOffers = await Promise.all(products.map(async (product) => {
      if (product.offer) {
        console.log(`Product ${product.offer.name} with ${product.offer.discount}% off`);
        return product.offer;
      }
      return null;
    }));

    const categoryOffers = await Promise.all(products.map(async (product) => {
      if (product.category && product.category.offer) {
        console.log(`Category ${product.category.offer.name} with ${product.category.offer.discount}% off`);
        return product.category.offer;
      }
      return null;
    }));

    return await Promise.all(products.map(async (product, index) => {
      const productOffer = productOffers[index];
      const categoryOffer = categoryOffers[index];

      // Choose the appropriate offer for the product
      const chosenOffer = chooseOffer(productOffer, categoryOffer);

      if (chosenOffer) {
        const discount = chosenOffer.discount ? Math.round(product.price * (chosenOffer.discount / 100)) : 0;
        console.log(`Discount is ${discount}`);

        product.offerprice = product.price - discount;
        console.log(`offerPrice applied is ${product.offerprice}`);
        await product.save();
      } else {
        // No offer available, use original price
        product.offerprice = product.price;
        console.log(`no offer price so price is applied ${product.offerprice}`);
      }
      return product;
    }));
  } catch (error) {
    console.error("Error updating products:", error);
    throw error;
  }
};

// Helper function to choose the appropriate offer for a product
const chooseOffer = (productOffer, categoryOffer) => {
  if (productOffer && categoryOffer) {
    // Compare discounts and choose the offer with the highest discount
    return productOffer.discount > categoryOffer.discount ? productOffer : categoryOffer;
  } else if (productOffer) {
    return productOffer;
  } else {
    return categoryOffer;
  }
};

//-------------- shop page  =========================================

const ITEMS_PER_PAGE = 8; 

const getPaginationParams = (totalItems, currentPage) => {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  return { totalPages, hasNextPage, hasPrevPage };
};

const applyPagination = (query, page) => {
console.log('debugging part ----------------------------------------%%$$$$$$----------------------------------')

console.log('this is the value of the page at apply page nation : ',page);


  const skip = (page - 1) * ITEMS_PER_PAGE;

console.log('this is the skip value : ',skip)

  // return query.skip(skip).limit(ITEMS_PER_PAGE);
  return query.slice(skip,skip+ITEMS_PER_PAGE)
};




let shopPage = async (req, res) => {
  try {
   
    const { userNameforProfile, cart, categoriesWithProducts, totalPriceOfCartProducts,userId } = res.locals.commonData;

   console.log('at shopPage controller res.locals------------------------------------- :',res.locals)
   
    let category = await Category.find({ status :{ $ne : "blocked" } })

//----------   ------- [banner part] -----   ----------
    const banners = await Banner.find(); 
let arr =[];
banners.forEach(x=>{
  arr.push( x.image[0])
})
// console.log('banners found  is :',arr)
//-------------------- [banner part] ------------------


// out of stock and blocked products wont be displayed right now
    let filters = { status: { $ne: 'blocked' }, quantity: { $gt: 0 } };

  
    if (req.query.category) {
      console.log(`category queried is ${req.query.category} and type is ${typeof req.query.category}`)
      
      filters.category = req.query.category;
    }

    
    if (req.query.search) {
      filters.name = { $regex: req.query.search, $options: 'i' };
    }

    
    let productQuery = await Product.find(filters)
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
// console.log('product query count is :',productQuery)
      
    
    if (req.query.price) {
      const priceRange = req.query.price;
      if (priceRange === 'low-to-high') {
        productQuery = productQuery.sort({ price: 1 }); 
      } else if (priceRange === 'high-to-low') {
        productQuery = productQuery.sort({ price: -1 }); 
      }
    }

    // Apply sort filter if present in query
if (req.query.sort) {
  const sortOption = req.query.sort;
  if (sortOption === 'nameAsc') {

console.log('a-z sorting worked and the value is ----------------------------------------',sortOption)

    productQuery = productQuery.sort({ name: 1 }); 
  } else if (sortOption === 'nameDesc') {

console.log('z-a sorting worked and the value is =======================================',sortOption)

    productQuery = productQuery.sort({ name: -1 }); 
  } else if (sortOption === 'date') {
    console.log('latest product sort option worked----------------------------- :',sortOption)
    productQuery = productQuery.sort({ createdAt: -1 });
  }
}


    const totalProducts = await Product.countDocuments(filters);
    console.log('total products :',totalProducts)
    const currentPage = +req.query.page || 1;
    console.log('currentPage is :',currentPage)
    const { totalPages, hasNextPage, hasPrevPage } = getPaginationParams(totalProducts, currentPage);
    console.log('totalPages are :',totalPages)
    console.log('hasNextPage :',hasNextPage)
    console.log('hasPrevPage :',hasPrevPage)

    const product = await applyPagination(productQuery, currentPage);



    // console.log('products data at new shop page :', product);

    let updatedProducts = await updatedProductsDiscount(product);

  

    // console.log('the products that are going to be rendered is :',updatedProducts)

    res.render('shopPage', {
      userNameforProfile,
      cart,
      categoriesWithProducts,
      totalPriceOfCartProducts,
      category,
      user:userId,
      banners: arr[2],
      product: updatedProducts,
      pagination: {
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      query: req.query 
    });
  } catch (error) {
    console.error('Error fetching products at shop page:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};



//------------------ search query ----------------







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
  verifyEmail,
  shopPage,
  aProductPage,
  loadUserProfile,
  editProfile,
  changePassword,
  addAddressatProfile,
  editAddress,
  removeAddress,
  
};



