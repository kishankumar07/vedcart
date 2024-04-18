
const User = require('../model/userModel')



const isLoggedIn = (req, res, next) => {

    if (req.session.userData) {
       
           next();                    
        
    } else {
        req.flash('message','Please login to continue')
        res.redirect('/signin');

    }
};


const isLoggedOut = (req, res, next) => {

    if (req.session.userData) {
    
        res.redirect('/')
    } else {

        next();

    }
}


const isBlocked = async (req,res,next)=>{
    try {
          
        if(req.session.userData){
           let user = await User.findById(req.session.userData)
         if(user.isBlocked == false){
            next();
        }else{
            req.session.userData=null;

            

            req.flash('message','You have been blocked by the administrator')
            res.redirect('/signin')
            }
        }

    }catch(error){
console.log("is Blocked error",error)
    }
}




let isVerified = async(req,res,next) =>{
    try{
        let userId = req.session.userData;
        let user = await User.findById(userId)

        if(user.isVerified){
            next();
        }else{
            req.flash('message','User not verified')
            res.redirect('/')
        }

    }catch(err){
    console.log('error at the isVerified part',err)
    }
}






module.exports = {
    isLoggedIn,
    isLoggedOut,
    isBlocked,
    isVerified
}

