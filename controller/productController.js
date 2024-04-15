let Product = require("../model/productModel");
let Category = require("../model/categoryModel");
let User = require("../model/userModel");
let path = require('path')

let fs = require('fs')
let sharp = require('sharp');

//=====View Product page=======================

const productListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const productData = await Product.find()
      // .populate('offer')
      .skip((page - 1) * limit)
      .limit(limit);

    const currentDate = new Date();

    // const offers = await Offer.find({
    // status: true,
    // startingDate: { $lte: currentDate },
    // expiryDate: { $gte: currentDate }
    // })
    res.render("productListPage", {
      productData,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    res.redirect("/error");
  }
};

//========== Load  the add product page =======================

let loadAddProduct = async(req,res)=>{
  try{

    let category = await Category.find()
    let message = req.flash('message');
    // console.log('this is the category found at add proudct page :',category)
    res.render('addProduct',{category,message})
  }catch(err){
    console.log('error at add product loading page :',err)
    res.redirect('/error')
  }
}


//============= Load the prouduct Listing  page ==================
const loadProductSearchQuery = async (req, res) => {
  try {
   
    const searchQuery = req.query.search || '';
    const products = await Product.find({ name: { $regex: searchQuery, $options: 'i' } });
   
    res.json({ products });
  } catch (error) {
    console.error('Error loading product listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




//creating new product========================

const createProduct = async (req, res) => {
  try {
    const { name } = req.body;
    const productData = req.body;
    
    // console.log('this is the req.files associated with multer:', req.files);

    const productExist = await Product.findOne({ name });

    if (!productExist) {
     
      const caseInsensitiveProductExist = await Product.findOne({
        name: { $regex: new RegExp("^" + name + "$", "i") },
      });
      if (caseInsensitiveProductExist) {
console.log('case insensitive search for product found : ',caseInsensitiveProductExist)
       req.flash('message','Product already exists')
        res.redirect("/admin/addProduct");
      } else {

       
        const images = [];
        if (req.files && req.files.length > 0) {
          console.log('5');
          for (let i = 0; i < req.files.length; i++) {

      
            const imagePath = path.join(__dirname, '../public/adminAssets/imgs/category/', req.files[i].filename);

           console.log('this is the image path :',imagePath)
           images.push(imagePath);
           console.log('this is the images array that is going to be saved in the database : ',images)
          }
        }
       
        const newProduct = new Product({
          name: productData.name,
          description: productData.description,
          brand: productData.brand,
          price: productData.price,
          date: productData.date,
          quantity: productData.quantity,
          category: productData.category,
          images: images,
        });

        await newProduct.save();

        res.redirect("/admin/product");
      }
    } else {
      console.log("Product already exists while add product and iziToast worked");
      req.flash('message', 'Product already exists..');
      res.redirect("/admin/addProduct");
    }
  } catch (error) {
    console.log("Error happened in createProduct function", error);
    // Handle error response
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
    // console.log('reached here at edit product page :');
    const { id } = req.query;

    const product = await Product.findOne({_id:id}).populate({
      path: "category",
      model: "Category",
    })
    .exec();
   let category = await Category.find({})

console.log('this is the product image or the existing images found at edit Product :',product.images);


    if (product) {
      res.render("editProduct", { product,category });
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.log("Error occurred in editProduct function", error);
    res.status(500).send("Server Error"); // Send a suitable error response
  }
};

// ==========  toggle to List or unlist the product==================

const toggleBlockStatusProduct = async (req, res) => {
  try {
    const productId = req.query.id;



    // console.log('this is the product id :',productId);
    // console.log('this si teh type of  product forund :',typeof productId);
    const product = await Product.findOne({_id:productId});

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
    
console.log('product data at body rec : ',productData)

let existingImages = req.body.existingImages;
   

    
    let updateData = {
      name: productData.name,
      description: productData.description,
      brand: productData.brand,

      price: productData.price,

      quantity: productData.quantity,

      category: productData.category.id,
    };


 // Handle existing images
 // Ensure it's an array
 if (existingImages.length > 0) {
   updateData.images = existingImages;
 }
 


    // Handle image upload
    if (req.files && req.files.length > 0) {
     
     
      newFilesToPush = req.files.map((file) => file.filename);
      updateData.images = [...(updateData.images || []), ...newFilesToPush];
    }


    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.redirect("/admin/product");
  } catch (error) {
    console.log("Error occurred in productEdited function", error);
    res.redirect("/error")
  }
};


//============= deleting a image ==============================
const deleteimage = async (req, res) => {
  try {
      const index = req.query.index;
      const product = await Product.findOne({ _id: req.query.id });

         //checking product
      if (!product) {
          return res.status(404).send('Product not found');
      }

      // Check index
      if (index >= 0 && index < product.images.length) {
          const filenameToDelete = product.images[index];
          const filePath = path.join(__dirname, '../public/adminAssets/imgs/category', filenameToDelete);

          // Delete the file
          fs.unlinkSync(filePath);
           // fs.promises.unlink(filePath)

          await Product.findByIdAndUpdate(product._id, { $pull: { images: filenameToDelete } });
          res.redirect(`/admin/editproduct?id=${req.query.id}`);
      } else {
          res.status(400).send('Invalid index');
      }
  } catch (error) {
      console.log(error.message);
      res.redirect("/error")
      res.status(500)
      
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
