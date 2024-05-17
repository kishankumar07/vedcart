let User = require("../model/userModel");
let Product = require("../model/productModel");
let Cart = require("../model/cartModel");
let Offer = require('../model/offerModel');
let Category = require("../model/categoryModel");
const Coupons = require("../model/couponModel")

// By using optional chaining, you prevent the error from occurring when attempting to access properties of undefined objects. 




//===========  Loading the cart page========================

const loadCart = async (req, res) => {
  try {
      const userId = req.session.userData;
    let message = req.flash('message');

console.log('message from checkout page by flash',message)

      let userNameforProfile = await User.findById(userId);

      let category = await Category.find({ status: "active" });
      
      const cartData = await Cart.findOne({ userId: userId }).populate({
          path: "products.productId",
          model: "Product",
      });
      console.log('cart ddataaaa -----------------------------------------',cartData)

      if (!cartData) {

        console.log('cart page loaded with no cart data 1st case')
          res.render("cart", { cartData: { products: [] },userNameforProfile,category });
          // res.render("cart", { userNameforProfile,category });

          return;
      }
      const productsWithZeroStock = cartData.products.filter(product => product.quantity === 0);



      // case if there is products in the cart at least one
      if (cartData.products.length > 0) {
          // cartData.products.forEach((product) => {
          //     const productPrice =  product.productPrice;
          //     product.productTotalPrice = productPrice * product.quantity;
          // });




        //subtotalwithnoshipping charge is the thing at the right most part of the cart page
        const subtotalWithNoShippingCharge = cartData.products.reduce((total, product) => {
          let totalPrice = 0; 
          if (product.productId?.offerprice) {
              totalPrice = product.productId?.offerprice * product.quantity;
              console.log('total price when offer price applied at loadCart suddenly',totalPrice)
          } else if (product.productId?.price) {
              totalPrice = product.productId?.price * product.quantity;
              console.log('total price when no offer applied at loadCart suddenly',totalPrice)
          }
          return total + totalPrice; 
      }, 0);
      console.log('subtotals with no shipping charges :',subtotalWithNoShippingCharge)


let shippingCharges = subtotalWithNoShippingCharge > 500 ? 'free shipping' :'₹40.00'

let grandTotalForCheckOut = subtotalWithNoShippingCharge > 500 ? subtotalWithNoShippingCharge : subtotalWithNoShippingCharge + 40;


// console.log('shipping charge  :: ',shippingCharges);

       



// console.log('this is the grandTotal for checkout ::',grandTotalForCheckOut);

          res.render("cart", { userId,cartData,userNameforProfile,category,shippingCharges,grandTotalForCheckOut,subtotalWithNoShippingCharge,message,productsWithZeroStock,message });

      } else {
        console.log('cart page loaded with no cart data else case')
          res.render("cart", { cartData,userNameforProfile,category });
      }
  } catch (error) {
    console.log('error loading  at catch block ,cart page :::',error);
      res.redirect("/error")
  }
};



//==========================    add to cart   ==========================



const addToCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.session.userData;
    const quantity = parseInt(req.params.quantity);

    // Check if user is logged in
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not authenticated" });
    }

    // Check if user is blocked
    let { isBlocked } = await User.findById(userId);
    if (isBlocked) {
     
      return res.status(400).json({ error: "You're blocked by the admin" });
    }

    // Find the product
    const productFound = await Product.findById(productId);
    if (!productFound) {
      
      return res.status(400).json({ error: "Invalid product is added." });
    }

    // Check product stock
    if (productFound.quantity === 0) {
      return res.status(400).json({ error: "Product out of stock." });
    }

    // Proceed with adding to cart
    const cart = await Cart.findOne({ userId });

    if (cart) {
      const existingProductIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      // If the product already exists in the cart
      if (existingProductIndex !== -1) {
        return res.status(400).json({ error: "Product already in the cart." });
      }

      // If the product does not exist in the cart, add it
      const productPrice = productFound.offerprice || productFound.price;
      const totalPrice = quantity * productPrice;

      cart.products.push({
        productId: productId,
        quantity: quantity,
        productPrice: productPrice,//this one need not required
        totalPrice: totalPrice,
        name: productFound.name
      });

      await cart.save();
    } else {
      // If the user has no existing cart, create a new one
      const productPrice = productFound.offerprice || productFound.price;
      const totalPrice = quantity * productPrice;

      const newCart = new Cart({
        userId: userId,
        products: [
          {
            productId: productId,
            quantity: quantity,
            productPrice: productPrice,
            totalPrice: totalPrice,
            name: productFound.name,
          },
        ],
      });

      await newCart.save();
    }

    return res.status(200).json({ data: true, message: "Product added to cart successfully." });

  } catch (error) {
    console.error('Error at add to cart controller:', error);
    return res.status(500).json({ error: "Internal server error." });
  }
};





