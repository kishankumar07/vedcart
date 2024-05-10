let Product = require("../model/productModel");
let Category = require("../model/categoryModel");
let Offer = require('../model/offerModel');
let User = require("../model/userModel");
let path = require("path");
let moment = require("moment");

let fs = require("fs");
let sharp = require("sharp");

//=====View Product page=======================

const productListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    const productData = await Product.find()
    .populate({
      path: "category",
      model: "Category",
      populate: { // Populate the offer field for the category
        path: "offer",
        model: "Offer"
      }
    })
    .populate({
      path: "offer",
      model: "Offer"
    })
    .skip((page - 1) * limit)
    .limit(limit);
  

    // console.log('this  is the product data :',productData)

    const currentDate = new Date();

    const offerData = await Offer.find({
    status: true,
    startingDate: { $lte: currentDate },
    endDate: { $gte: currentDate }
    })




    res.render("productListPage", {
      productData,
      totalPages,
      currentPage: page,
      limit,
      offerData,
      moment,
    });
  } catch (error) {
    res.redirect("/error");
  }
};

//========== Load  the add product page =======================

let loadAddProduct = async (req, res) => {
  try {
    let category = await Category.find();
    let message = req.flash("message");
    // console.log('this is the category found at add proudct page :',category)
    res.render("addProduct", { category, message });
  } catch (err) {
    console.log("error at add product loading page :", err);
    res.redirect("/error");
  }
};

//============= Load the prouduct Listing  page ==================
const loadProductSearchQuery = async (req, res) => {
  try {
    let userId = req.session.userData;
    let user = await User.findById(userId)
    const searchQuery = req.query.search || "";
    
    
    // console.log('search query :',searchQuery)
    let products = await Product.find({
      name: { $regex: searchQuery, $options: "i" },
    })
    .populate({
      path: 'category',
      populate: {
        path: 'offer',
        match: {
          startingDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }
      }
    })
    .populate({
      path: 'offer',
      match: {
        startingDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }
    })
// console.log('thse will be the responses at search proudcts at shop page: ',products)

// console.log('thse will be the responses of user at search proudcts at shop page: ',user)

    res.json({ products,user });
  } catch (error) {
    console.error("Error loading product listing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//creating new product========================
const createProduct = async (req, res) => {
  try {
    const { productName, productDesc, productPrice, productQty, productCat, productBrand, date } = req.body;

// console.log('this is the formdata :',req.body)
// console.log('req.body is :',req.body)
// console.log('images received : ',req?.files || req?.file)

    // Check if product with the same name already exists
    const productExist = await Product.findOne({ name: productName });

    if (!productExist) {
      // Create new product
      const newProduct = new Product({
        name: productName,
        description: productDesc,
        price: productPrice,
        quantity: productQty,
        category: productCat,
        brand: productBrand,
        date: date,
        images: req.files.map(file => file.filename) // Assuming req.files contains uploaded images
      });

      // Save the product to the database
      await newProduct.save();

     return res.status(200).json(true)
      
    } else {
      // Product already exists
      console.log("Product already exists.");
      return  res.status(505).json(false,{message:'product already exists'})
     
    }
  } catch (error) {
    // Handle errors
    console.log("Error occurred in createProduct function:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



//delete product====================
const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.redirect('/error')
    }
    res.redirect("/admin/product");
  } catch (error) {
    console.log("deleteProduct error",error);
  }
};

//======edit product-===========================
const editProduct = async (req, res) => {
  try {
    // console.log('reached here at edit product page :');
    const { id } = req.query;

    const product = await Product.findOne({ _id: id })
      .populate({
        path: "category",
        model: "Category",
      })
      .exec();
    let category = await Category.find({});

    // console.log(
    //   "this is the product image or the existing images found at edit Product :",
    //   product.images
    // );

    // console.log("this is the rendering products : ", product);
    if (product) {
      res.render("editProduct", { product, category, moment });
    } else {
      console.log('product not found for admin edit product')
      res.redirect('/error');
    }
  } catch (error) {
    console.log("Error occurred in editProduct function", error);
    res.redirect('/error') // Send a suitable error response
  }
};

// ==========  toggle to List or unlist the product==================

const toggleBlockStatusProduct = async (req, res) => {
  try {
    const productId = req.query.id;

    // console.log('this is the product id :',productId);
    // console.log('this si teh type of  product forund :',typeof productId);
    const product = await Product.findOne({ _id: productId });

    // console.log('this is the product id :',product);

    if (!product) {
      return res.json({ value: "noRecord" });
    }

    product.status = product.status === "active" ? "blocked" : "active";

    await product.save();
    // console.log("this was saved in db", product);

    res.json({ value: true });
  } catch (err) {
    console.error("Error toggling user  block status:", err);
    res.json({ value: false });
  }
};

//after editing the product==============================
const productEdited = async (req, res) => {
  try {
    const id = req.body.id;
    const productData = req.body;


console.log('this is the id :',id)

   

    console.log("product data at body rec : ", productData);

    // Parse existingImages JSON string to get the array of existing image URLs
    const existingImages = JSON.parse(productData.existingImages);

// Extract filenames from image URLs
const imageFilenames = existingImages.map(imageUrl => {
  // Split the URL by '/' to get the filename
  const parts = imageUrl.split('/');
  // Return the last part (filename)
  return parts[parts.length - 1];
});

console.log('image filenames are:', imageFilenames);



    let updateData = {
      name: productData.productName,
      description: productData.productDesc,
      brand: productData.productBrand,
      price: productData.productPrice,
      date: productData.date,
      quantity: productData.productQty,
      category: productData.productCat,
    };


    // Handle existing images
    // Ensure it's an array

    if (imageFilenames && imageFilenames.length > 0) {
      updateData.images = imageFilenames;
    }

    // Handle image upload
    if (req.files && req.files.length > 0) {
      const newFilesToPush = req.files.map((file) => file.filename);
      updateData.images = [...(updateData.images || []), ...newFilesToPush];
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

console.log('this is the updaetdProduct at the database: ',updatedProduct)


   res.status(200).json(true);
  } catch (error) {
    console.log("Error occurred in productEdited function", error);
    res.redirect("/error");
  }
};

//============= deleting a image ==============================
const deleteimage = async (req, res) => {
  try {
    const index = req.query.index;
    const product = await Product.findOne({ _id: req.query.id });

    //checking product
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Check index
    if (index >= 0 && index < product.images.length) {
      const filenameToDelete = product.images[index];
      const filePath = path.join(
        __dirname,
        "../public/adminAssets/imgs/category",
        filenameToDelete
      );

      // Delete the file
      fs.unlinkSync(filePath);
      // fs.promises.unlink(filePath)

      await Product.findByIdAndUpdate(product._id, {
        $pull: { images: filenameToDelete },
      });
      res.redirect(`/admin/editproduct?id=${req.query.id}`);
    } else {
      res.status(400).send("Invalid index");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
    res.status(500);
  }
};

module.exports = {
  loadAddProduct,
  loadProductSearchQuery,
  createProduct,
  deleteProduct,
  editProduct,
  productEdited,
  deleteimage,
  productListPage,
  toggleBlockStatusProduct,
};














