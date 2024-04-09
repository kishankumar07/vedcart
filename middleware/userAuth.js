
const User = require('../model/userModel')



const isLoggedIn = async(req, res, next) => {

    if (req.session.userData) {
        const user = await User.findById(req.session.userData).lean()
       
        if (user) {
            if (user && !user.isBlocked) {
                 req.user = user;
                next();
            } else if (user.isBlocked) {
                req.session.destroy()
                res.redirect('/signin');
            } else {
                res.redirect('/signin');

            }
        }
        else {
            res.redirect('/signin');

            console.error(error);
            res.status(500).send('No User data found');
        };
    } else {
        
        res.redirect('/signin');

    }
};


const isLoggedOut = (req, res, next) => {
    if (req.session.userData && req.session.userData.isVerified) {
        
        res.redirect('/')
    } else {
        next();

    }
}
// const adminLoggedIn=(req,res,next)=>{
//     if(req.session.adminLoggedIn){
//         next()
//     }else{
//         res.redirect('/admin/login')
//     }
// }


const isBlocked = async (req,res,next)=>{
    try {
        const id = req.session.userData
        // console.log("this is id of user"+id)
        if(!id){
            next();
        }else{
        const user = await User.findById(id);
        // console.log("this is user session from is blocked" ,user);
        if(user.isBlocked == false){
            next();
        }else{
            req.session.destroy(err => {
                if (err) throw err;
                const userSession = req.session;
                res.render('userSignin',{message:"your account has been blocked by administrator",userSession})
              });

            }
        }

    }catch(error){
console.log("is Blocked error")
    }
}


let isVerified = async(req,res,next) =>{
    try{
        let userId = req.session.userData;
        let user = await User.findById(userId)

        if(user.isVerified){
            next();
        }else{
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

