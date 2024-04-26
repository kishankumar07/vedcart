let Offer = require('../model/offerModel');
let Category = require('../model/categoryModel');
let Products = require("../model/productModel");
const moment = require("moment")

//========== Load offer listing page ========================
const loadOfferListingPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

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

        //regex search for existing offer
        let existingOffer = await Offer.findOne({ name: { $regex: new RegExp(offerName, 'i') } });



        if(existingOffer){
     
           return res.json({data:false,message:'Offer already exists'})
        }else{
            let offerSaved = await new Offer({
               name:offerName,
               discount:discountPercentage,
               startingDate:startDate,
               endDate:endDate, 
            }).save();
            console.log('this is the offer saved at database :',offerSaved);
           return res.json({data:true,message:'Offer successfully created'});
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
        let foundOfferFromDatabase = await Offer.findOne({_id:offerId});

        

          foundOfferFromDatabase.status = foundOfferFromDatabase.status === true ? false : true;



        let value = await foundOfferFromDatabase.save();

        res.redirect('/admin/offer')

    }catch(err){
        console.log('error at changing the offer status',err)
        res.redirect('/error')
    }
}


//-------------------  load the  edit the offer page  -------------------------

let loadEditOffer = async(req,res)=>{
    try{
        let offerId = req.query.id;
        let offerData = await Offer.findById(offerId);


        res.render('editOffer',{offerData,moment})
    }catch(err){
        console.log('error at the loadEditOffer page :',err);
        res.redirect('/error');
    }
}
//============= Offer edit ==============================================

let offerEdited = async(req,res)=>{
    try{

    
        let {offerName,startDate,endDate,discountPercentage,id} = req.body;


//clarification at start date and end date:
// console.log('start date :',startDate);
// console.log('end date :',endDate);



        //regex search for existing offer
        let existingOffer = await Offer.findOne({ name: { $regex: new RegExp(offerName, 'i') },_id:{$ne: id} });


       

        if(existingOffer){
           
           return res.json({data:false,message:'Offer already exists'})
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
        // console.log("offer",offerId);
        const deleteOffer = await Offer.findByIdAndDelete(offerId)

        if(deleteOffer){
            
            res.status(200).json({message:"deleted successfully"})
        }else{
            res.status(404).json({error:"offer not found"})
        }
    } catch (error) {
        res.redirect("/error")
        res.status(500).json({ error: 'Internal Server Error' });
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