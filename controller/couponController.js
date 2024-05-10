let Coupon = require('../model/couponModel');
const moment = require("moment")
let Cart = require("../model/cartModel");



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

        console.log('the success at coupon view at admin side: ',success)

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


//================= apply the coupon ===============================
const applyCoupon = async (req, res) => {
    try {
        console.log('reached here at apply coupon')
        const userId = req.session.userData;

console.log('this is the userId :',userId)

        const { couponCode } = req.body;
  
console.log('this is teh coupon code :',couponCode)

        const currentDate = new Date();

        const cartData = await Cart.findOne({ userId:userId }).populate({
            path: "products.productId",
            model: "Product",
        });

        console.log('this is the cartData :',cartData)

        const totalPriceTotal = cartData.products.reduce((total, product) => {
            return total + product.totalPrice;
        }, 0);
  
console.log('this is the totalPriceTotal :',totalPriceTotal)

        
       
        const coupon = await Coupon.findOne({
          couponCode,
          expiryDate: { $gte: currentDate },
          minAmount: { $lte: totalPriceTotal },
          "userUsed.used": { $ne: true }
      });
      
console.log('this is the coupon found :',coupon)


      if (coupon) {
          const alreadyUsed = coupon.userUsed.some((user) => user.userid.toString() === userId && user.used === true);
          
           
           console.log('this is the already used coupon:',alreadyUsed)

          if (!alreadyUsed) {

             // Update the coupon document to mark it as used by the user
             coupon.userUsed.push({ userid: userId, used: true });
             await coupon.save();

              const discount = totalPriceTotal - coupon.discount;
      
            console.log('this is teh discount applied to the subtotal : ',discount)

              res.json({ success: `${coupon.couponName} added`, totalPriceTotal, discount });
          } else {
              res.json({ already: 'Coupon already used by this user' });
          }
      } else {
          res.json({ error: 'Coupon not found or not applicable' });
      }
      
    } catch (err) {
     
        res.status(500).json({ error: 'Internal Server Error' });
    }
  };


//=================== remove the applied coupon ----------------------
const removeCoupon = async (req, res) => {
    try {
        const userId = req.session.userData;

        // Update the coupon document to mark it as not used by the user
        const result = await Coupon.updateOne(
            { "userUsed.userid": userId },
            { $pull: { userUsed: { userid: userId } } } // Remove the user from the userUsed array
        );

console.log('result after remove coupon :',result)

        if (result) {
            res.json({ success: 'Coupon removed' });
        } else {
            res.json({ error: 'Coupon not found or already removed' });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
    applyCoupon,
    loadAddCoupon,
    couponView,
    addCouponDetails,
    loadEditCoupon,
    editCoupon,
    deleteCoupon,
    removeCoupon
}


