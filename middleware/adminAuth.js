let isLoggedIn = async(req,res,next)=>{
    try{
        if(req.session.Admin) next();
        else{
            console.log('admin redirected at  is loggedin middleware')
            res.redirect('/admin/login');
        }
        
    }catch(err){
        if(err) throw err;
    }
}

let isLoggedOut = async(req,res,next)=>{
    if(req.session.Admin){
        res.redirect('/admin/dashboard');
    }
    else next();
}

module.exports = {
    isLoggedIn,
    isLoggedOut
}