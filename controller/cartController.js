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

    let carts = await Cart.findOne({ userId: user })
      .populate("Products.product")
     
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

    // Check product availability
    if (product.quantity < quantity) {
      return res.json({ data: "stockOut", message: "Insufficient stock." });
    }

    // Create or update user's cart
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = new Cart({ userId: userId, Products: [] });
    }

    // Check if the product already exists in the cart
    const existingProductIndex = cart.Products.findIndex(
      (item) => item.product.toString() === productId
    );
    if (existingProductIndex !== -1) {
      // Update quantity of existing product
      cart.Products[existingProductIndex].quantity += quantity;
      cart.Products[existingProductIndex].subTotal =
        cart.Products[existingProductIndex].quantity * product.price;
    } else {
      // Add new product to the cart
      cart.Products.push({
        product: productId,
        price: product.price,
        name: product.name,
        category: product.category,
        brand: product.brand,
        images: product.images,
        // quantity: quantity,
        subTotal: product.price * quantity,
      });
    }

    // Update grand total
    cart.grandTotal = cart.Products.reduce(
      (total, item) => total + item.subTotal,
      0
    );

    // Save the updated cart
    await cart.save();

    return res.json({
      data: true,
      message: "Product added to cart successfully.",
      cart: cart,
    });
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
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove the subproduct from the cart
    cart.Products = cart.Products.filter(item => item._id.toString() !== productId);



    // Save the updated cart
    await cart.save();

 // Check if the cart is empty
 const cartEmpty = cart.Products.length === 0;

 res.status(200).json({ message: 'Subproduct deleted successfully', cartEmpty });

  } catch (error) {
    console.error('Error deleting subproduct from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};








module.exports = {
  addToCart,
  cartLoad,
  deleteCartItem,
};
