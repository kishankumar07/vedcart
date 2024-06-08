// admin login page not set
let path = require('path');
let User = require('../model/userModel');
let Product = require("../model/productModel");
let Category = require("../model/categoryModel");
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
        let productTotal = await Product.countDocuments();
        let categoryTotal = await Category.countDocuments();
        let users = await User.countDocuments();

        let orders = await Orders.aggregate([

            {
              $match:{}
            },
            {
              $group:{
                _id:null,
                totalOrders:{ $sum : 1},
                totalCouponDiscount : {$sum : "$couponDiscount" },
                products : { $push:"$Products" }
              }
            },
            {
              $unwind : "$products"
            },
            {
              $unwind : "$products"
            },
            {
              $match :{ "products.orderStatus" : "delivered"}
            },
            {
              $group: {
                  _id: "$_id",
                  totalOrders: { $first: "$totalOrders" },
                  totalCouponDiscount: { $first: "$totalCouponDiscount" }, 
                  totalSubTotal: { $sum: "$products.subTotal" }
              }
          },  
          ])
     
    let codRevenue = await Orders.aggregate([
        {
            $match : { "paymentMode" : "Cash on delivery" }
        },
        {
            $unwind : "$Products"
        },
        {
            $match : { "Products.orderStatus" : "delivered" }
        },
        {
            $group : {
                _id : null,
                total : { $sum : "$Products.subTotal" }
            }
        }
    ])
   
  
        
          const onlineRevenue = await Orders.aggregate([
            {
              $match: {
                paymentMode: { $in: ['Razorpay', 'wallet'] }
              }
            },
            {
              $unwind: "$Products"
            },
            {
              $match: {
                "Products.orderStatus": "delivered"
              }
            },
            {
              $group: {
                _id: null,
                totalSubTotal: { $sum: "$Products.subTotal" }
              }
            }
          ]);
    
          let newUsers = await User.find().sort({createdAt : 1}).limit(5)




        res.render('dashboard',{orders,codRevenue,productTotal,categoryTotal,users,onlineRevenue,newUsers});

    } catch (error) {
        console.log('Error happened in admin controller at adminLoginPage function ', error);
    }

}// chart portion-------------------

