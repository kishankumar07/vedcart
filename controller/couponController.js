let Coupon = require('../model/couponModel');
const moment = require("moment")




// === = = = = = = add coupon =====================
const loadAddCoupon = async(req,res)=>{
    try {
        const admin=req.session.Admin
        let error = req.flash('error')

        // console.log('thhe error : ',error)
        res.render("addCoupon",{admin,error})
    } catch (error) {
       res.redirect("/error")
    }
}



//-=------------- coupon view page====================

const couponView = async (req, res) => {
    try {
        const admin = req.session.Admin;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;

        const totalCoupons = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalCoupons / limit);

        const coupons = await Coupon.find()
            .skip((page - 1) * limit)
            .limit(limit);
        let success = req.flash('success')

        console.log('the success : ',success)

        res.render("coupon", {
            admin,
            coupons,
            limit,
            success,
            moment,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        console.log('error at coupon viewing page : ',error)
       res.redirect("/error")
    }
};

//============== add a coupon ===================
const addCouponDetails = async (req, res) => {
    try {
        const { name, code, min, discount, description, expiryDate } = req.body;

     
        const existingCouponByName = await Coupon.findOne({ couponName: new RegExp('^' + name + '$', 'i') });
        if (existingCouponByName) {
            req.flash('error', 'Coupon with the same name already exists.');
            return res.redirect("/admin/addCoupon");
        }

        
        const existingCouponByCode = await Coupon.findOne({ couponCode: new RegExp('^' + code + '$', 'i') });
        if (existingCouponByCode) {
            req.flash('error', 'Coupon with the same code already exists.');
            return res.redirect("/admin/addcoupon");
        }

        const addCoupon = new Coupon({
            couponName: name,
            couponCode: code,
            minAmount: min,
            discount: discount,
            description: description,
            expiryDate: expiryDate
        });

        // Save the new coupon
        await addCoupon.save();

        req.flash('success', 'Coupon added successfully.');
        res.redirect("/admin/coupon");
    } catch (error) {
        console.error(error.message);
        req.flash('error', 'Internal Server Error');
        res.redirect("/admin/addcoupon");
    }
};

// =============== LOad edit coupon =========================
const loadEditCoupon=async (req,res)=>{
    try {
        const couponId=req.query.id
        const coupon=await Coupon.findById(couponId)
    let error = req.flash('message')

        res.render("editCoupon",{coupon,moment,error})
    } catch (error) {
       res.redirect("/error")
    }
}

//==========   Edit the coupon =============================
const editCoupon = async (req, res) => {
    try {
        const couponId = req.body.id; 
        const { name, code, min, discount, description, expiryDate } = req.body;

        const existingCoupon = await Coupon.findOne({
            couponCode: { $regex: new RegExp("^" + code + "$", "i") },
            _id: { $ne: couponId },
        });

// console.log('this is the existing coupon :',existingCoupon)

        if (existingCoupon) {
            req.flash('message', 'Coupon with the same name already exists.');
        return res.redirect(`/admin/editCoupon?id=${couponId}`);
        }

        const updateCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            { couponName: name, couponCode: code, minAmount: min, discount: discount, description: description, expiryDate },
            { new: true }
        );

        if (!updateCoupon) {
            console.log('error updating coupoon at database')
            req.flash('message','error updating the coupon')
            return res.redirect('/admin/editCoupon');
        }

        req.flash('success','Successfully updated the coupon')
       return res.redirect('/admin/coupon')
    } catch (error) {
        console.log('error at editCoupon :',error)
        res.redirect("/error")
    }
};

// ================ delete the coupon ============
const deleteCoupon = async(req,res)=>{
    try {
       const couponId=req.params.id
       const deleteCoupon=await Coupon.findByIdAndDelete(couponId);
       res.json({success:"deleted"})


    } catch (error) {
       res.redirect("/error")
    }
}



module.exports = {
    loadAddCoupon,
    couponView,
    addCouponDetails,
    loadEditCoupon,
    editCoupon,
    deleteCoupon
}