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

const loadCart = async (req, res) => {
  try {
      const userId = req.session.userData;

      let userNameforProfile = await User.findById(userId);

      let category = await Category.find({ status: "active" });
      
      const cartData = await Cart.findOne({ userId: userId }).populate({
          path: "products.productId",
          model: "Product",
      });
      // console.log('this is the cartData when rendering the cart page::',cartData);

      if (!cartData) {
          res.render("cart", { cartData: { products: [] },userNameforProfile,category });
          return;
      }

      if (cartData.products.length > 0) {
          // cartData.products.forEach((product) => {
          //     const productPrice =  product.productPrice;
          //     product.productTotalPrice = productPrice * product.quantity;
          // });

          const subtotalWithNoShippingCharge = cartData.products.reduce((total, product) => total + product.totalPrice, 0);


let shippingCharges = subtotalWithNoShippingCharge > 500 ? 'free shipping' :'₹40.00'

let grandTotalForCheckOut = subtotalWithNoShippingCharge > 500 ? subtotalWithNoShippingCharge : subtotalWithNoShippingCharge + 40;


// console.log('shipping charge  :: ',shippingCharges);

       



// console.log('this is the grandTotal for checkout ::',grandTotalForCheckOut);

          res.render("cart", { userId,cartData,userNameforProfile,category,shippingCharges,grandTotalForCheckOut,subtotalWithNoShippingCharge });

      } else {
          res.render("cart", { cartData,userNameforProfile,category });
      }
  } catch (error) {
    console.log('error loading  at catch block ,cart page :::',error);
      res.redirect("/error")
  }
};










const cartLoad = async (req, res) => {
  try {
   
    let Total = 0;
    let shippingCharges = 0;
    let grandtotal = 0;
    let cartNotEmpty = 0;
let userId = req.session.userData;

const userNameforProfile = await User.findById(userId);

// console.log('this is the user we are talking',userNameforProfile);

let category = await Category.find({ status: "active" });

let cart = await Cart.findOne({userId}).populate({
  path:'Products.products'
}).exec();

// console.log('populated cart of the user is :::',cart);



// console.log('this is the cart of this logged user',cart.Products);


let totalproprice = [];
let proprice = [];

if (cart && cart.Products && cart.Products.length > 0) {
  cartNotEmpty = 1;

  for (const prod of cart.Products) {
    let productPrice = parseFloat(prod.total);
    let individualprice = prod.price;

    Total = Total + parseFloat(productPrice);
    totalproprice.push(parseFloat(productPrice));
    proprice.push(parseFloat(individualprice));

    if (prod.products.quantity === 0) {
      await cart.updateOne({ userId: userId }, { $pull: { 'Products': { 'products': prod.products } } });
      totalproprice.pop();
      proprice.pop();
    }
  }

console.log('this is the totalproprice',totalproprice);
console.log('this is the proprice',proprice);


  cart.Products = cart.Products.filter((product) => product.products.quantity != 0);

  if (Total < 500) {
    shippingCharges = 40;
  }

  grandtotal = Total + shippingCharges;
console.log('grand total is ::',grandtotal);

res.render("cart", { userNameforProfile,cartNotEmpty,userId, category,cart,shippingCharges,Total,grandtotal,totalproprice,proprice });

}else{
  res.render("cart", { userNameforProfile,cartNotEmpty,userId, category,cart });
}



  }

   catch (error) {
    console.error("Error loading cart:", error);
    res.redirect("/error");
  }
};





