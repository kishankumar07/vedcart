let Category = require('../model/categoryModel');


//=============== landing page for category control===================
const allCategory=async(req,res)=>{
    try {
        //category is set at session
      
        const category=await Category.find()
       
        req.session.category=category
        res.render('category',{category})
    } catch (error) {
        console.log('This is all category error',error);
        
    }
}

//================Adding a category ==========================
const addCategory=async(req,res)=>{
    try {
        const{name,description}=req.body
        
        
        const categoryExist=await Category.findOne({name})

        console.log('category got from db is : ',categoryExist);
        if(categoryExist){
           
            res.redirect('/admin/category')
        }else{
            const caseInsenstiveCategoryExist= await Category.findOne({
                name:{$regex:new RegExp('^'+name+'$','i')}
            })
            if(caseInsenstiveCategoryExist){
                console.log('case insensitivity at backend code found');
                res.redirect('/admin/category')
            }
            const newCategory=new Category({
                name,
                description,
                image:req.file.filename
            })
            await newCategory.save();
           
                res.redirect('/admin/category')
            
        }
    } catch (error) {
        console.log('Add category error',error);
        
    }
}
//==================Update category==========================
const updateCategory=async(req,res)=>{
    try {
      const id=req.body.id
      const img=req.file?req.file.filename:null;
      if(img){
          await Category.findByIdAndUpdate(id,{
              name:req.body.name,
              description:req.body.description,
              image:req.file.filename
          },{new:true})
      }else{
          await Category.findByIdAndUpdate(id,{
              name:req.body.name,
              description:req.body.description,
          },{new:true})
      }
      res.redirect('/admin/category')
    } catch (error) {
      console.log('Update category error');
      
    }
  }


//================Editing the category=====================

const editCategory=async(req,res)=>{
    try {
        let id=req.query.id;
       let findCategory=await Category.findById(id)
       if(findCategory){
        res.render('editCategory',{category:findCategory});
       }else{
        res.redirect('/admin/category');
       }
    } catch (error) {
        console.log(error);  
    }
}

//======================Delete a particular category using ID===========
const deleteCategory=async(req,res)=>{
    try {
        let id=req.query.id;
     console.log('imm here');
        await Category.findByIdAndDelete(id);
        res.redirect('/admin/category');
      
    } catch (error) {
        console.log(error);  
    }
}
//==============Category Unlisting=================
const categoryUnlist=async(req,res)=>{
    try {
       let id =req.query.id;

       await Category.updateOne({_id:id},{$set:{status:'blocked'}})

      
        res.redirect('/admin/category');
      
    } catch (error) {
        console.log(error);  
    }
}


//==============Category listing=================
const categoryList=async(req,res)=>{
    try {
       let id =req.query.id;
       await Category.updateOne({_id:id},{$set:{status:'active'}})
        res.redirect('/admin/category');
      
    } catch (error) {
        console.log(error);  
    }
}



module.exports ={
    allCategory,
    addCategory,
    updateCategory,
    editCategory,
    deleteCategory,
    categoryUnlist,
    categoryList,
}