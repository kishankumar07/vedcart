let Banner = require('../model/bannerModel');
const sharp=require("sharp")
let path = require('path');
let moment = require("moment");


const loadBanner = async (req, res) => {
    try {

        const bannersPerPage = 5;

        const page = parseInt(req.query.page) || 1; // Get the current page from query parameter, default to 1
        const totalBanners = await Banner.countDocuments(); // Get total number of banners
        const totalPages = Math.ceil(totalBanners / bannersPerPage); // Calculate total pages

        const bannerFound = await Banner.find()
            .skip((page - 1) * bannersPerPage) // Skip banners that appear before this page
            .limit(bannersPerPage); // Limit the number of banners per page

        res.render('banner', { bannerFound, currentPage: page, totalPages,moment });
    } catch (error) {
        console.error('Error loading banner page:', error);
        res.redirect('/error');
    }
};

//-------------- add banner ---------------------------------
const loadAddBanner=async(req,res)=>{
    try {
        
        
        let location = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
      ];



        res.render("addBanner",{location})
    } catch (error) {
        console.log('error at add banner :',error)
       res.redirect("/error")
    }
}


//------------- load edit banner ----------------------
const loadEditBanner = async (req, res) => {
    try {
        const bannerId = req.query.id;
        const banner = await Banner.findById(bannerId);
        // console.log('banner at editBanner page :',banner)


        let location = [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
            'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
            'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
            'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
          ];
        res.render("editBanner", { banner,moment,location });
    } catch (error) {
        console.log('error at loading edit banner :',error)
       res.redirect("/error")
        
    }
};

//------------------------ create banner -------------------------

const addBannerDetails = async (req, res) => {
    try {
       
        const { title, description, date, location } = req.body;

        // Get the original image path
        const originalImagePath = req.file.path;

        // console.log('req.file --------------:',req.file);
// console.log('this is the original image path :',originalImagePath);

        // Define the destination path for the resized image
        const resizedPath = path.join(__dirname, '../public/uploads/banners', 'resized_' + req.file.filename);

// console.log('resizedpath ---------- :',resizedPath);


        // Resize the image using Sharp
        await sharp(originalImagePath)
            .resize(1920, 900)
            .toFile(resizedPath);

        // Create a new Banner object with the resized image path
        const newBanner = new Banner({
            title,
            description,
            location,
            date,
            image: `resized_${req.file.filename}` // Save the resized image path
        });

        // Save the new Banner object to the database
        let values = await newBanner.save();
        // console.log('values stored at db :', values);

        // Respond with success status
        res.status(200).json(true);
    } catch (error) {
        console.log('error at banner addition :', error);
        res.status(500).send("Internal Server Error");
    }
};

//---------------------- delete an image at edit -----------------
const editImageDelete = async (req, res) => {
    try {
        console.log("query data",req.query.image);
        console.log("quer",req.query.bannerId);
        const banner = await Banner.findOne({_id:req.query.bannerId});
        

        if (!banner) {
            return res.status(404).send('Banner not found');
        }

        const imageToDelete = req.query.image;
        console.log("image id",imageToDelete);

        // // Optionally 
        // const imagePath = path.join(__dirname, '../public/uploads', imageToDelete);
        // fs.unlink(imagePath, (err) => {
        //     if (err) {
        //         console.error('Error deleting file:', error);
        //     } else {
        //         console.log('File deleted successfully');
        //     }
        // });

        await Banner.updateOne(
            { _id: req.query.bannerId },
            { $pull: { image: imageToDelete } }
        );

        res.json({success:true})
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};




//------------ edit banner details--------------------
const editBannerDetails = async (req, res) => {
    try {
        const bannerId = req.params.id;



// console.log('banner id when  editBanner publish button clicked:',bannerId)
console.log('values at req.body in editBanner Publish: ',req.body)


        const { title, description, location,date } = req.body;
        const image = req.file ? req.file.filename : null;
     


console.log('value of image when publishedd :',image)




        const existingBanner = await Banner.findById(bannerId);
//-------------------------------------
        if (!existingBanner) {
            return res.redirect('/error');
        }
//----------------------------------
        if (image) {
            // If a new image is provided, process and update it
            const originalImagePath = path.join(__dirname, '../public/uploads/banners', image);
            const resizedPath = path.join(__dirname, '../public/uploads/banners', `resized_${image}`);

            await sharp(originalImagePath)
            .resize(1920, 900)
            .toFile(resizedPath);

            existingBanner.image = [];
            existingBanner.image.push(`resized_${image}`);
        }
        

        // Update other banner details
        existingBanner.title = title;
        existingBanner.description = description;
        existingBanner.location = location;
        existingBanner.date = date;

        // Save the updated banner
        await existingBanner.save();
        res.redirect("/admin/banner");
    } catch (error) {
        console.error('error at editbanner work',error.message);
        res.status(500).send('Internal Server Error');
    }
};


//---------------  listing or unlisting the banner ------------

let toggleListUnlistBanner = async(req,res)=>{
    try{
            let banner = await Banner.findById(req.query.id);

            let status = banner.status;
            banner.status =!status;
            await banner.save(); 
            return res.redirect('/admin/banner');
            
    }catch(err){
        console.log('error at banner listing or unlisting :',err)
        res.redirect('/error');
    }
}

//-------------------- delete the banner ----------------
const deleteBanner = async (req, res) => {
    try {
        const bannerId = req.query.id;
        const deleteBanner = await Banner.findByIdAndDelete(bannerId);

        if (deleteBanner) {
            res.status(200).json({ message: 'Banner deleted successfully' });
        } else {
            console.log("Banner not found or already deleted");
            res.status(404).json({ error: 'Banner not found or already deleted' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports ={
    loadBanner,
    loadAddBanner,
    loadEditBanner,
    addBannerDetails,
    editImageDelete,
    editBannerDetails,
    toggleListUnlistBanner,
    deleteBanner
}




