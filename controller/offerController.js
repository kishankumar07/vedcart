let Offer = require('../model/offerModel');

//========== Load offer listing page ========================
const loadOfferListingPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;

        const totalOffers = await Offer.countDocuments();
        const totalPages = Math.ceil(totalOffers / limit);

        const offerData = await Offer.find()
            .skip((page - 1) * limit)
            .limit(limit);


        // console.log('this is the offer data  :',offerData)
// checked and found the data as array of objects [{},{}]

        res.render("allOffer", {
            offerData,
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


//To convert the date to a standart Indian format
// ------------------------------------------------------------------
        function convertDateFormat(startDate,endDate) {
         
            let startDatePart = startDate.split('-');
            let endDatePart = endDate.split('-');
            
            let newFormatofStartDate = startDatePart[2] + '-' + startDatePart[1] + '-' + startDatePart[0];

            let newFormatofEndDate = endDatePart[2] + '-' + endDatePart[1] + '-' + endDatePart[0];
             
            return {newFormatofStartDate,newFormatofEndDate};
           }
               
           let {newFormatofStartDate,newFormatofEndDate} = convertDateFormat(startDate,endDate);
         
// -------------------------------------------------
        if(existingOffer){
           
           return res.json({data:false,message:'Offer already exists'})
        }else{
            let offerSaved = await new Offer({
               name:offerName,
               discount:discountPercentage,
               startingDate:newFormatofStartDate,
               endDate:newFormatofEndDate, 
            }).save();
            // console.log('this is the offer saved at database :',offerSaved);
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

















module.exports = {
    loadOfferListingPage,
    loadAddOffer,
    createOffer,
    changeOfferStatus,
    
}