
let { orderedDate,orderedTime} = require('../config/timeStamp');

// To log for every request made to any specific routes

const logRequest = (req, res, next) => {


    console.log(`Request made at ${orderedTime} / ${orderedDate} using  ${req.method} method to the  ${req.url} `);
    next();
  };
  
  module.exports = { 
    logRequest,
 };
  