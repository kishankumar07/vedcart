let Product = require("../model/productModel");
let Category = require("../model/categoryModel");
let User = require("../model/userModel");

//=====View Product page=======================
let allProducts = async (req, res) => {
  try {
    const limit = 8; // Number of products per page
    const page = req.query.page ? parseInt(req.query.page) : 1; // Current page number
    const product = await Product.find({})
      .skip((page - 1) * limit) // Skip the results from previous pages
      .limit(limit); // Limit the number of results to "limit"

    const totalProduct = await Product.countDocuments();
    const totalPages = Math.ceil(totalProduct / limit);
    res.render("product", { product, page, totalPages, limit });
  } catch (err) {
    console.log(err);
  }
};

//============Add product============================
const addProduct = async (req, res) => {
  try {
    const category = await Category.find(); // Using MongoDB as an example
    res.render("addProduct", { category });
  } catch (error) {
    console.log("Error in addProduct function", error);
  }
};

//Unlisting a product===================================

//creating new product========================

const createProduct = async (req, res) => {
  try {

   

    const { name } = req.body;
    const productData = req.body;

    const productExist = await Product.findOne({ name });
   
    if (!productExist) {
      
      const caseInsensitiveProductExist = await Product.findOne({
        name: { $regex: new RegExp("^" + name + "$", "i") },
      });
      if (caseInsensitiveProductExist) {
       
        res.redirect("/admin/createProduct");
      } else {
       
        const images = [];
        if (req.files && req.files.length > 0) {
          for (let i = 0; i < req.files.length; i++) {
            images.push(req.files[i].filename);
          }
        }
       
        const newProduct = new Product({
          name: productData.name,
          description: productData.description,
          brand: productData.brand,

          price: productData.price,

          quantity: productData.quantity,
          category: productData.category,

          images: images,
        });
       
        const pr = await newProduct.save();


     
        res.redirect("/admin/product");
      }
    } else {
     
      console.log("Product already exists");
      res.redirect("/admin/addProduct");
    }
  } catch (error) {
    console.log("Error happened in createProduct function", error);
    // Added error response
  }
};
//delete product====================
const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.redirect("/admin/product");
  } catch (error) {
    console.log("deleteProduct error");
  }
};
//======edit product-===========================

const editProduct = async (req, res) => {
  try {
    const { id } = req.query;

    const product = await Product.findById(id);
    const category = await Category.find();

    if (product) {
      res.render("editProduct", { product, category });
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.log("Error occurred in editProduct function", error);
    res.status(500).send("Server Error"); // Send a suitable error response
  }
};

//==unlist the product=------------------
const unlistProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const currentPage = req.query.page || 1;
    const productExists = await Product.findById(id);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.updateOne(
      { _id: productExists._id },
      { $set: { status: "blocked" } }
    );

    res.redirect(`/admin/product?page=${currentPage}`);
  } catch (error) {
    console.log("error occurred in unlistProduct function");
  }
};

//===========product listing=================
const listProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const currentPage = req.query.page || 1;

    const productExists = await Product.findById(id);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.updateOne(
      { _id: productExists._id },
      { $set: { status: "active" } }
    );

    res.redirect(`/admin/product?page=${currentPage }`);
  } catch (error) {
    console.log("error occurred in listProduct function");
  }
};

//after editing the product==============================
const productEdited = async (req, res) => {
  try {
    const id = req.body.id;
    const productData = req.body;

    let updateData = {
      name: productData.name,
      description: productData.description,
      brand: productData.brand,

      price: productData.price,

      quantity: productData.quantity,

      category: productData.category,
    };

    // Handle image upload
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.filename);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.redirect("/admin/product");
  } catch (error) {
    console.log("Error occurred in productEdited function", error);
    res.status(500).send("Server Error");
  }
};










module.exports = {
  allProducts,
  addProduct,
  createProduct,
  unlistProduct,
  listProduct,
  createProduct,
  deleteProduct,
  editProduct,
  productEdited,
  // deleteimage
  
};
