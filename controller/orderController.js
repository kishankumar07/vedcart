const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Orders = require("../model/orderModel");
let Category = require("../model/categoryModel");
let { orderedDate,orderedTime} = require('../config/timeStamp');
const Razorpay = require("razorpay");
const Coupons = require("../model/couponModel")


//========================   Razorpay instance   ===============================

var instance = new Razorpay({ key_id: process.env.RazorId, key_secret: process.env.RazorKey });


const placeTheOrder = async (req, res) => {
    try {
        
        const userId = req.session.userData;
        const { couponCode,paymentMethod,selectedValue } = req.body;
  
        console.log('payment method selected is :',paymentMethod);
        console.log('this is the coupon code :',couponCode);


        //to check the cart quantity , whether less than the available stock
        const cartQuantity = await Cart.findOne({ userId }).populate({
            path: "products.productId",
            model: "Product",
        });



console.log('this is the cartQuantity :',cartQuantity);



        // Check availability of each item in the cart
        for (const cartItem of cartQuantity.products) {
            const product = cartItem.productId;
            const requestedQuantity = cartItem.quantity;
  
            if (product.quantity < requestedQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough quantity available for product ${product.name}`,
                });
            }
        }
  
      
  
        const cart = await Cart.findOne({ userId });
        const currentDate=new Date()
        const products = await Promise.all(cart.products.map(async (cartProduct) => {
  
            //full doc of the product is got by searching  for its product id
            const productDetails = await Product.findById(cartProduct.productId);
  
            //actual price of the product
            const priceProduct = productDetails.offerprice || productDetails.price
  
            //this is the subtotal of product , actual price of product multiplied with its quantity in the cart
            const productSubTotal = priceProduct * cartProduct.quantity;
  
            return {
                productId: cartProduct.productId,
                name: productDetails.name,
                price: productDetails.price,
                quantity: cartProduct.quantity,
                subTotal: productSubTotal,
                orderStatus: cartProduct.status,
                image: productDetails.images,
                reason: cartProduct.cancellationReason,
            };
        }));
      
  
  //change made here :totalOfSubTotalsWithoutDiscount
        const totalOfSubTotalsWithoutDiscount = products.reduce((acc, product) => {
            return acc + product.subTotal;
        }, 0);
  
  
        let totalWithDiscount = totalOfSubTotalsWithoutDiscount;
  
        if (couponCode) {
          const coupon = await Coupons.findOne({ couponCode });
        
          if (coupon) {

              if (coupon && coupon.expiryDate >= currentDate && coupon.minAmount <= totalWithDiscount) {

                  const discountAmount = coupon.discountAmount;
                  totalWithDiscount -= discountAmount;
      
                  coupon.userUsed.push({ userId, used: true });
                  await coupon.save();
              }
          }
      }
  
    

        let shippingCharges = totalWithDiscount >500 ? 'free delivery' : '₹40.00'
  
        let grandTotal = shippingCharges === '₹40.00' ? totalWithDiscount + 40 : totalWithDiscount
  
  
        
        console.log('Time at which order was placed:', orderedTime);
        console.log('Date  at which order was placed:', orderedDate);
  
  
  
  
  
        const orderData = {
            userId: req.session.userData,
            Products: products.map(product => ({
                productId: product.productId,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                subTotal: product.subTotal,            
                orderStatus: product.orderStatus,
                image: product.image,
                reason: product.reason,
            })),
            paymentMode: paymentMethod,
            shipping: shippingCharges,
            grandTotal: grandTotal,
            total: totalWithDiscount,
           time:orderedTime,
          //  paymentStatus:'Cash on delivery',
           date:orderedDate,
            address: selectedValue,
        };

        const orderInstance = new Orders(orderData);
  
  console.log('order saved at the database is : ',orderInstance)
  
  
        if (paymentMethod === "Cash on delivery") {


          try {
              orderInstance.paymentStatus = "COD"
              const savedOrder = await orderInstance.save().then(async () => {
                await Cart.deleteOne({ userId: req.session.userData });
  
                for (let i = 0; i < cart.products.length; i++) {
                    const productId = cart.products[i].productId;
                    const count = cart.products[i].quantity;
  
                    await Product.updateOne({
                        _id: productId
                    }, {
                        $inc: {
                            quantity: - count
                        }
                    });
                }
            });
  
            res.json({ success: true, order: savedOrder });
          } catch (error) {
              res.status(500).json({ success: false, message: 'OD not working properly.' });
          }
      }  
  
           
      else if (paymentMethod === "Razorpay") {
        const totalpriceInPaise = Math.round(grandTotal * 100);
        const minimumAmount = 100;
        const total = Math.max(totalpriceInPaise, minimumAmount);

        console.log('this is the orderInstanc._id :',orderInstance._id)


        generateRazorpay(orderInstance._id, total).then(async (response) => {
            const savedOrder = await orderInstance.save();

console.log('this is the response after promise:',response)

            res.json({ response, total: total, order: savedOrder });
        });
    }
  
  
  //wallet part is not done----------------------
  
        
    } catch (error) {
        console.error('Error placing order at placetheOrder of ordercontroller:', error);
        res.status(500).json({ success: false, message: 'An error occurred while processing the order.' });
    }
  };
  
  
  
  //========  generate razorpay ============
  const generateRazorpay = (orderId, total) => {

    return new Promise((resolve, reject) => {
        const options = {
            amount: total,
            currency: "INR",
            receipt: "" + orderId
        };
        instance.orders.create(options, function (error, order) {
            if (error) {
                console.log('error at instance.orders at generateRazorpay',error);
                reject(error);
            } else {
                resolve({ order, orderId });
            }
        });
    });
  };
  


  //=======================  Verify payment =====================
  const verifyPayment = async (req, res) => {
    try {
        const userid = req.session.userData;



const razorpay_payment_id = req.body['payment[razorpay_payment_id]'];
const razorpay_order_id = req.body['payment[razorpay_order_id]'];
const razorpay_signature = req.body['payment[razorpay_signature]'];
let order = req.body['order[orderId]'];


console.log('this si the req.body suspect :',razorpay_payment_id)
console.log('this si the req.body suspect :',razorpay_order_id)
console.log('this si the req.body suspect :',razorpay_signature)
console.log('this is the order :',order)



        const Crypto = require("crypto");
       
        const secret = process.env.RazorKey;
        let hmac = Crypto.createHmac('sha256', secret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        hmac = hmac.digest('hex');
  
      

        if (hmac === razorpay_signature) {
            const orderFound = await Orders.findById(order);
            if (orderFound) {
                orderFound.paymentStatus = "Razorpay";
                await orderFound.save();
            }

  
            const cart = await Cart.findOne({ userId: userid }); 
            if (cart && cart.products && cart.products.length > 0) {
                for (let i = 0; i < cart.products.length; i++) {
                    const productId = cart.products[i].productId;
                    const count = cart.products[i].quantity;
  
                    await Product.updateOne(
                        { _id: productId },
                        {
                            $inc: {
                                quantity: -count
                            }
                        }
                    );
                }
            }
  
            await Cart.deleteOne({ userId: userid });
            res.json({ payment: true });
        }
    } catch (error) {
        console.log('errror at  verify payment :',error)
        res.status(500).json({ success: false, message: "Internal Server Errorrrr" });
    }
  };


// const placeTheOrder = async (req, res) => {
//     try {
        
//         const paymentMethod = req.body.paymentMethod;
//         const selectedValue = req.body.selectedValue;
//         const userId = req.session.userData;




//         //to check the cart quantity , whether less than the available stock
//         const cartQuanity = await Cart.findOne({ userId }).populate({
//             path: "products.productId",
//             model: "Product",
//         });
//         // Check availability of each item in the cart
//         for (const cartItem of cartQuanity.products) {
//             const product = cartItem.productId;
//             const requestedQuantity = cartItem.quantity;

//             if (product.quantity < requestedQuantity) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Not enough quantity available for product ${product.name}`,
//                 });
//             }
//         }




//         const cart = await Cart.findOne({ userId });

//         const products = await Promise.all(cart.products.map(async (cartProduct) => {

//             //full doc of the product is got by searching  for its product id
//             const productDetails = await Product.findById(cartProduct.productId);

//             //actual price of the product
//             const priceProduct =  productDetails.price;

//             //this is the subtotal of product , actual price of product multiplied with its quantity in the cart
//             const productSubTotal = priceProduct * cartProduct.quantity;

//             return {
//                 productId: cartProduct.productId,
//                 name: productDetails.name,
//                 price: productDetails.price,
//                 quantity: cartProduct.quantity,
//                 subTotal: productSubTotal,
//                 orderStatus: cartProduct.status,
//                 image: productDetails.images,
//                 reason: cartProduct.cancellationReason,
//             };
//         }));

//         console.log("productDetails of the products in cart, at orderplacing page", products);





//         const totalOfSubTotals = products.reduce((acc, product) => {
//             return acc + product.subTotal;
//         }, 0);

//         let shippingCharges = totalOfSubTotals >500 ? 'free delivery' : '₹40.00'

//         let grandTotal = shippingCharges === '₹40.00' ? totalOfSubTotals + 40 : totalOfSubTotals


        
//         console.log('Time at which order was placed:', orderedTime);
//         console.log('Date  at which order was placed:', orderedDate);





//         const orderData = {
//             userId: req.session.userData,
//             Products: products.map(product => ({
//                 productId: product.productId,
//                 name: product.name,
//                 price: product.price,
//                 quantity: product.quantity,
//                 subTotal: product.subTotal,            
//                 orderStatus: product.orderStatus,
//                 image: product.image,
//                 reason: product.reason,
//             })),
//             paymentMode: paymentMethod,
//             shipping: shippingCharges,
//             grandTotal: grandTotal,
//             total: totalOfSubTotals,
//            time:orderedTime,
//            paymentStatus:'Cash on delivery',
//            date:orderedDate,
//             address: selectedValue,
//         };

//         const orderInstance = new Orders(orderData);

       

//             const savedOrder = await orderInstance.save().then(async () => {
//                 await Cart.deleteOne({ userId: req.session.userData });

//                 for (let i = 0; i < cart.products.length; i++) {
//                     const productId = cart.products[i].productId;
//                     const count = cart.products[i].quantity;

//                     await Product.updateOne({
//                         _id: productId
//                     }, {
//                         $inc: {
//                             quantity: - count
//                         }
//                     });
//                 }
//             });

//             res.json({ success: true, order: savedOrder });
        
//     } catch (error) {
//         console.error('Error placing order:', error);
//         res.status(500).json({ success: false, message: 'An error occurred while processing the order.' });
//     }
// };



//=============  order details -----------------------------
const loadOrderDetailsPage = async (req, res) => {
    try {
        const orderid = req.query.orderId;
      
     let orderPlacedByTheUser = await Orders.findOne({_id:orderid})
    //  console.log('this is the order placed',orderPlacedByTheUser);
     
      res.render("orderDetails", { orderPlacedByTheUser });

    } catch (error) {
      console.log(error.message);
    }
  };




  //=================== successful placement====================
  const orderSuccess = async (req, res) => {
    try {
        const orderid = req.query.orderId
        let userId = req.session.userData;
        let category = await Category.find({ status: "active" });
        let userNameforProfile = await User.findById(userId)
      
     let orderPlacedByTheUser = await Orders.findOne({_id:orderid})
    //  console.log('this is the order placed',orderPlacedByTheUser);
     
      res.render("successPage", { orderPlacedByTheUser,userNameforProfile,category });

    } catch (error) {
      console.log(error.message);
    }
  };



  const cancelOrPlacedOrder = async (req, res) => {
    try {
        console.log('reached heeree');
        const orderId = req.query.orderId;
        const productId = req.query.productId;
       
        console.log('thsi i s the orderId',orderId);
        console.log('this is the productis',productId);


        const updatedOrder = await Orders.updateOne({
            _id: orderId,
            'Products.productId': productId

        },
            {
                $set: {
                    'Products.$.orderStatus': 'request cancellation',
                }
            })
            
console.log('this is the updatedOrder',updatedOrder);

        res.json({
            success: true,
            message: "Product cancelled successfully",
            updatedOrder,
        });

    } catch (error) {
        res.redirect("/error")
        res.status(500).json({ success: false, message: "Internal server error" });

    }
}

//==============loading the order at admin side=========
const loadOrder = async (req, res) => {
    try {

        //In order model date is given to get the latest product for admin view in admin page
        const admin = req.session.admin;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8; 
        const totalOrders = await Orders.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        const allOrders = await Orders.find().sort({date:-1})
            .populate({
                path: "Products.productId",
                model: "Product",
            })
            .populate('userId', 'name')
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();


console.log('this is at the allorder',allOrders);


        res.render("orderView", { allOrders, totalPages, currentPage: page  });
    } catch (error) {
        res.redirect("/error")
        console.log('error at loadOrder at admin',error);
    }
};


module.exports = {
    placeTheOrder,
    orderSuccess,
    loadOrderDetailsPage,
    cancelOrPlacedOrder,
    loadOrder,
    verifyPayment
};
