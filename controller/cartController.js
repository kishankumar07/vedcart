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
         let message = req.flash('message');
         const { userNameforProfile, cart, categoriesWithProducts, totalPriceOfCartProducts,userId } = res.locals.commonData;
   
    let [category , cartData] = await Promise.all([
      Category.find({status:'active'}),
      Cart.findOne({userId}).populate({
        path:"products.productId",
        model:'Product',
      })
    ]);
       
    

      if (!cartData) {
        console.log('cart page loaded with no cart data 1st case')
         return res.render("cart", { cartData: { products: [] },userNameforProfile,category, cart, categoriesWithProducts, totalPriceOfCartProducts,userId });
      }

      const productsWithZeroStock = cartData.products.filter(product => product.quantity === 0);



      // case if there is products in the cart at least one
      if (cartData.products.length > 0) {
          const productIds = cartData.products.map(product => product.productId._id)

          const productsDetailsInCart = await Product.find({ _id: { $in: productIds } }).populate({
            path: 'category',
            populate: {
              path: 'offer',
            }
          }).populate({
            path: 'offer'
          });




// Update cartData with applied offers
cartData.products.forEach(cartProduct => {
  const product = productsDetailsInCart.find(product => product._id.equals(cartProduct.productId._id));
  if (product) {
    const chosenOffer = chooseOffer(product.offer, product.category.offer);
    if (chosenOffer) {
      const discount = chosenOffer.discount ? Math.round(product.price * (chosenOffer.discount / 100)) : 0;
      cartProduct.appliedOffer = chosenOffer.name;
      cartProduct.appliedOfferDiscount = chosenOffer.discount;
      cartProduct.offerprice = product.price - discount;
      console.log(`Applied offer: ${cartProduct.appliedOffer}, Discount: ${cartProduct.appliedOfferDiscount}, Offer price: ${cartProduct.offerprice}`);
    } else {
      cartProduct.offerprice = product.price;
      console.log(`No offer applied. Original price: ${cartProduct.offerprice}`);
    }
  } else {
    req.flash('message', "Product does not exist");
    return res.redirect('/cart');
  }
});


      // Calculate subtotal, shipping charges, and grand total
        const subtotalWithNoShippingCharge = cartData.products.reduce((total, product) => {
          const price = product.offerprice || product.productId.price;
          return total + price * product.quantity;
        }, 0);



let shippingCharges = subtotalWithNoShippingCharge > 500 ? 'free shipping' :'₹40.00'

let grandTotalForCheckOut = subtotalWithNoShippingCharge > 500 ? subtotalWithNoShippingCharge : subtotalWithNoShippingCharge + 40;

          res.render("cart", { categoriesWithProducts,cart,totalPriceOfCartProducts,userId,cartData,userNameforProfile,category,shippingCharges,grandTotalForCheckOut,subtotalWithNoShippingCharge,message,productsWithZeroStock });

      } else {
        
          res.render("cart", { cart,totalPriceOfCartProducts,cartData,userNameforProfile,category,categoriesWithProducts,userId });
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






// Helper function to choose the appropriate offer for a product
const chooseOffer = (productOffer, categoryOffer) => {
  if (!productOffer && !categoryOffer) return null;
  if (!productOffer) return categoryOffer;
  if (!categoryOffer) return productOffer;
  return productOffer.discount > categoryOffer.discount ? productOffer : categoryOffer;
};

//=========== Load the checkout ====================

const loadCheckout = async (req, res) => {
  try {
    const { userNameforProfile, cart, categoriesWithProducts, totalPriceOfCartProducts, userId } = res.locals.commonData;
    const couponCode = req.query.coupon || '';

    if (!userId) {
      console.log("User has no session, redirecting to signin page from checkout load controller");
      req.flash('message', "Please login to continue");
      return res.redirect("/signin");
    }

    // Fetch categories, cart data, and coupons concurrently
    const [category, cartData, coupons] = await Promise.all([
      Category.find({ status: 'active' }),
      Cart.findOne({ userId }).populate({
        path: 'products.productId',
        model: 'Product',
      }),
      Coupons.find(
        { status: true, 'userUsed.used': { $ne: true } },
        { couponName: 1, description: 1, minAmount: 1, discount: 1, couponCode: 1, expiryDate: 1, status: 1, userUsed: 1 }
      )
    ]);

    if (!cartData) {
      console.log('User has no existing cart at checkout, redirecting to /cart');
      return res.redirect('/cart');
    }

    if (cartData.products.length === 0) {
      console.log('User has a cart but no products, redirecting to cart page');
      return res.redirect('/cart');
    }

    const hasZeroQuantity = cartData.products.some(product => product.productId.quantity === 0);
    if (hasZeroQuantity) {
      console.log('At least one product has a quantity of 0, cannot proceed to checkout.');
      req.flash('message', "Either of the product is out of stock");
      return res.redirect('/cart');
    }

    const productIds = cartData.products.map(product => product.productId._id);

    // Fetch product details concurrently
    const productsDetailsInCart = await Product.find({ _id: { $in: productIds } }).populate({
      path: 'category',
      populate: {
        path: 'offer',
      }
    }).populate({
      path: 'offer'
    });

    // Update cartData with applied offers
    cartData.products.forEach(cartProduct => {
      const product = productsDetailsInCart.find(product => product._id.equals(cartProduct.productId._id));
      if (product) {
        const chosenOffer = chooseOffer(product.offer, product.category.offer);
        if (chosenOffer) {
          const discount = chosenOffer.discount ? Math.round(product.price * (chosenOffer.discount / 100)) : 0;
          cartProduct.appliedOffer = chosenOffer.name;
          cartProduct.appliedOfferDiscount = chosenOffer.discount;
          cartProduct.productId.offerprice = product.price - discount;
          console.log(`Applied offer: ${cartProduct.appliedOffer}, Discount: ${cartProduct.appliedOfferDiscount}, Offer price: ${cartProduct.productId.offerprice}`);
        } else {
          cartProduct.productId.offerprice = product.price;
          console.log(`No offer applied. Original price: ${cartProduct.productId.offerprice}`);
        }
      } else {
        req.flash('message', "Product does not exist");
        return res.redirect('/cart');
      }
    });

    // Calculate total price, shipping charges, and grand total
    let totalWithoutDiscount = cartData.products.reduce((total, product) => {
      const price = product.productId.offerprice || product.productId.price;
      return total + price * product.quantity;
    }, 0);

    let totalWithDiscount = totalWithoutDiscount;
    let couponNameForDisplay;

    if (couponCode) {
      const couponSelected = await Coupons.findOne({ couponCode });
      if (couponSelected) {
        couponNameForDisplay = couponSelected.couponName;
        const discountAmount = couponSelected.discount;
        totalWithDiscount -= discountAmount;
        console.log('After coupon application, this is the total with discount:', totalWithDiscount);
      }
    }

    let shippingCharges = totalWithDiscount > 500 ? 'Free shipping' : '₹40.00';
    let grandTotal = shippingCharges === 'Free shipping' ? totalWithDiscount : totalWithDiscount + 40;

    console.log('Coupon name at checkout:', couponNameForDisplay);

    const states = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
      'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
      'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    res.render("checkout", {
      couponNameForDisplay,
      cart,
      categoriesWithProducts,
      couponCode,
      coupon:coupons,
      shippingCharges,
      grandTotal,
      cartData,
      userNameforProfile,
      category,
      states,
      totalPriceOfCartProducts,
      totalWithoutDiscount,
      totalWithDiscount,
      userId
    });
  } catch (error) {
    console.log('Error occurred at load checkout page:', error);
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




