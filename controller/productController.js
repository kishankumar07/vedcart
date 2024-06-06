

//---------------  Product management  =================

let Product = require("../model/productModel");
let Category = require("../model/categoryModel");
let Offer = require("../model/offerModel");
let User = require("../model/userModel");
let path = require("path");
let moment = require("moment");
let fs = require("fs");




//=====View Product page=======================
const productListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    let message = req.flash("message");

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const productData = await Product.find()
      .populate({
        path: "category",
        model: "Category",
        populate: {
          path: "offer",
          model: "Offer",
        },
      })
      .populate({
        path: "offer",
        model: "Offer",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      // .sort({ createdAt: -1 });
    // console.log('this  is the product data that will be rendered in the product listing page at admin:',productData)
    const currentDate = new Date();

    // only those offers which are not unblocked and those which are not expired(gt: currentdate) and those which are not upcoming
    const offerData = await Offer.find({
      status: true,
      startingDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    res.render("productListPage", {
      productData,
      totalPages,
      currentPage: page,
      limit,
      offerData,
      moment,
      message,
    });
  } catch (error) {
    console.error(
      "error at loading the product listing page at the admin side :",
      error
    );
    res.status(500).redirect("/error");
  }
};



//========== Load  the add product page =======================
let loadAddProduct = async (req, res) => {
  try {
    let category = await Category.find();
    let message = req.flash("message");
    res.render("addProduct", { category, message });
  } catch (err) {
    console.error("error at add product loading page :", err);
    res.status(500).redirect("/error");
  }
};

//============= Load the prouduct Listing  page ==================
const loadProductSearchQuery = async (req, res) => {
  try {
    let userId = req.session.userData;
    let user = await User.findById(userId);
    const searchQuery = req.query.search || "";
    let products = await Product.find({
      name: { $regex: searchQuery, $options: "i" },
    })
      .populate({
        path: "category",
        populate: {
          path: "offer",
          match: {
            startingDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
          },
        },
      })
      .populate({
        path: "offer",
        match: {
          startingDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        },
      });
    res.json({ products, user });
  } catch (error) {
    console.error("Error loading product listing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


//-----------------------creating new product=================
const createProduct = async (req, res) => {
  try {
    const {
      productName,
      productDesc,
      productPrice,
      productQty,
      productCat,
      productBrand,
      date,
    } = req.body;

    //input validation before proceeding to the case if front end validation doesn't works , in front end i didn't gave the condition to check the validation for checking the selection of date field
    if (
      !productName ||
      !productDesc ||
      !productPrice ||
      !productQty ||
      !productCat ||
      !productBrand ||
      !date
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    //main thing to check before adding a new product
    const productExist = await Product.findOne({
      name: { $regex: new RegExp(productName, "i") },
    });
    if (productExist) {
      return res
        .status(409)
        .json({ success: false, message: "Product already exists..!" });
    }
    //backend validation to check image was uploaded or not
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    // Backend validation to check if at most 3 images were uploaded
    else if (req.files && req.files.length > 3) {
      return res
        .status(400)
        .json({ success: false, message: "Only up to 3 images are allowed" });
    }

    // Ensure proper file format for images like other than images not allowed
    const imageFiles = req.files.filter((file) =>
      file.mimetype.startsWith("image/")
    );
    if (imageFiles.length !== req.files.length) {
      return res
        .status(400)
        .json({ success: false, message: "Only image files are allowed" });
    }

    //if all the validations got passed then save all of them to database
    const newProduct = new Product({
      name: productName,
      description: productDesc,
      price: productPrice,
      quantity: productQty,
      category: productCat,
      brand: productBrand,
      date: date,
      images: req.files.map((file) => file.filename),
    });

    await newProduct.save();

    return res
      .status(201)
      .json({
        success: true,
        message: "Product created successfully",
        productId: newProduct._id,
      });
  } catch (error) {
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
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("error at deleting a product at admin product view:", error);
    res.status(500).redirect("/error");
  }
};



//======edit product-===========================
const editProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findOne({ _id: id })
      .populate({
        path: "category",
        model: "Category",
      })
      .exec();
    let category = await Category.find({});

    if (product) {
      res.render("editProduct", { product, category, moment });
    } else {
      req.flash("message", "Product does not exists");
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log("Error occurred in editProduct function", error);
    res.redirect("/error");
  }
};



// ==========  toggle to List or unlist the product==================

const toggleBlockStatusProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    product.status = product.status === "active" ? "blocked" : "active";
    await product.save();
    res
      .status(200)
      .json({ success: true, message: "Product status updated successfully" });
  } catch (err) {
    console.error("Error toggling user  block status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



//after editing the product==============================
const productEdited = async (req, res) => {
  try {
    const { id, productName } = req.body;
    const productData = req.body;

    const productExist = await Product.findOne({
      name: { $regex: new RegExp(productName, "i") },
    });

    if (productExist && productExist._id != id) {
      console.log(
        `this is the existing product ${productExist} and its id is ${productExist._id} and the comparison id is ${id} if these both are same then this error message wouldn't have come`
      );
      return res.status(400).json({ message: "Product already exists" }); //
    }

    const existingImages = JSON.parse(productData.existingImages);

    const imageFilenames = existingImages.map((imageUrl) => {
      const parts = imageUrl.split("/");
      return parts[parts.length - 1];
    });

    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const currentImageCount = imageFilenames.length;
    const newImageCount = req.files ? req.files.length : 0;
    const totalImageCount = currentImageCount + newImageCount;

    if (totalImageCount > 3) {
      return res.status(400).json({ message: "Select upto 3 images" });
    }

    let updateData = {
      name: productData.productName,
      description: productData.productDesc,
      brand: productData.productBrand,
      price: productData.productPrice,
      date: productData.date,
      quantity: productData.productQty,
      category: productData.productCat,
    };

    // to save the existing images
    if (imageFilenames && imageFilenames.length > 0) {
      updateData.images = imageFilenames;
    }

    // to save new images to existing ones
    if (req.files && req.files.length > 0) {
      const newFilesToPush = req.files.map((file) => file.filename);
      updateData.images = [...(updateData.images || []), ...newFilesToPush];
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    console.log("this is the updaetdProduct at the database: ", updatedProduct);

    res.status(200).json(true);
  } catch (error) {
    console.log("Error occurred in productEdited function", error);
    res.redirect("/error");
  }
};



//============= deleting a image ==============================
const deleteimage = async (req, res) => {
  try {
    const index = parseInt(req.query.index, 10);
    const product = await Product.findOne({ _id: req.query.id });
    if (!product) {
      return res.status(404).send("Product not found");
    }
    if (index >= 0 && index <= product.images.length) {
      const filenameToDelete = product.images[index];
      const filePath = path.join(
        __dirname,
        "../public/adminAssets/imgs/category",
        filenameToDelete
      );
      fs.unlinkSync(filePath);
      product.images.splice(index, 1);
      await product.save();
      res.status(200).json({ message: "Image deleted successfully" });
    } else {
      console.log("index inside the else:", index);
      res.status(400).send("Invalid index");
    }
  } catch (error) {
    console.log(
      "error at deleting the image at the product page:",
      error.message
    );
    res.status(500).redirect("/error");
  }
};

// main prouct search -----------------------------------
let mainProductSearch = async(req,res)=>{
  try{

    const query = req.query.q;
    if (!query) {
        return res.json([]);
    }

    const products = await Product.find({ 
      name: { $regex: query, $options: 'i' },
      status: 'active'
  }).limit(10).select('name images'); 


 const processedProducts = products.map(product => ({
  _id: product._id,
  name: product.name,
  image: product.images.length > 0 ? product.images[0] : null
}));



  res.json(processedProducts);
  }catch(err){
    console.log('error at the main product search at the header :',err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



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
  mainProductSearch
};
