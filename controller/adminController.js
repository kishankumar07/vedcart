// admin login page not set
let path = require('path');
let User = require('../model/userModel');
let adminAuth = require('../middleware/adminAuth');


//===============Admin Login==========================
let adminLogin = async(req,res)=>{
    try{
       
        res.render('adminLogin');
    }catch(err){
        if (err) throw err;
    }
}

const verifyAdminLogin=async(req,res)=>{
    try {
        const {email, password}=req.body;
        console.log("-------------------admin entered email----------------",email);

        
       
        if(email === process.env.AD_EMAIL && password === process.env.AD_PASS){
            console.log('password of admin was matched');
            req.session.Admin=true;
            res.redirect('/admin/dashboard')
        }
        else{
            res.redirect('/admin/login');
        }

    } catch (error) {
        console.log(" this is adminVerify error",error);
        
    }
};

//==================Loading the admin dashboar==============
const adminDashboard = async (req, res) => {
    try{
    
        
        res.render('dashboard');

    } catch (error) {
        console.log('Error happened in admin controller at adminLoginPage function ', error);
    }

}

//logout admin------------------------------------------------------------------

const logout = async(req,res)=>{
    try{
        req.session.Admin = null;
        res.redirect('/admin/login')
    } catch (error) {
        console.log('Error hapens in admin controller at logout function',error);

    }
}

// user page rendering and show details of all users--------------------------------------

const userField = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) ||4;
        // Calculate the skip value to detemine
        const skip = (page - 1) *limit;
       
        const user = await User.find({isAdmin:{$ne:1}})
        .skip(skip)
        .limit(limit);
        //Get the total number of products in the database

        const totalProductsCount = await User.countDocuments();

        //Calculate the total number of pages based on the total products and limit
        const totalPages = Math.ceil(totalProductsCount / limit);
        res.render('users',{users:user,page,totalPages,limit});
        // if(blockUser){
        //     res.redirect('/admin/users');
        // }
        } catch (error){
            console.log("user field error in dashboard",error);

        
         }
    }
// =============Blocking the user==================================
         let userBlock = async(req,res) =>{
            try{
                let id = req.query.id;
                let blockUser = await User.findByIdAndUpdate(id,{isBlocked:true},{new:true});
                if(blockUser){
                    res.redirect('/admin/users');
                }
               
            }catch(err){
                console.log(err);
            }
         }

//=====================Unblocking the user==============================         
         let userUnBlock = async(req,res) =>{
            try{
                let id = req.query.id;
                let blockUser = await User.findByIdAndUpdate(id,{isBlocked:false},{new:true});
                if(blockUser){
                    res.redirect('/admin/users');
                }
               
            }catch(err){
                console.log(err);
            }
         }


module.exports = {
    adminLogin,
    verifyAdminLogin,
    adminDashboard,
    userField,
    logout,
    userField,
    userBlock,
    userUnBlock,
}