//----------------- to get monthly sales data for the chart -----------------------
const displayMonthlyData = async (req, res) => {
    try {
        const monthlySales = Array.from({ length: 12 }, () => 0);
     
        const orders = await Orders.find({ "Products.orderStatus": "delivered" });

       

        for (const order of orders) {
            if (order.date instanceof Date) {
                const month = order.date.getMonth();
               
                monthlySales[month] += order.total;
            } else {
                console.warn(`Invalid createdAt date for order ${order._id}`);
            }
        }
        
        res.json({ monthlySales });
    } catch (err) {
        console.error('error at the monthly data fetching for graph at admin side :',err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//----------  get the yearly data =---------------------------
const displayYearlyData = async (req, res) => {
    try {
        const START_YEAR = 2022;
        const currentYear = new Date().getFullYear();
        const yearlySales = Array.from({ length: currentYear - START_YEAR + 1 }, () => 0);

        const orders = await Orders.find({ "Products.orderStatus" : "delivered" });

        for (const order of orders) {
           
            if (order.date instanceof Date) {
                const year = order.date.getFullYear();
                yearlySales[year - START_YEAR] += order.total;
            } else {
                console.warn(`Invalid createdAt date for order ${order._id}`);
            }
        }

        res.json({ yearlySales, START_YEAR });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};






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
                    orderId: 1,
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
        // console.log('total orders when loading the sales report page is :',totalOrders)
        // const totalPages = Math.ceil(totalOrders / limit);
       
        res.render('salesReport', {
            orderDetails: orders,
            moment,
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
                $sort: { createdAt: -1 }
            },

            {
                $unwind: "$Products"
            },
            {
                $match: { "Products.orderStatus": "delivered" }
            },
            {
                $project: {
                    orderId: 1,
                    paymentMode: 1,
                    date: 1,
                    address: 1,
                    orderStatus: "$Products.orderStatus",
                    productPrice:"$Products.subTotal"
                }
            }
            
        ];
        
       
        const orders1 = await Orders.aggregate(aggregationPipeline)

// console.log('table orders :',orders1)

       
        const aggregationPipeline1 = [
            
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

       
        const orders = await Orders.aggregate(aggregationPipeline1);


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
            moment,
            reportType:'Custom Date',
            tableOrders : orders1,
        });
    } catch (error) {
        console.log('Error loading custom date sales report page', error);
        res.redirect('/error');
    }
};



//-------------------  daily sales report  ----------------------------


const dailySalesReport = async (req, res) => {
    try {
        
        const startOfDay = moment().utc().startOf('day');
        const endOfDay = moment().utc().endOf('day');
        

let dailyOrders1 = await Orders.aggregate([
    {
        $match :{
            date :{ $gte : startOfDay.toDate(), $lte : endOfDay.toDate() }
        }
    },
    {
        $sort: { createdAt: -1 }
    },
    {
        $unwind: "$Products"
    },
    {
        $match: { "Products.orderStatus": "delivered" }
    },
    {
        $project: {
            orderId: 1,
            paymentMode: 1,
            date: 1,
            address: 1,
            orderStatus: "$Products.orderStatus",
            productPrice:"$Products.subTotal"
        }
    }
])


        const dailyOrders = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfDay.toDate(), $lte: endOfDay.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
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
        
        
        res.render('reports', {
            report: dailyOrders , 
            reportType: 'Daily', 
            moment,
            tableOrders :dailyOrders1
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
        
        console.log('Start of Week:', startOfWeek.toDate());
        console.log('again debug :',moment(startOfWeek).format('DD-MM-YYYY'));
        console.log('End of Week:', endOfWeek.toDate());
        console.log('again debug :',moment(endOfWeek).format('DD-MM-YYYY'));

        let weeklyOrders1 = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $unwind: "$Products"
            },
            {
                $match: { "Products.orderStatus": "delivered" }
            },
            {
                $project: {
                    orderId: 1,
                    paymentMode: 1,
                    date: 1,
                    address: 1,
                    orderStatus: "$Products.orderStatus",
                    productPrice: "$Products.subTotal"
                }
            }
        ]);


        const weeklyOrders = await Orders.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
                }
            },
            {
                $group: {
                    _id: { $week: "$createdAt" },
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
            },
            {
                $addFields: {
                    weekRange: {
                        $let: {
                            vars: {
                                startOfWeek: { $dateToString: { format: "%d-%b-%Y", date: startOfWeek.toDate() } },
                                endOfWeek: { $dateToString: { format: "%d-%b-%Y", date: endOfWeek.toDate() } }
                            },
                            in: { $concat: ["$$startOfWeek", " to ", "$$endOfWeek"] }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: "$weekRange",
                    totalOrders: 1,
                    totalCouponDiscount: 1,
                    totalSubTotal: 1
                }
            }
        ]);
        // console.log('Weekly orders shown in the DOM when the weekly button is clicked------------:', weeklyOrders);

      
    

        res.render('reports', {
            report: weeklyOrders, 
            reportType: 'Weekly', 
            moment,
            tableOrders: weeklyOrders1
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
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();





        let monthlyOrders1 = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $unwind: "$Products"
            },
            {
                $match: { "Products.orderStatus": "delivered" }
            },
            {
                $project: {
                    orderId: 1,
                    paymentMode: 1,
                    date: 1,
                    address: 1,
                    orderStatus: "$Products.orderStatus",
                    productPrice: "$Products.subTotal"
                }
            }
        ]);


        const monthlyOrders = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
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
            },
            {
                $addFields: {
                    startOfMonth: { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: 1 } },
                    endOfMonth: { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: 32 } }
                }
            },
            {
                $addFields: {
                    endOfMonth: { $subtract: ["$endOfMonth", { $multiply: [24, 60, 60, 1000] }] }
                }
            },
            {
                $addFields: {
                    monthRange: {
                        $concat: [
                            { $dateToString: { format: "%d-%b-%Y", date: "$startOfMonth" } },
                            " to ",
                            { $dateToString: { format: "%d-%b-%Y", date: "$endOfMonth" } }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: "$monthRange",
                    totalOrders: 1,
                    totalCouponDiscount: 1,
                    totalSubTotal: 1
                }
            }
        ]);

        console.log('Monthly orders shown when the monthly button is clicked:', monthlyOrders);

        res.render('reports', {
            report: monthlyOrders, 
            reportType: 'Monthly', 
            moment,
            tableOrders :monthlyOrders1
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
        const startOfYear = moment().startOf('year').toDate();
        const endOfYear = moment().endOf('year').toDate();


        let yearlyOrders1 = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $unwind: "$Products"
            },
            {
                $match: { "Products.orderStatus": "delivered" }
            },
            {
                $project: {
                    orderId: 1,
                    paymentMode: 1,
                    date: 1,
                    address: 1,
                    orderStatus: "$Products.orderStatus",
                    productPrice: "$Products.subTotal"
                }
            }
        ]);


        const yearlyOrders = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            {
                $group: {
                    _id: { year: { $year: "$date" } },
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
            },
            {
                $addFields: {
                    yearRange: { $toString: "$_id.year" }
                }
            },
            {
                $project: {
                    _id: "$yearRange",
                    totalOrders: 1,
                    totalCouponDiscount: 1,
                    totalSubTotal: 1
                }
            }
        ]);

        console.log('Yearly orders shown when the yearly button is clicked:', yearlyOrders);

        res.render('reports', {
            report: yearlyOrders, 
            reportType: 'Yearly', 
            moment,
            tableOrders : yearlyOrders1
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
    displayMonthlyData,
    displayYearlyData,
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


