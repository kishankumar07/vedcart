let Offer = require('../model/offerModel');
let Category = require('../model/categoryModel');
let Products = require("../model/productModel");
const moment = require("moment")

//========== Load offer listing page ========================
const loadOfferListingPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const totalOffers = await Offer.countDocuments();
        const totalPages = Math.ceil(totalOffers / limit);

        const offerData = await Offer.find()
            .skip((page - 1) * limit)
            .limit(limit);


        // console.log('this is the offer data  :',offerData)
// checked and found the data as array of objects [{},{}]

        res.render("allOffer", {
            offerData,
            moment,
            limit,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        console.log('error at offer listing page: ',error)
      res.redirect("/error")
    }
};

//==========  L o a d   Add offer page ===========================

let loadAddOffer = async(req,res)=>{
    try{

        res.render('addOffer')
    }catch(err){
        console.log('error at loadAddOffer controller : ',err);
        res.redirect('/error');
    }
}


//===================== create offer ================================

let createOffer= async(req,res)=>{
    try{

    
        let {offerName,startDate,endDate,discountPercentage} = req.body;

        
        if (!offerName || !startDate || !endDate || !discountPercentage) {
            return res.status(400).json({ error: "All fields are required" });
        }


        let existingOffer = await Offer.findOne({ name: { $regex: new RegExp(offerName, 'i') } });



        if(existingOffer){
     
            return res.status(400).json({ data: false, message: "Offer already exists..!" });
        }else{
            let offerSaved = await new Offer({
               name:offerName,
               discount:discountPercentage,
               startingDate:startDate,
               endDate:endDate, 
            }).save();
            return res.status(201).json({ data: true, message: "Offer successfully created" });
        }
    }catch(err){
        console.log('error at createOffer controller : ',err)
        return res.status(500).json({error:"Internal server error"})
        
    }
}



//================= change offer status =======================

let changeOfferStatus = async(req,res)=>{
    try{
        let offerId = req.query.id;

        if (!offerId) {
            return res.status(400).json({ error: "Offer ID is required" });
        }

        let foundOfferFromDatabase = await Offer.findOne({_id:offerId});

        if (!foundOfferFromDatabase) {
            return res.status(404).json({ error: "Offer not found" });
        }

          foundOfferFromDatabase.status = foundOfferFromDatabase.status === true ? false : true;

        let value = await foundOfferFromDatabase.save();

       res.status(200).json({success:true,message:"Offer status updated successfully"})

    }catch(err){
        console.log('error at changing the offer status',err)
        res.status(500).json({ error: "Internal server error" });
    }
}


//-------------------  load the  edit the offer page  -------------------------

let loadEditOffer = async (req, res) => {
    try {
      
        let offerId = req.query.id;
        if (!offerId) {
            return res.status(500).redirect('/error')
        }

       
        let offerData = await Offer.findById(offerId);

       
        if (!offerData) {
            return res.status(500).redirect('/error')
        }

        
        res.render('editOffer', { offerData, moment });
    } catch (err) {
        console.log('Error at loading the edit offer page:', err);
        res.redirect('/error');
    }
}

//============= Offer edit ==============================================

let offerEdited = async(req,res)=>{
    try{

    
        let {offerName,startDate,endDate,discountPercentage,id} = req.body;

        if (!id) {
            return res.status(400).json({ error: "Offer ID is required" });
        }

        if (!offerName) {
            return res.status(400).json({ error: "Offer name is required" });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start date and end date are required" });
        }

        if (!discountPercentage || isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
           
            return res.status(400).json({ error: "Discount percentage must be a number between 0 and 100" });
        }




        let existingOffer = await Offer.findOne({ name: { $regex: new RegExp(offerName, 'i') },_id:{$ne: id} });


        if(existingOffer){
           
           return res.json({data:false,message:'Another offer with same name already exists'})
        }else{
           
         await Offer.findByIdAndUpdate(
            id,
            { name: offerName, discount: discountPercentage, startingDate: startDate, endDate: endDate },
            { new: true }
        )
        return res.json({data:true,message:'Offer successfully edited'});
        }
    }catch(err){
        console.log('error at offerEdited controller : ',err)
        return res.status(500).json({error:"Internal server error"})
        
    }
}

//==================  delete the offer ==========================

const deleteOffer = async (req,res)=>{
    try {
        
        const offerId = req.query.id
       
        if (!offerId) {
            return res.status(400).json({ error: "Offer ID is required" });
        }

        const deleteOffer = await Offer.findByIdAndDelete(offerId)

        if(deleteOffer){
            return res.status(200).json({ message: "Deleted successfully" });
      } else {
          return res.status(404).json({ error: "Offer not found" });
      }
    } catch (error) {
        console.log('error while deleting offer at delete offer controller',error)
        return res.status(500).json({ error: "Internal server error" });
        
    }
}



//======== apply category offer ===================
const applyCategoryOffer= async (req,res)=>{
    try {
        
        const {categoryId,offerId} = req.body
        await Category.updateOne({_id:categoryId},
            {$set:{offer:offerId}
        })
        res.json({success:true})
    } catch (error) {
      res.redirect("/error")
    }
}

//========= remove category offer ============
const removeCategoryOffer = async (req, res) => {
    try {
        const { categoryId } = req.body;

        await Category.updateOne(
            { _id: categoryId },
            { $unset: { offer: 1 } }
        );
        await Products.updateMany(
            { category: categoryId },
            { $unset: {offerprice: 1 } 
        })
        res.json({ success: true });
    } catch (error) {
        res.redirect("/500");
    }
};


//===============apply product offer =====================================
const applyProductOffer = async (req,res)=>{
    console.log('reached here')
    try {
        const {offerId,productId}=req.body

        await Products.updateOne({_id:productId},
            {$set:{offer:offerId}
        })
        res.json({success:true})
    } catch (error) {
      console.log('error at apply product offer :',error)
    }
}


//============== remove product offer ====================
const removeProductOffer = async (req,res)=>{
    try {
        const {productId} = req.body
        await Products.updateOne({_id:productId},
            {$unset:{offer:1,offerprice:1}
        })
        res.json({success:true})
    } catch (error) {
      console.log('error at the remove product offer :',error)
    }
}












module.exports = {
    loadOfferListingPage,
    loadAddOffer,
    createOffer,
    changeOfferStatus,
    loadEditOffer,
    offerEdited,
    deleteOffer,
    applyCategoryOffer,
    removeCategoryOffer,
    applyProductOffer,
    removeProductOffer
}