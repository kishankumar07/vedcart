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
let {upload} = require('../multer/multer');

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



//=========product part============================


router.get('/product',productController.productListPage);

router.get('/addProduct',adminAuth.isLoggedIn,productController.loadAddProduct)

router.get('/searchProduct', productController.loadProductSearchQuery);

router.get('/editProduct',productController.editProduct);


router.post('/createProduct',adminAuth.isLoggedIn,upload.array('images', 4),productController.createProduct);


router.post('/productEdited',upload.array('images', 4),productController.productEdited);


router.post('/toggleBlockProduct',adminAuth.isLoggedIn,productController.toggleBlockStatusProduct)


router.get('/deleteProduct',adminAuth.isLoggedIn,productController.deleteProduct);

router.get('/deleteimage', productController.deleteimage)



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






//===================  Offer creation  ============================

router.get('/offer',adminAuth.isLoggedIn,offerController.loadOfferListingPage)

router.get('/addOffer',adminAuth.isLoggedIn,offerController.loadAddOffer)

router.post('/addOffer',adminAuth.isLoggedIn,offerController.createOffer)

router.get('/statusOffer',adminAuth.isLoggedIn,offerController.changeOfferStatus)

router.get('/editOffer',adminAuth.isLoggedIn,offerController.loadEditOffer)

router.post('/editOffer',adminAuth.isLoggedIn,offerController.offerEdited)

router.delete('/deleteOffer',adminAuth.isLoggedIn,offerController.deleteOffer)

router.patch('/applyCategoryOffer',adminAuth.isLoggedIn,offerController.applyCategoryOffer)

router.patch('/removeCategoryOffer',adminAuth.isLoggedIn,offerController.removeCategoryOffer);













module.exports = router
