const addToCart = async (req, res) => {
  try {
      const productId = req.params.productId;
      const userId = req.session.userData;
      const quantity = parseInt(req.params.quantity);

      // console.log('this is the userId',userId);
        // user logged or not checking 
        if (!userId) {
          return res.status(401).json({ error: "Unauthorized - User not authenticated" });
      }

      const productFound = await Product.findOne({ _id: productId });

      const cart = await Cart.findOne({ userId });

      if (productFound) {

        //if the session logged has cart
        if (cart) {
            const existingProductIndex = cart.products.findIndex(
                (item) => item.productId.toString() === productId
            );


            //if the product already exists in the cart ??
            if (existingProductIndex !== -1) {
                const existingProduct = cart.products[existingProductIndex];

                existingProduct.quantity += quantity;

                existingProduct.totalPrice = existingProduct.quantity * existingProduct.productPrice;

                //just add that new product to the existing array
            } else {
                const productPrice =  productFound.price
                const totalPrice = quantity * productPrice

                cart.products.push({
                    productId: productId,
                    quantity: quantity,       
                    productPrice: productPrice,
                    totalPrice: totalPrice,
                   name: productFound.name
                });
            }

            await cart.save();

            //if the user has no existing cart ??
        } else {
            const productPrice = productFound.price
            const totalPrice = quantity * productPrice

            const newCart = new Cart({
                userId: userId,
                products: [
                    {
                        productId: productId,                      
                        quantity: quantity,
                        productPrice: productPrice,
                        totalPrice: totalPrice,   
                        name: productFound.name                     
                    },
                ],
            });

            await newCart.save();
        }

        return res.status(200).json({ message: "Product added to cart successfully." });
    } else {
        return res.status(400).json({ error: "Invalid product." });
    }
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
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
const addCart = async (req, res) => {
  try {

    // console.log('add to cart initiation started');

    let userId = req.session.userData;

    if (!userId) {
      return res.json({
        data: "noUser",
        message: "You need to sign in to add products to your cart.",
      });
    }

    // Retrieve product details
    const {productId,quantity,cart} = req.body;

    console.log('this is the productId', productId);
    console.log('this is the quantity', quantity);
    console.log('this is the cart', cart);


    // Retrieve product from the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ data: "notFound", message: "Product not found." });
    }

    // this means stock of the product right now is zero
    if (product.quantity < quantity) {
      return res.json({ data: "stockOut", message: "Insufficient stock." });
    }

    
// // Deduct the quantity from the product's stock
// product.quantity -= quantity;

// // Save the updated product information back to the database
// await product.save();




    const cartFind = await Cart.findOne({userId});

    if(cartFind){

      const existingProduct = cartFind.Products.find(
        (prod) => prod.products.toString() === product._id.toString()
      );
      

        // console.log('user already has cart and checking whether the cart product and selected product are both same : : ',existingProduct);

        if (existingProduct) {
          // Product is already in the cart, increase the quantity
          existingProduct.quantity += parseInt(quantity); // Increment the quantity
          existingProduct.total = existingProduct.quantity * existingProduct.price;
        } else {
          // Product is not in the cart, add it to the product array
          cartFind.Products.push({
            products: product._id,
            price: product.price,
            name: product.name,
            quantity: quantity,
            total: quantity * product.price,
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
      .json({ message: "Subproduct deleted successfully", cartEmpty });
  } catch (error) {
    console.error("Error deleting subproduct from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update the cart quantity==================





//================updating the cart item============================

const updateCartItemCount = async (req, res) => {
  try {
    const userId = req.session.userData;
    const { cartId, productId, quantity } = req.body;

    const existingCart = await Cart.findById(cartId);

    if (!existingCart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const productToUpdate = existingCart.products.find((proId) => proId.productId.equals(productId));

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




const loadCheckout = async (req, res) => {
  try {
      const userId = req.session.userData;
      let userNameforProfile = await User.findById(userId);
    let category = await Category.find({'status': 'active'})

      if (!userId) {
          res.redirect("/");
      } else {
          const userDetail = await User.findById(userId);
          const cartData = await Cart.findOne({ userId }).populate({
              path: "products.productId",
              model: "Product",
          });

          res.render("checkout", { userDetail, cartData,userNameforProfile,category });
      }
  } catch (error) {
    console.log('error occured at load checkout page : ',error);
     res.redirect("/error");
  }
};



















module.exports = {
  addToCart,
  loadCart,
  deleteCartItem,
  updateCartItemCount,
  loadCheckout,
};




