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
//=------------------=--------------------------=-------------------


const isLoggedOut = async(req, res, next) => {
console.log(`at isLoggedOut middleware , this is present in session ${req.session.userData} `)
console.log('what is req.session value : ',req.session)
try{

    if(!req.session.userData || req.session.userData === null){
        console.log('session data not found or null so eligible to access the signin or signup page !');
        next();
    }else{
        let userDetails = await User.findById(req.session.userData);
        if(!userDetails || !userDetails.isVerified){
            console.log('User not verified or not found at database');
            next();
        }else{
            console.log('user already loggedin and verifed so redirecting to /home page');
            res.redirect('/');
        }
    }

}catch(error){
    console.error('Error at isLoggedOut middleware :',error);
    next(error)// in this line it means the error will be passed to the next middleware
}
}

//-=--------------------------------------------------------------

const isBlocked = async (req, res, next) => {
    console.log('isBlocked middleware called');
    try {
        if (req.session?.userData) {
            const user = await User.findById(req.session.userData);
            if (user && user.isBlocked) {
                console.log('User is blocked');
                req.session.userData = null;
                req.flash('message', 'You have been blocked by the administrator');
                res.redirect('/signin');
            } else {
                console.log('User is not blocked');
                next();
            }
        } else {
            console.log('No session data found');
            res.redirect('/signin');
        }
    } catch (error) {
        console.error('Error in isBlocked middleware:', error);
        next(error); // Pass error to the error handler middleware
    }
};

// ================================================================

const isVerified = async (req, res, next) => {
    console.log('isVerified middleware called');
    try {
        const userId = req.session.userData;
        const user = await User.findById(userId);
        if (user && user.isVerified) {
            console.log('User is verified');
            next();
        } else {
            console.log('User not verified');
            req.flash('message', 'User not verified');
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error in isVerified middleware:', error);
        next(error); 
    }
};



module.exports = {
    isLoggedIn,
    isLoggedOut,
    isBlocked,
    isVerified
}

