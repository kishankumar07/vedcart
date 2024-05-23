const multer  = require('multer')
const path = require('path')
const fs = require('fs');
const mimetype=require('mime-types')
const { v4: uuidv4 } = require('uuid');

// ---------------- for category and image upload setting -------------------

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, 'public/adminAssets/imgs/category');
    },
    filename: function (req, file, callback) {
      callback(null,  uuidv4() + path.extname(file.originalname))}
  });

const fileFilter = function (req, file, callback) {
    // Allow all image files
    if (file.mimetype.startsWith('image/')) {
        callback(null, true);
    } else {
        // Reject other file types
        callback(new Error('Only image files are allowed!'), false);
    }
};

  const upload=multer({
    storage:storage,
    fileFilter:fileFilter,
    limits: { files: 3 }
  })

// ------------------ for banner image setting ---------------------------
// Function to ensure directory exists
const ensureDirectoryExists = (directory) => {
  return new Promise((resolve, reject) => {
      fs.mkdir(directory, { recursive: true }, (err) => {
          if (err) {
              reject(err);
          } else {
              resolve();
          }
      });
  });
};


// Configuration for banner image uploads
const bannerStorage = multer.diskStorage({
  destination: async function(req, file, callback) {
      const directory = 'public/uploads/banners';
      try {
          await ensureDirectoryExists(directory);
          callback(null, directory);
      } catch (err) {
        console.log('error at banner image upload directory creation',err)
          callback(err);
      }
  },
  filename: function(req, file, callback) {
      callback(null, uuidv4() + path.extname(file.originalname));
  }
});

const bannerFileFilter = function(req, file, callback) {
  if (file.mimetype.startsWith('image/')) {
      callback(null, true);
  } else {
      callback(new Error('Only image files are allowed!'), false);
  }
};

const bannerUpload = multer({
  storage: bannerStorage,
  fileFilter: bannerFileFilter
})



  module.exports={
    upload,
    bannerUpload
  }

  






  