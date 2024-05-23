const multer = require('multer');
let path = require('path');


const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Too many files uploaded. Maximum 3 files are allowed.' });
    }
  }
  next(err);
};

//---------------- handle 404 not found errors--------------------
const notFoundHandler = (req, res, next) => {
    const isAdminRoute = req.originalUrl.startsWith('/admin');
  
    if (isAdminRoute) {
      res.status(404).sendFile(path.join(__dirname, '../public/errorPages/admin_404.html'));
    } else {
      res.status(404).sendFile(path.join(__dirname, '../public/errorPages/user_404.html'));
    }
  };

//-------------------- internal server error 500 ------------------
// const generalErrorHandler = (err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).sendFile(path.join(__dirname, '../public/errorPages/500.html'));
//   };


module.exports = {multerErrorHandler,
    notFoundHandler,
};
