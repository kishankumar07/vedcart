// let query = [{
//     id:1,name:"Alice"
// },
// {
//     id:2,name:"Bob"
// },
// {
//     id:3,name:"Henry"
// }]

// let n=2;//number of items to skip
// let m = 1;//limit amount

// let result = query.slice(n, n+m);

// console.log('result value is :',result)

let arr =[1,2,3,4,5,6,7,7,8,0]

let b = arr.slice(2,3);
console.log('value of b is :',b)



<script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script><dotlottie-player src="https://lottie.host/e4bfdd69-4e1c-44ec-9dd6-903340c291be/mjMLqsFrvg.json" background="transparent" speed="1" style="width: 150px; height: 100px" direction="1" playMode="normal" loop autoplay></dotlottie-player>
















const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            order.paymentStatus = 'paid';
            await order.save();
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    retryPayment,
    verifyPayment,
    // other functions
};





const loadUserProfile = async (req, res) => {
    try {
      // Access common data attached by the middleware
      const { userNameforProfile, cart, categoriesWithProducts, totalPriceOfCartProducts, userId, cartProductCount, wishlistProductCount } = res.locals.commonData;
  
      if (!userId) {
        res.redirect("/");
        return; // Add return statement to prevent further execution
      }
  
      let category = await Category.find({ status: "active" });
  
      // Query orders sorted by createdAt field in descending order
      const orders = await Orders.find({ userId: userId }).sort({ createdAt: -1 });
  
      let states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
      ];
  
      res.render("userProfile", { cart, totalPriceOfCartProducts, moment, categoriesWithProducts, userNameforProfile, userId, orders, category, states, orders, cartProductCount, wishlistProductCount });
    } catch (error) {
      console.log('error at loading userProfilePage', error);
      res.redirect("/error");
    }
  };
  









  const weeklySalesReport = async (req, res) => {
    try {
        // Define the start and end of the week
        const startOfWeek = moment().utc().startOf('week');
        const endOfWeek = moment().utc().endOf('week');

        // Detailed Orders Aggregation for the Week
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

        // Summarized Report Aggregation for the Week
        const weeklyOrders = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%U", date: "$createdAt" } },
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
            report: weeklyOrders,
            reportType: 'Weekly',
            moment,
            tableOrders: weeklyOrders1
        });
    } catch (error) {
        console.log('Error generating weekly sales report:', error);
        res.redirect('/error'); // Redirect to an error page if an error occurs
    }
};
