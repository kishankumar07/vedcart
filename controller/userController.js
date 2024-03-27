let User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const speakeasy = require('speakeasy');
const OTP = require('../model/otpModel')
let Category = require("../model/categoryModel");
let Product = require("../model/productModel");

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
  console.log('password received here at securePassword',password);
  const saltRounds = 10; // Number of salt rounds
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};




//load index-----------------------------------------------
const loadIndex = async (req, res) => {
  try {
 
    let category = await Category.find({'status':'active'});
    
    let product=[]
    const pro = await Product.find({ 'status': 'active'})
    .populate({
      path: 'category',
      model: 'Category',
     
    })
    .exec();

    // console.log('this comes in pro after  loading the home page :',pro)

    pro.forEach((e)=>{
      if(e.category.status=='active')
      {
        product.push(e)
      }
    })



     let user =req.session.userData;
    // console.log('user data at loadIndex',user);

    res.render("home",{user,category,product});
  } catch (error) {
    console.log("Error happens in userController loadIndex function:", error);
  }
};

//========================= Login user page rendering================
const signinUser = async (req, res) => {
  try {
    let message  = req.flash('message');
    res.render("userSignin", { message });
  } catch (error) {
    console.log("login user error");
  }
};



//================loading the sign up page==================
const signUpUser = async (req, res) => {
  try {
    let message = req.flash('message');
    res.render("userSignup",{message});
  } catch (error) {
    console.log(error.message);
  }
};




//=====================Login page=============================
const verifyUser = async (req, res) => {
  try {
      const { email, password} = req.body;
      const findUser = await User.findOne({ email });
     if(!findUser){
      res.render("userSignin",{message:'user does not exists'})
     }
      else if(findUser.isBlocked){
          res.render("userSignin",{message:'Your Account has been Blocked'})
      }
      else if (findUser ) {
          req.session.userData = findUser._id;
          console.log('Successful login and in the session this is :',req.session.userData);
          res.redirect("/");
      } else {
          //req.flash("error", "Incorrect email or password"); // Flash an error message
          console.log('Error in login user');
          res.render("userSignin",{ message: 'Invalid email or password' });
      }
  } catch (error) {
      console.log("Error happens in userController userLogin function:", error);
  }
};














const verifyuser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email:email });
    let userPass = findUser.password;
    console.log('this is the findUser.password',userPass);

    if (findUser.isBlocked) {
      req.flash('message','User blocked')
      res.redirect('/signin')
    }
      
     else if (findUser && (await bcrypt.compare(password, findUser.password))) {
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
     

      
      req.flash('message','Invalid email or password')
      res.redirect('/signin')
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


let otpGenerationSavedAndMailSent = async(req,res,name,email,mobile,password)=>{

  console.log('reached the mail part for sending otp and password is  :',password,name,email,mobile);

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
console.log('otp generated is :',otp);
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
   
    res.render("emailOtp",{email});
    console.log("Message sent: %s", info.messageId);
  } 

}



//==================registring part=======================
const createUser = async (req, res) => {
  try {
    // this will be there in the session after all the actions:  req.session.userData = user;
   console.log('user enterd the createUser');
let { name,email,mobile,password } = req.body;

const existingUser = await User.findOne({ email:email });
console.log('existing user is found at the starting of db si :',existingUser);


    if (existingUser && existingUser.isVerified ===true) {
      //create a new user because it checked in database and found no matches
      console.log('user already exists');

      req.flash('message','User already registered');
      res.redirect('/signup');
    }

    else if(existingUser && existingUser.isVerified !==true){

      console.log('user already exists but not verified');

      await User.deleteMany({email:email})

      otpGenerationSavedAndMailSent(req,res,name,email,mobile,password);
    }

      else{
        console.log('new user is hrer');
        console.log('password is :',password,mobile,email,name);
        await otpGenerationSavedAndMailSent(req,res,name,email,mobile,password);

      }
}

  catch(err){
    console.log('error at create user catch is :  ',err.message);
  }
}

//=============Verify OTP======================
let verifyOTP = async (req, res) => {
  try {
    
    let otp = req.body.otp;
    console.log('otp type from fetch is :',typeof otp);
    console.log('otp sent by fetch is ',otp)
    if (!otp) {
      
      res.json({ otp: "noRecord", message: "Field should not be blank" });

    } else if (otp.length !== 6) {
     console.log('otp length in otp.length is ',otp.length);
      res.json({
        otp: "lessNum",
        message: `Please enter all the 6 digits sent to Email`,
      });

    } else {
           let userId = req.session.userData._id;

           let otpFromDatabase = await OTP.findOne({userId:userId});

          console.log('balue of otpFromDatabase',otpFromDatabase);

           let otpFromdb = otpFromDatabase.otp;

            if(otp !==otpFromdb){
              res.json({
                otp: "lessNum",
                message: `invalid otp...`,
              });
            }
          
             else {
                let userverified = await User.findByIdAndUpdate(userId,{isVerified:'true'},{new:true});
                console.log('user  successfully verified this is there in the session',req.session.userData)

                if(userverified){
                
                  res.json({otp:true})
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

          let {email} =req.body;
          // Delete existing OTP  of user
          await OTP.deleteOne({ userId: req.session.userData._id });
          console.log('exisiting otp deleted just before');
  
          // Generate new OTP
          const secret = speakeasy.generateSecret({ length: 20 });
          const otp = speakeasy.totp({
              secret: secret.base32,
              encoding: 'base32'
          });
  
          // Save new OTP to the database
          const otpDB = new OTP({
              userId: req.session.userData._id,
              otp: otp
          });
          await otpDB.save();
  
          console.log('OTP saved to database:', otpDB);
  

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
            res.json({success:true})
           
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
    const category = await Category.find({ 'status': 'active' });
    let product = [];

    if (req.query.category) {
      // Filter products based on the selected category
      product = await Product.find({ 'status': 'active', 'category': req.query.category })
        .populate({
          path: 'category',
          model: 'Category',
        })
        .exec();
    } else {
      // Fetch all products if no category is selected
      product = await Product.find({ 'status': 'active' })
        .populate({
          path: 'category',
          model: 'Category',
        })
        .exec();
    }

    res.render('shopPage', { product, category, user, selectedCategoryId: req.query.category });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}





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

};








