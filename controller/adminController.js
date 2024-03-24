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
        const searchQuery = req.query.search || ''; // Get the search query
       

        // Calculate the skip value to detemine
        const skip = (page - 1) *limit;


        let query = { isAdmin: { $ne: 1 } };

      // Add search query to the database query if it exists
      if (searchQuery) {
          const regex = new RegExp(`^${searchQuery}`, 'i');
          query.name = regex; // Assuming 'name' is the field you want to search
      }


        const users = await User.find(query)
        .skip(skip)
        .limit(limit);
        //Get the total number of users in the database

        const totalUsersCount = await User.countDocuments(query);

        //Calculate the total number of pages based on the total products and limit
        const totalPages = Math.ceil(totalUsersCount / limit);
        res.render('users',{users,page,totalPages,limit,searchQuery});
        // if(blockUser){
        //     res.redirect('/admin/users');
        // }
        } catch (error){
            console.log("user field error in dashboard",error);

        
         }
    }



 

    const toggleBlockStatus = async (req, res) => {
      try {
        // Extract the user ID from the request parameters
        const userId = req.query.id;
    
        // Find the user by ID
        const user = await User.findById(userId);
    
        if (!user) {
          // If user not found, send an error response
          return  res.json({ value: "noRecord"});
        }
    
        // Toggle the block status of the user
        user.isBlocked = !user.isBlocked;
    
        // Save the updated user object
        await user.save();
    
        // Send a success response
        res.json({ value: true});
        // If an error occurs, send an error response
       
       
      }
      catch(err){
        console.error('Error toggling user  block status:', err);
        res.json({ value: false });
      }
    }

    module.exports = {
      toggleBlockStatus,
    };
    


module.exports = {
    adminLogin,
    verifyAdminLogin,
    adminDashboard,
    userField,
    logout,
    userField,
    toggleBlockStatus
}
