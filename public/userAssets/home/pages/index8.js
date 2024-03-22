//Product Creation routes
router.get("/createProduct",adminAuthMiddileware, adminController.addProduct)

router.post("/createProduct", adminController.createProduct);

router.get("/newCategory", adminAuthMiddileware,adminController.createCategory);

router.post("/newCategory",adminController.newCategory); 

router.get("/categoryList", adminAuthMiddileware,adminController.categoryList);

router.get(
  "/categoryDelete/:id",
  adminAuthMiddileware,adminController.categoryDelete
);

router.get(
  "/categoryEdit/:id",
  adminAuthMiddileware,adminController.categoryEdit
);

router.post("/categoryEdit/:id", adminController.categoryEditUpdate);

router.get("/categoryUlist/:id",adminAuthMiddileware, adminController.categoryUlist);

router.get("/productList",adminAuthMiddileware, adminController.productList);

router.get("/productCategory/:id",adminAuthMiddileware, adminController.productCategory);

router.get("/productListEdit/:id",adminAuthMiddileware, adminController.productListEdit);

router.post("/productListEdit/:id",adminController.productListEditUpdate)

router.delete(
  "/productListEdit/:productId/images/:imageIndex",
 adminAuthMiddileware, adminController.productEditDeleteImage
);

router.get("/productListDelete/:id",adminAuthMiddileware, adminController.productListDelete);

router.get("/productListUlist/:id",adminAuthMiddileware, adminController.productListUlist);