// =====================  Delete a cart item ===========================
let deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.body;
    // console.log('thsi is the product id::',typeof productId);
    // Assuming userId is available in req.user, you might need to adjust this based on your authentication logic
    const userId = req.session.userData;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the subproduct from the cart
    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    // Save the updated cart
    await cart.save();

    // Check if the cart is empty
    const cartEmpty = cart.products.length === 0;

    res
      .status(200)
      .json({ message: "Product deleted from cart successfully", cartEmpty });
  } catch (error) {
    console.error("Error deleting subproduct from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};







//================   updating the cart item   ============================

const updateCartItemCount = async (req, res) => {
  try {
    const userId = req.session.userData;
    const { cartId, productId, quantity } = req.body;

    const existingCart = await Cart.findById(cartId);

    if (!existingCart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const productToUpdate = existingCart.products.find((proId) => proId.productId.equals(productId))

    if (!productToUpdate) {
        return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    // const maxQuentity = productToUpdate.quentity
    // console.log("max",quentity);
    // if(maxQuentity<quentity){
    //     return res.status(400).json({ success: false, message: `Exceeded maximum quantity limit (${maxQuentity}).` });
    // }

    // Assuming existingCart is an instance of your cart model
    productToUpdate.quantity = quantity;
    productToUpdate.totalPrice = quantity * productToUpdate.productPrice;

    const updatedCart = await existingCart.save();

    // const updatedTotalPrice = productToUpdate.totalPrice;


    const totalOfSubTotals = existingCart.products.reduce((total, product) => {
       return total + product.totalPrice;
    }, 0);

let updatedSubtotal = productToUpdate.totalPrice;
let updatedShippingCharges = totalOfSubTotals > 500 ? 'free delivery' : '₹40.00';

let updatedGrandTotal = updatedShippingCharges ==='free delivery' ? totalOfSubTotals : totalOfSubTotals + 40;
// console.log('this is updated grandtotal',updatedGrandTotal);

    res.json({
      success: true,
      subtotal: updatedSubtotal,
      totalOfSubTotals :totalOfSubTotals, 
      shippingCharges: updatedShippingCharges,
      grandTotalForCheckOut: updatedGrandTotal,
      message: 'Quantity updated successfully',
  });







    // res.json({
    //     success: true,
    //     message: "Quantity updated successfully",
    //     // updatedTotalPrice,
    //     // totalPriceTotal,
    // });
} catch (error) {
    res.redirect("/500")
    res.status(500).json({ success: false, message: "Internal server error" });
}
};


//=========== Load the checkout ====================

const loadCheckout = async (req, res) => {
  try {
   
      const userId = req.session.userData;



      const coupon = await Coupons.find(
        { status: true, 'userUsed.used': { $ne: true } }, 
        { couponName: 1, description: 1, minAmount: 1, discount: 1, couponCode: 1, expiryDate: 1, status: 1, userUsed: 1 }
    );
    

// console.log('coupons available at checkout load are:',coupon)


// console.log('this is the user id :',userId)
const couponCode = req.query.coupon || ''

      let userNameforProfile = await User.findById(userId);

      // console.log('this is the user value at loadCheckout :',userNameforProfile);

    let category = await Category.find({'status': 'active'})


    // very important to note that it should be findONe not find
    
  //   const cartData = await Cart.findOne({ userId }).populate({
  //     path: "products.productId",
  //     model: "Product",
  // });
//   const cartData = await Cart.findOne({ userId }).populate({
//     path: "products.productId",
//     model: "Product",
//     populate: {
//         path: "category",
//         model:'Category',
//         populate:{
//           path:'offer',
//           model:'Offer'
//         }
//     }
// });



// const Cart = require('./models/Cart');

// Query the cart collection and populate the products with category and offer information
const cartData = await Cart.findOne({ userId }).populate({
  path: 'products.productId',
  model: 'Product',
});


console.log('cart data at checkout page: ',cartData)

    let states = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
      'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
      'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];


// console.log('this the founded cart at checkout ::',cartFound);
      if (!userId) {
  console.log("user has no session so redirecting to signin Paage from checkout load controller")
  req.flash('message',"Please login to continue")
         return res.redirect("/signin");


      } else if(!cartData){
      console.log('user has no existing cart at checkout so redirected to /cart');
      res.redirect('/cart')
      }
      
      
      else if (cartData && cartData?.products && cartData?.products?.length === 0){

      console.log('user has a cart and has no products so redirected to cart page')

        res.redirect('/cart')
      } else {
        
        const hasZeroQuantity = cartData.products.some(product => product.productId.quantity === 0);
        if (hasZeroQuantity) {
            console.log('At least one product has a quantity of 0, cannot proceed to checkout.');
            req.flash('message',"Either of the product is out of stock")
           return res.redirect('/cart')
        }
      }

  
      // Extract product IDs from cartData
      const productIds = cartData.products.map(product => product.productId._id);




      // Query Product model to get details of the products in the cart
      const productsInCart = await Product.find({ _id: { $in: productIds } }).populate({
        path:'category',
        populate:{
          path:'offer',
        }
      }).populate({
        path:'offer'
      })



// console.log('these are theproducts in cart at checkout page;::',productsInCart)


// Update cartData with applied offers
// this part is to show the available offers in that table below the address part
cartData.products.forEach(cartProduct => {
  const product = productsInCart.find(product => product._id.equals(cartProduct.productId._id));
  if (product) {
      if (product.offer) {
          cartProduct.appliedOffer = product.offer.name;
          cartProduct.appliedOfferDiscount = product.offer.discount;
      } else if (product.category && product.category.offer) {
          cartProduct.appliedOffer = product.category.offer.name;
          cartProduct.appliedOfferDiscount = product.category.offer.name;
      }
  }
});



      // Calculate total price, shipping charges, and grand total
      let totalWithoutDiscount = productsInCart.reduce((total, product) => {
          const price = product.offerprice || product.price;

       

          const quantity = cartData.products.find(item => item.productId.equals(product._id)).quantity;
          return total + price * quantity;
      }, 0);

let totalWithDiscount = totalWithoutDiscount;





console.log('total with discount:',totalWithDiscount);






let couponNameForDisplay;

//this following thing will work in the case of coupon application, it has nothing to do with the offer
if (couponCode) {
  const couponSelected = await Coupons.findOne({ couponCode });

  if (couponSelected) {
    couponNameForDisplay = couponSelected.couponName;
      const discountAmount = couponSelected.discount;
      totalWithDiscount -= discountAmount;

      console.log('afterr coupon application this is the total with discoutn :',totalWithDiscount)
  }
}

let shippingCharges = totalWithDiscount >500 ? 'Free shipping' : '₹40.00'


let grandTotal = shippingCharges === 'Free shipping' ? totalWithDiscount : totalWithDiscount + 40;

console.log('couponname at checkout :',couponNameForDisplay)

          res.render("checkout", { couponNameForDisplay,couponCode,coupon,shippingCharges,grandTotal,cartData,userNameforProfile,category,states,totalWithoutDiscount,totalWithDiscount });
      
  } catch (error) {
    console.log('error occured at load checkout page : ',error);
     res.redirect("/error");
  }
};




//=================  Add address in checkoutPage ==============  
const addAddressAtCheckout = async (req, res) => {
  try {
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
      res.redirect("/checkout");
  } catch (error) {
    console.log('error at the checkout address addition',error)
     res.redirect("/error")
      
  }
};








module.exports = {
  addToCart,
  loadCart,
  deleteCartItem,
  updateCartItemCount,
  loadCheckout,
  addAddressAtCheckout,
};




