let path = require('path');
const express= require("express");
const router=express();
let adminController = require('../controller/adminController')
let adminAuth = require('../middleware/adminAuth');
let {logRequest} = require('../middleware/loggingMiddleware');
let productController = require('../controller/productController');
let offerController = require('../controller/offerController')
let categoryController = require('../controller/categoryController');
let orderController = require('../controller/orderController');
let couponController = require('../controller/couponController');
let {upload,bannerUpload} = require('../multer/multer');
let bannerController = require('../controller/bannerController')
router.set('view engine','ejs');
router.set('views',path.join(__dirname,'../views/admin'));


//=========Login of admin related routes=============
router.get('/login',adminAuth.isLoggedOut,adminController.adminLogin);
router.post('/login',adminController.verifyAdminLogin);
router.get('/dashboard',adminAuth.isLoggedIn,adminController.adminDashboard);
router.get('/logout',adminController.logout);
router.get('/users',adminAuth.isLoggedIn,adminController.userField);
router.get('/searchUser', adminAuth.isLoggedIn, adminController.loadSearchQuery);
router.post('/toggleBlock',adminAuth.isLoggedIn,adminController.toggleBlockStatus)





//--------sales report--------------------
router.get('/salesReport',adminAuth.isLoggedIn,adminController.loadSalesReport)

router.get('/customDateReport',adminAuth.isLoggedIn,adminController.customDateReport)

router.get('/salesDaily',adminAuth.isLoggedIn,adminController.dailySalesReport)

router.get('/salesWeekly',adminAuth.isLoggedIn,adminController.generateWeeklyReport)

router.get('/salesMonthly',adminAuth.isLoggedIn,adminController.generateMonthlyReport)

router.get('/salesYearly',adminAuth.isLoggedIn,adminController.generateYearlyReport)







//=========product part============================

router.get('/product',adminAuth.isLoggedIn,productController.productListPage);

router.get('/addProduct',adminAuth.isLoggedIn,productController.loadAddProduct)

router.get('/searchProduct', productController.loadProductSearchQuery);

router.get('/editProduct',adminAuth.isLoggedIn,productController.editProduct);


router.post('/createProduct',adminAuth.isLoggedIn,upload.array('images', 3),productController.createProduct);


router.post('/productEdited',upload.array('images', 3),productController.productEdited);


router.patch('/toggleBlockProduct',adminAuth.isLoggedIn,productController.toggleBlockStatusProduct)


router.get('/deleteProduct',adminAuth.isLoggedIn,productController.deleteProduct);

router.get('/deleteimage',adminAuth.isLoggedIn, productController.deleteimage)






//=======Category part==============================
router.get('/category',adminAuth.isLoggedIn,categoryController.allCategory);


router.post('/addCategory',adminAuth.isLoggedIn,upload.single('image'),categoryController.addCategory);


router.post('/updateCategory',adminAuth.isLoggedIn,upload.single('image'),categoryController.updateCategory);


router.get('/deleteCategory',adminAuth.isLoggedIn,categoryController.deleteCategory);


router.get('/editCategory',adminAuth.isLoggedIn,categoryController.editCategory);


router.get('/categoryUnlist',adminAuth.isLoggedIn,categoryController.categoryUnlist)


router.get('/categoryList',adminAuth.isLoggedIn,categoryController.categoryList)






//order part====================================
router.get("/orders",adminAuth.isLoggedIn,orderController.loadOrder)

router.put('/updateStatus/:orderId',adminAuth.isLoggedIn,orderController.changeStatus)





//===================  Offer creation  ============================

router.get('/offer',adminAuth.isLoggedIn,offerController.loadOfferListingPage)

router.get('/addOffer',adminAuth.isLoggedIn,offerController.loadAddOffer)

router.post('/addOffer',adminAuth.isLoggedIn,offerController.createOffer)

router.patch('/statusOffer', adminAuth.isLoggedIn, offerController.changeOfferStatus);


router.get('/editOffer',adminAuth.isLoggedIn,offerController.loadEditOffer)

router.put('/editOffer',adminAuth.isLoggedIn,offerController.offerEdited)

router.delete('/deleteOffer',adminAuth.isLoggedIn,offerController.deleteOffer)

router.patch('/applyCategoryOffer',adminAuth.isLoggedIn,offerController.applyCategoryOffer)

router.patch('/removeCategoryOffer',adminAuth.isLoggedIn,offerController.removeCategoryOffer);

router.patch('/applyProductOffer',adminAuth.isLoggedIn,offerController.applyProductOffer);

router.patch('/removeProductOffer',adminAuth.isLoggedIn,offerController.removeProductOffer);




// =============   coupon management =============================

router.get('/coupon',adminAuth.isLoggedIn,couponController.couponView)

router.get('/addCoupon',adminAuth.isLoggedIn,couponController.loadAddCoupon)

router.post('/addCoupon',adminAuth.isLoggedIn,couponController.addCouponDetails)

router.get('/editCoupon',adminAuth.isLoggedIn,couponController.loadEditCoupon)

router.post('/editCoupon',adminAuth.isLoggedIn,couponController.editCoupon)

router.delete('/deleteCoupon/:id',adminAuth.isLoggedIn,couponController.deleteCoupon)





//-------------  banner management ------------------------------

router.get("/banner",adminAuth.isLoggedIn,bannerController.loadBanner)

router.get("/addBanner",adminAuth.isLoggedIn,bannerController.loadAddBanner)

router.get('/editBanner',adminAuth.isLoggedIn,bannerController.loadEditBanner)

router.post("/addBanner",adminAuth.isLoggedIn,bannerUpload.single('image'),bannerController.addBannerDetails)

router.delete('/deleteImage',adminAuth.isLoggedIn, bannerController.editImageDelete);

router.post("/editBanner/:id",adminAuth.isLoggedIn, bannerUpload.single('image'), bannerController.editBannerDetails);

router.patch('/changeStatus',adminAuth.isLoggedIn,bannerController.toggleListUnlistBanner)

router.delete('/deleteBanner',adminAuth.isLoggedIn,bannerController.deleteBanner)





module.exports = router










