// admin login page not set
let path = require('path');
let User = require('../model/userModel');
let adminAuth = require('../middleware/adminAuth');
const Orders = require("../model/orderModel");

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



 
//======= Block or Unblock =======================
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



//========== Load the users =============================    
    const loadSearchQuery = async (req, res) => {
        try {
          const searchQuery = req.query.search || '';
          const users = await User.find({ name: { $regex: searchQuery, $options: 'i' } });
          res.json({ users });
        } catch (error) {
          console.error('Error loading user listing:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      };
      

//-------------- sales report ---------------------------
let salesReport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page number
        const limit = parseInt(req.query.limit) || 10; // Number of orders per page

        const totalOrders = await Orders.countDocuments(); // Total number of orders
        const totalPages = Math.ceil(totalOrders / limit); // Calculate total pages

        const skip = (page - 1) * limit; // Calculate number of documents to skip

        
        // Fetch orders for the current page
        const orders = await Orders.aggregate([
            {
                $project: {
                    userId: 1,
                    total: 1,
                    shipping: 1,
                    grandTotal: 1,
                    paymentMode: 1,
                    paymentStatus: 1,
                    date: 1,
                    address: 1,
                    deliveredProducts: {
                        $filter: {
                            input: "$Products",
                            as: "product",
                            cond: { $eq: ["$$product.orderStatus", "delivered"] }
                        }
                    }
                }
            },
            {
                $match: { "deliveredProducts": { $ne: [] } }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $addFields: {
                    user: { $arrayElemAt: ["$user", 0] }
                }
            },
            {
                $project: {
                    userId: 0
                }
            }
        ]);

// console.log('orders at the sales report page :',orders)


        res.render('salesReport', { orders, totalPages, currentPage: page, limit });
    } catch (error) {
        console.error('error at loading the sales report',error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

  
    
//--------------- custom date sort --------------------------------
// const customSort = async (req, res) => {
//     try {

//         console.log('reached hereeeeeeeeeeeeeeee')
//         const { startDate, endDate } = req.body;

//         // Convert start and end dates to JavaScript Date objects
//         const startDateObj = new Date(startDate);
//         startDateObj.setHours(0, 0, 0, 0); // Set time to start of the day
//         const endDateObj = new Date(endDate);
//         endDateObj.setHours(23, 59, 59, 999); // Set time to end of the day

//         // Fetch orders based on the custom date range
//          const orders = await Orders.find({
//             date: { $gte: startDateObj, $lte: endDateObj },
//             "Products.orderStatus": "delivered"
//         }).populate({
//             path: 'userId',
//             select: 'name email'
//         });


//         res.status(200).json(orders);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

    const customSort = async (req, res) => {
        try {
            console.log('reacheddd================================')
            const { date } = req.query;
            let orders;
    
            switch (date) {
                case 'today':
                    orders = await Orders.find({
                        "Products.orderStatus": "delivered",
                        date: {
                            $gte: new Date().setHours(0, 0, 0, 0), // Start of today
                            $lt: new Date().setHours(23, 59, 59, 999) // End of today
                        }
                    });
                    break;
                case 'week':
                    const currentDate = new Date();
                    const startOfWeek = new Date(currentDate);
                    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Set to the first day of the week (Sunday)
                    startOfWeek.setHours(0, 0, 0, 0);
    
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the last day of the week (Saturday)
                    endOfWeek.setHours(23, 59, 59, 999);
    
                    orders = await Orders.find({
                        "Products.orderStatus": "delivered",
                        date: {
                            $gte: startOfWeek,
                            $lt: endOfWeek
                        }
                    });
                    break;
                case 'month':
                    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    
                    orders = await Orders.find({
                        "Products.orderStatus": "delivered",
                        date: {
                            $gte: startOfMonth,
                            $lt: endOfMonth
                        }
                    });
                    break;
                case 'year':
                    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
                    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);
    
                    orders = await Orders.find({
                        "Products.orderStatus": "delivered",
                        date: {
                            $gte: startOfYear,
                            $lt: endOfYear
                        }
                    });
                    break;
                default:
                    // Fetch all orders
                    orders = await Orders.find({ "Products.orderStatus": "delivered" });
            }
    
// console.log('orders -------------',orders)


            res.status(200).json(orders);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
    



module.exports = {
    adminLogin,
    loadSearchQuery,
    verifyAdminLogin,
    adminDashboard,
    userField,
    logout,
    userField,
    toggleBlockStatus,
    salesReport,
    customSort,
}


