let User = require("../model/userModel");
let Product = require("../model/productModel");
let Cart = require("../model/cartModel");
let Category = require("../model/categoryModel");

// let getCart = async(req,res)=>{

// let user = req.session.userData;
// let userNameforProfile = await User.findById(user);
// let category = await Category.find({'status':'active'})

//     res.render('cart',{user,category,userNameforProfile})
// }

//===========  Loading the cart page========================

const cartLoad = async (req, res) => {
  try {
    let user = req.session.userData;
    let userNameforProfile = await User.findById(user);
    let category = await Category.find({});

    let carts = await Cart.findOne({ userId: user }).populate(
      "Products.product"
    );
    console.log('cart page loaed wti :::',carts);

    // console.log('this is the cart page: ',carts);
    res.render("cart", { user, category, cart: carts, userNameforProfile });
  } catch (error) {
    console.error("Error loading cart:", error);
    res.redirect("/error");
  }
};

// const cartLoad = async (req, res) => {
//     try {
//       let user = req.session.userData;
//       let userNameforProfile = await User.findById(user);
//       let category = await Category.find({});

// //this is the  crucial part to be considered when you needa cart of that specific user
//       let carts = await Cart.find({ userId: user }).populate('Products.product');

//     // let carts = await Cart.find({})
//       let allProducts = carts.reduce((acc, cart) => {
//         acc.push(...cart.Products);
//         return acc;
//       }, []);

//       res.render('cart', { user, category, allProducts, userNameforProfile });
//     } catch (error) {
//       console.error('Error loading cart:', error);
//       res.redirect('/error');
//     }
//   };

//==========================    add to cart   ==========================

// Controller function to add a product to the cart
const addToCart = async (req, res) => {
  try {
    let userId = req.session.userData;

    if (!userId) {
      return res.json({
        data: "noUser",
        message: "You need to sign in to add products to your cart.",
      });
    }

    // Retrieve product details
    const { productId, quantity } = req.body;

    // Retrieve product from the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ data: "notFound", message: "Product not found." });
    }

    // this means stock of the product right now is zero
    if (product.quantity < quantity) {
      return res.json({ data: "stockOut", message: "Insufficient stock." });
    }

    
    const cartFind = await Cart.findOne({userId});

    if(cartFind){

      const existingProduct = cartFind.Products.find(   // findOne is more suitable when you're querying the entire collection for a single document based on some conditions. Here looking for a product within an array, so find is appropriate.
      (prod) => prod.name === product.name);

        console.log('user already has cart and checking whether the cart product and selected product are both same : : ',existingProduct);

        if (existingProduct) {
          // Product is already in the cart, increase the quantity
          if(req.query.cart)
          {
            console.log('the query came from cart page ');

            existingProduct.quantity = parseInt(quantity);
            
          }
          else
          {
            console.log('query came from non-cart page');

            existingProduct.quantity += parseInt(quantity);
          }
          
          
         
          existingProduct.total = existingProduct.quantity *existingProduct.price
          
        }else {
        console.log('cart is there for user but the selected product is not there');
          // Product is not in the cart, add it to the product array
          cartFind.Products.push({
            products: product._id,
            price: product.price,
            name: product.name,
            quantity: quantity,
            total:quantity* product.price
          });
        }
        
        await cartFind.save();




    }else {
      console.log('user has no cart and this is his first product');
      // User does not have a cart document, creating a new one
      const cartAdd = new Cart({
        userId: userId,
        Products: [
          {
            products: product._id,
            price: product.price,
            name: product.name,
            quantity: quantity,
            total:product.price*quantity
          }
        ],
       
      });

      

      await cartAdd.save();
    }

   

    return res.json({ data: true, message: "Added" });

  } catch (error) {
    console.error("Error adding product to cart:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Controller function to delete a subproduct from the cart
let deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.body;
    // console.log('thsi is the product id::',typeof productId);
    // Assuming userId is available in req.user, you might need to adjust this based on your authentication logic
    const userId = req.user._id;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the subproduct from the cart
    cart.Products = cart.Products.filter(
      (item) => item._id.toString() !== productId
    );

    // Save the updated cart
    await cart.save();

    // Check if the cart is empty
    const cartEmpty = cart.Products.length === 0;

    res
      .status(200)
      .json({ message: "Subproduct deleted successfully", cartEmpty });
  } catch (error) {
    console.error("Error deleting subproduct from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update the cart quantity==================

// Helper function to calculate subtotal
const calculateSubtotal = (products) => {
  console.log("reached calculateSubtotal :");

  return products.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

// Helper function to calculate cart quantity
const calculateCartQuantity = (products) => {
  console.log("reached calculateCartQuantity :");

  return products.reduce((total, item) => total + item.quantity, 0);
};




const updateCartItem = async (req, res) => {
  try {
    const { productId, newQuantity } = req.body;
    const userId = req.session.userData;

   
    console.log("this is the productId:", productId);
    console.log('and its type is ',typeof productId);
    console.log("this is the new quantity : ", newQuantity);

    let cart = await Cart.findOne({ userId: userId });
    console.log("this is the cart :", cart);
    // Find the cart item with the given productId
    const cartItemIndex = cart.Products.findIndex(
      (item) => item.product.toString() === productId
    );

   


    console.log("this is the cartItem index :", cartItemIndex);

    if (cartItemIndex !== -1) {
      // Update the quantity of the existing cart item
      cart.Products[cartItemIndex].quantity = newQuantity;
    }

    // Calculate subtotal
    const subtotal = calculateSubtotal(cart.Products);

    console.log("the subtotal: ", subtotal);

    // Update grand total
    cart.grandTotal = subtotal;

    // Save the updated cart
    await cart.save();

    // Send response with updated subtotal and cart quantity
    res.json({
      success: true,
      subTotal: subtotal,
      cartQuantity: calculateCartQuantity(cart.Products),
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  addToCart,
  cartLoad,
  deleteCartItem,
  updateCartItem,
};




