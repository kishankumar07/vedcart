//------------------ category management ----------------

let Category = require("../model/categoryModel");
let Offer = require("../model/offerModel");
let moment = require("moment");

//=============== landing page for category control===================
const allCategory = async (req, res) => {
  try {
    //category is set at session
    let errMess = req.flash("message");
    // console.log("flash message status at catgory management:", errMess);
    const category = await Category.find().populate({
      path: "offer",
      model: "Offer",
    })

    const currentDate = new Date();

    const offerData = await Offer.find({
      status: true,
      startingDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    req.session.category = category;
    res.render("category", { category, errMess, offerData, moment });
  } catch (error) {
    console.log("This is all category error", error);
    res.redirect("/error");
  }
};

//================Adding a category ==========================
const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log("this is the name in  req.body :", name);
    console.log("this is the description in req.body : ", description);

    const categoryExist = await Category.findOne({ name });
    if (categoryExist) {
      req.flash("message", "Category already exists");
      return res.status(400).redirect("/admin/category");
    } else {
      const caseInsensitiveCategoryExist = await Category.findOne({
        name: { $regex: new RegExp("^" + name + "$", "i") },
      });
      if (caseInsensitiveCategoryExist) {
        req.flash("message", "Category already exists");
        return res.status(400).redirect("/admin/category");
      }
      const newCategory = new Category({
        name,
        description,
        image: req.file.filename,
      });
      await newCategory.save();

      return res.status(201).redirect("/admin/category");
    }
  } catch (error) {
    console.log("Add category error", error);
    res.status(500).redirect("/error");
  }
};
//==================Update category==========================
const updateCategory = async (req, res) => {
  try {
    let { id, name, description } = req.body;
      
      //Immediate validation to check for whether it is existing category 
    let existingCategory = await Category.findOne({
      name: { $regex: new RegExp(name, "i") },
    });

    if (existingCategory && existingCategory._id.toString() !== id) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }


    let updateObject = {
      name : name,
      description : description,
    }

    if(req.file && req.file.filename){
      updateObject.image = req.file.filename;
    }


    

    return res
      .status(201)
      .json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    console.log("Error at update category:", error);
    res.status(500).redirect("/error");
  }
};

//================Editing the category=====================

const editCategory = async (req, res) => {
  try {
    let id = req.query.id;

    let findCategory = await Category.findById(id);
    if (findCategory) {
      res.render("editCategory", { category: findCategory });
    } else {
      req.flash("message", "Category not found");
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log("error at loading the category edit page", error);
    res.status(500).redirect("/error");
  }
};

//======================Delete a particular category using ID===========
const deleteCategory = async (req, res) => {
  try {
    let id = req.query.id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Id is required" });
    }

    let categoryFound = await Category.findById(id);

    if (!categoryFound) {
      return res
        .status(400)
        .json({ success: false, message: "Category does not exists" });
    }

    await Category.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.log("error while deleting the category", error);
    res.status(500).redirect("/error");
  }
};
//==============Category Unlisting=================
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    category.status = category.status === "active" ? "blocked" : "active";
    await category.save();

    res
      .status(200)
      .json({
        message: `Category ${
          category.status === "active" ? "listed" : "unlisted"
        } successfully.`,
      });
  } catch (error) {
    console.log("error at listing or unlisting the category :", error);
    res.status(500).redirect("/error");
  }
};

module.exports = {
  allCategory,
  addCategory,
  updateCategory,
  editCategory,
  deleteCategory,
  toggleCategoryStatus,
};
