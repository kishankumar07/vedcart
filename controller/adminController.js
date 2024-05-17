// admin login page not set
let path = require('path');
let User = require('../model/userModel');
let adminAuth = require('../middleware/adminAuth');
const Orders = require("../model/orderModel");
let moment = require('moment')
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


const loadSalesReport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; 
        const skip = (page - 1) * limit;
        
        const aggregationPipeline = [
           
            {
                $match: {}
            },
            
            {
                $sort: { createdAt: -1 }
            },

            {
                $unwind: "$Products"
            },
           
            {
                $project: {
                    _id: 1,
                    paymentMode: 1,
                    date: 1,
                    address: 1,
                    orderStatus: "$Products.orderStatus",
                    productPrice:"$Products.subTotal"
                }
            }
            
        ];
        
       
        const orders = await Orders.aggregate(aggregationPipeline)

            // console.log('orders after aggregation pipeline at loading the sales report:', orders);
        
      
        const totalOrders = await Orders.countDocuments();
        console.log('total orders when loading the sales report page is :',totalOrders)
        const totalPages = Math.ceil(totalOrders / limit);
       
        res.render('salesReport', {
            orderDetails: orders,
            moment,
            totalPages,
            currentPage: page,
            limit
        });
    } catch (error) {
        console.log('Error loading sales report page', error);
        res.redirect('/error');
    }
};



//=============== custom sales report ============================


const customDateReport = async (req, res) => {
    try {
       
        const { startDate, endDate } = req.query; 

       
        const start = new Date(startDate);
        const end = new Date(endDate);

       
        const aggregationPipeline = [
            
            {
                $match: {
                    date: { $gte: start, $lte: end }
                }
            },
           
            {
                $unwind: "$Products"
            },
          
            {
                $match: { "Products.orderStatus": "delivered" }
            },
           
            {
              $project: {
                 
                  couponDiscount: 1,
                  product: "$Products.subTotal", 
                  orderStatus: "$Products.orderStatus" 
              }
          },
           
          
        ];

       
        const orders = await Orders.aggregate(aggregationPipeline);


// console.log('orders value at custom sales report------------------------------------------------ :',orders)


let total = orders.reduce((acc,curr)=>{
    return acc+curr.product;
},0)

const totalOrders = await Orders.countDocuments({
    date: { $gte: start, $lte: end },
    
});

// console.log('total docs ==================================',totalOrders)

      

        // Render the custom date range sales report page with fetched orders and pagination details
        res.render('salesReportCustom', {
            totalAmount:total,
            startDate: start,
            endDate:end,    
            totalCount: totalOrders,
            moment
        });
    } catch (error) {
        console.log('Error loading custom date sales report page', error);
        res.redirect('/error');
    }
};



//-------------------  daily sales report  ----------------------------


const dailySalesReport = async (req, res) => {
    try {
        
        const startOfDay = moment().startOf('day');
        const endOfDay = moment().endOf('day');


        



        const dailyOrders = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfDay.toDate(), $lte: endOfDay.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalOrders: { $sum: 1 },
                    totalCouponDiscount: { $sum: "$couponDiscount" },
                    products: { $push: "$Products" }
                }
            },
            {
                $unwind: "$products"
            },
            {
                $unwind: "$products"
            },
            {
                $match: {
                    "products.orderStatus": "delivered" 
                }
            },
            {
                $group: {
                    _id: "$_id",
                    totalOrders: { $first: "$totalOrders" },
                    totalCouponDiscount: { $first: "$totalCouponDiscount" }, 
                    totalSubTotal: { $sum: "$products.subTotal" }
                }
            }
        ]);
        
        
        


        console.log('daily orders gonna be loaded after unwind stage :',dailyOrders)




        
        res.render('reports', {
            report: dailyOrders , 
            reportType: 'Daily', 
            moment,
        });
    } catch (error) {
        console.log('Error generating daily sales report:', error);
        res.redirect('/error'); // Redirect to an error page if an error occurs
    }
};




//--------------------- weekly report --------------------






const generateWeeklyReport = async (req, res) => {
    try {
        // Get the start and end of the current week
        const startOfWeek = moment().startOf('week');
        const endOfWeek = moment().endOf('week');

        const weeklyOrders = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalOrders: { $sum: 1 },
                    totalCouponDiscount: { $sum: "$couponDiscount" },
                    products: { $push: "$Products" }
                }
            },
            {
                $unwind: "$products"
            },
            {
                $unwind: "$products"
            },
            {
                $match: {
                    "products.orderStatus": "delivered" 
                }
            },
            {
                $group: {
                    _id: "$_id",
                    totalOrders: { $first: "$totalOrders" },
                    totalCouponDiscount: { $first: "$totalCouponDiscount" }, 
                    totalSubTotal: { $sum: "$products.subTotal" }
                }
            }
        ]);
        
        console.log('Weekly orders shown when the weekly button is clicked:', weeklyOrders);

        res.render('reports', {
            report: weeklyOrders, 
            reportType: 'Weekly', 
            moment,
        });
    } catch (error) {
        console.log('Error generating weekly sales report:', error);
        res.redirect('/error');
    }
};


//-------------- monthly report ------------------------------
const generateMonthlyReport = async (req, res) => {
    try {
        // Get the start and end of the current month
        const startOfMonth = moment().startOf('month');
        const endOfMonth = moment().endOf('month');

        const monthlyOrders = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalOrders: { $sum: 1 },
                    totalCouponDiscount: { $sum: "$couponDiscount" },
                    products: { $push: "$Products" }
                }
            },
            {
                $unwind: "$products"
            },
            {
                $unwind: "$products"
            },
            {
                $match: {
                    "products.orderStatus": "delivered" 
                }
            },
            {
                $group: {
                    _id: "$_id",
                    totalOrders: { $first: "$totalOrders" },
                    totalCouponDiscount: { $first: "$totalCouponDiscount" }, 
                    totalSubTotal: { $sum: "$products.subTotal" }
                }
            }
        ]);

        console.log('Monthly orders shown when the monthly button is clicked:', monthlyOrders);

        res.render('reports', {
            report: monthlyOrders, 
            reportType: 'Monthly', 
            moment,
        });
    } catch (error) {
        console.log('Error generating monthly sales report:', error);
        res.redirect('/error');
    }
};




//-------------------------- yearly report ------------------------------
const generateYearlyReport = async (req, res) => {
    try {
        // Get the start and end of the current year
        const startOfYear = moment().startOf('year');
        const endOfYear = moment().endOf('year');

        const yearlyOrders = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfYear.toDate(), $lte: endOfYear.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalOrders: { $sum: 1 },
                    totalCouponDiscount: { $sum: "$couponDiscount" },
                    products: { $push: "$Products" }
                }
            },
            {
                $unwind: "$products"
            },
            {
                $unwind: "$products"
            },
            {
                $match: {
                    "products.orderStatus": "delivered" 
                }
            },
            {
                $group: {
                    _id: "$_id",
                    totalOrders: { $first: "$totalOrders" },
                    totalCouponDiscount: { $first: "$totalCouponDiscount" }, 
                    totalSubTotal: { $sum: "$products.subTotal" }
                }
            }
        ]);

        console.log('Yearly orders shown when the yearly button is clicked:', yearlyOrders);

        res.render('reports', {
            report: yearlyOrders, 
            reportType: 'Yearly', 
            moment,
        });
    } catch (error) {
        console.log('Error generating yearly sales report:', error);
        res.redirect('/error');
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
    loadSalesReport,
    customDateReport,
    dailySalesReport,
    generateWeeklyReport,
    generateMonthlyReport,
    generateYearlyReport
}


