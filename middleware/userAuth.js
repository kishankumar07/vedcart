
const User = require('../model/userModel')



const isLoggedIn = (req, res, next) => {
console.log('isLoggedin middleware worked')
    if (req.session.userData) {


       console.log(`typeof session data ${typeof req.session.userData} and this is present in session at isLoggedIn middleware ${req.session.userData}`)


           next();                    
        
    } else {
        req.flash('message','Please login to continue')
        res.redirect('/signin');

    }
};








const isLoggedOut = (req, res, next) => {

console.log(`at isLoggedOut middleware `)


    if (req.session.userData === 'undefined' || req.session.userData == null) {



    console.log(`session is ${req.session.userData} and type is ${typeof req.session.userData}`)


        next();


    } else {



console.log(`session already present and the session is ${req.session.userData} and the type is ${typeof req.session.userData}`)



       res.redirect('/')

    }
}








const isBlocked = async (req,res,next)=>{
    try {

         console.log('isBlocked worked ')

        if(req.session?.userData){


console.log(`in the session ${req.session.userData} is present and type is ${typeof req.session.userData}`)



           let user = await User.findById(req.session.userData)
         if(user?.isBlocked == false){

            // console.log('req.session.userData check at is_Bloced middleware and is not blocked:');
            next();



        }else{
            // console.log('user is blocked and session is kept as null ')
            req.session.userData=null;

            console.log(`user is blocked now, so at session this is present ${req.session.userData} and typeof is ${typeof req.session.userData}`)

            req.flash('message','You have been blocked by the administrator')
            res.redirect('/signin')
            }
        }else{
            console.log('at isblocked middleware else condition')
            res.redirect('/signin')
        }

    }catch(error){
console.log("error at is_Blocked ",error)
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

