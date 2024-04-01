let path = require('path');
const express= require("express");
const router=express();
let adminController = require('../controller/adminController')
let adminAuth = require('../middleware/adminAuth');
let productController = require('../controller/productController');
let categoryController = require('../controller/categoryController');
let {upload} = require('../multer/multer');

router.set('view engine','ejs');
router.set('views',path.join(__dirname,'../views/admin'));


//=========Login of admin related routes=============
router.get('/login',adminAuth.isLoggedOut,adminController.adminLogin);
router.post('/login',adminController.verifyAdminLogin);
router.get('/dashboard',adminAuth.isLoggedIn,adminController.adminDashboard);
router.get('/logout',adminController.logout);
router.get('/users',adminAuth.isLoggedIn,adminController.userField)
router.post('/toggleBlock',adminAuth.isLoggedIn,adminController.toggleBlockStatus)



//=========product part============================
router.get('/product',adminAuth.isLoggedIn,productController.allProducts);

router.get('/product?page',adminAuth.isLoggedIn,productController.allProducts);


router.get('/addProduct',adminAuth.isLoggedIn,upload.array('images', 4),productController.addProduct);


router.get('/editProduct',adminAuth.isLoggedIn,productController.editProduct);


router.post('/createProduct',adminAuth.isLoggedIn,upload.array('images', 4),productController.createProduct);


router.post('/productEdited',adminAuth.isLoggedIn,upload.array('images', 4),productController.productEdited);


router.get('/unlistProduct',adminAuth.isLoggedIn,productController.unlistProduct);


router.get('/listProduct',adminAuth.isLoggedIn,productController.listProduct);


router.get('/deleteProduct',adminAuth.isLoggedIn,productController.deleteProduct);





//=======Category part==============================
router.get('/category',adminAuth.isLoggedIn,categoryController.allCategory);


router.post('/addCategory',adminAuth.isLoggedIn,upload.single('image'),categoryController.addCategory);


router.post('/updateCategory',adminAuth.isLoggedIn,upload.single('image'),categoryController.updateCategory);


router.get('/deleteCategory',adminAuth.isLoggedIn,categoryController.deleteCategory);


router.get('/editCategory',adminAuth.isLoggedIn,categoryController.editCategory);


router.get('/categoryUnlist',adminAuth.isLoggedIn,categoryController.categoryUnlist)


router.get('/categoryList',adminAuth.isLoggedIn,categoryController.categoryList)

module.exports = router
