const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Orders = require("../model/orderModel");
let Category = require("../model/categoryModel");




const placeTheOrder = async (req, res) => {
    try {
        
        const paymentMethod = req.body.paymentMethod;
        const selectedValue = req.body.selectedValue;
        const userId = req.session.userData;




        //to check the cart quantity , whether less than the available stock
        const cartQuanity = await Cart.findOne({ userId }).populate({
            path: "products.productId",
            model: "Product",
        });
        // Check availability of each item in the cart
        for (const cartItem of cartQuanity.products) {
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

        const products = await Promise.all(cart.products.map(async (cartProduct) => {

            //full doc of the product is got by searching  for its product id
            const productDetails = await Product.findById(cartProduct.productId);

            //actual price of the product
            const priceProduct =  productDetails.price;

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

        console.log("productDetails of the products in cart, at orderplacing page", products);





        const totalOfSubTotals = products.reduce((acc, product) => {
            return acc + product.subTotal;
        }, 0);

        let shippingCharges = totalOfSubTotals >500 ? 'free delivery' : '₹40.00'

        let grandTotal = shippingCharges === '₹40.00' ? totalOfSubTotals + 40 : totalOfSubTotals





//for storing data and time in a standard format
        const date = new Date(); // Assuming this is the date object you have

        // Set the timezone to 'Asia/Kolkata' (Indian Standard Time)
        process.env.TZ = 'Asia/Kolkata';
        
        // Format the time with options for local time
        const orderedTime = date.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        
        // Manually construct the date string in 'day-month-year' order
        const orderedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        
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
            total: totalOfSubTotals,
           time:orderedTime,
           paymentStatus:'Cash on delivery',
           date:orderedDate,
            address: selectedValue,
        };

        const orderInstance = new Orders(orderData);

       

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
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'An error occurred while processing the order.' });
    }
};

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
        const admin = req.session.admin;
       
        const allOrders = await Orders.find().sort({date:-1})
        .populate({
            path: "Products.productId",
            model: "Product",
        })
        .populate('userId', 'name')
        
        
        .exec();

console.log('this is at the allorder',allOrders);


        res.render("orderView", { allOrders });
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
};
