let User = require("../model/userModel");
let Product = require("../model/productModel");
let Category = require("../model/categoryModel");

// let getCart = async(req,res)=>{

// let user = req.session.userData;
// let userNameforProfile = await User.findById(user);
// let category = await Category.find({'status':'active'})

//     res.render('cart',{user,category,userNameforProfile})
// }

const cartLoad = async (req, res) => {
  try {
    const userId = req.session.userData;
    let userNameforProfile = await User.findById(userId);
    const user = await User.findById(userId);
    let category = await Category.find({ status: "active" });
    if (user) {
      const productIds = user.cart.map((x) => x.ProductId);
      const product = await Product.find({ _id: { $in: productIds } });

      let totalSubTotal = 0;
      let quantity = 0;

      for (const item of user.cart) {
        totalSubTotal += item.subTotal;
        quantity += item.quantity;
      }

      res.render("cart", {
        product,
        userNameforProfile,
        category,
        cart: user.cart,
        quantity,
        totalSubTotal,
        user,
      });
    }
  } catch (error) {
    console.log("error in getcart function", error);
  }
};

//==============================          add to cart        ===================================

const addToCart = async (req, res) => {
  try {
    console.log("reachedjfdfffffffffffdfdfdffffdf");

    const id = req.query.id;
    console.log('this is the id',id);
    const user = req.session.userData;
    console.log('thisis thedusr ee,',user);
    const product = await Product.findById(id);

    console.log("this is the product from db", product);
    const userData = await User.findById(user);
    console.log("this is the userData from db", userData);

    if (userData) {
      const cartItem = userData.cart.find(
        (item) => String(item.ProductId) === id
      );

      if (cartItem) {
        const updated = await User.updateOne(
          { _id: user, "cart.ProductId": id },
          {
            $inc: {
              "cart.$.quantity": 1,
              "cart.$.subTotal": product.price,
            },
          }
        );
      } else {
        userData.cart.push({
          ProductId: id,
          quantity: 1,
          total: product.price,
          subTotal: product.price,
        });
        const a = await userData.save();
      }
    }

    res.json({ status: true });
  } catch (error) {
    console.log("Error occurred in cart controller addToCart function", error);
  }
};

module.exports = {
  addToCart,
  cartLoad,
};







