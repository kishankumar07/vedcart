let express = require('express')
const fetchCommonData = require('./middleware/commonDataMiddleware');
let app = express();
let path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
let userRoute = require('./routes/userRoute');
let adminRoute = require('./routes/adminRoute')
let dbConnect=require('./config/dbConnect');
let flash = require('connect-flash');
let User = require("./model/userModel");
let session =require('express-session')
const GoogleSignIn = require('./model/googleModel');
const {notFoundHandler, multerErrorHandler } = require('./middleware/errorHandler');

dbConnect();
app.use(express.static(path.join(__dirname,'public')));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(flash())
app.use(session({
    secret:process.env.SESSION_SECRET_KEY,
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:72*60*1000,      //Session expires in 72 hours
        httpOnly:true
    },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(fetchCommonData);



app.use('/',userRoute)
app.use('/admin',adminRoute)
// Error handling middlewares
app.use(multerErrorHandler)
app.use(notFoundHandler)



app.set('view engine', 'ejs');



// Passport setup for Google authentication
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true 
}, 

async function (req, accessToken, refreshToken, profile, cb) {
    try {

console.log('profile at google auth:',profile)

        // Search for the user in the database based on Google profile ID
        let googleUser = await GoogleSignIn.findOne({ googleId: profile.id });
        if (!googleUser) {
            // If Google user doesn't exist, create a new user in GoogleSignIn model
            const newGoogleUser = new GoogleSignIn({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
            });
            await newGoogleUser.save();
        }else{
           return res.redirect('/');
        }

        // Check if the user already exists in the User model
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            // If the user doesn't exist, create a new user in the User model
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleUser: profile.id,
                isVerified:true, // Reference the Google user ID
            });
           let savedUser =  await user.save();
           console.log('saved User at google auth:',savedUser);
        }

        // Return the user
        return cb(null, user);
    } catch (error) {
        return cb(error);
    }
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});





// Start the server
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000 admin is http://localhost:3000/admin/login`);
});









// app.use((req, res, next) => {
//     // Determine if the request is for an admin route
//     const isAdminRoute = req.originalUrl.startsWith('/admin');

//     // Render the appropriate error page based on the route type
//     if (isAdminRoute) {
//         // Send the admin 404 error page
//         res.status(404).sendFile(path.join(__dirname, 'public','errorPages', 'admin_404.html'));
//     } else {
//         // Send the user 404 error page
//         res.status(404).sendFile(path.join(__dirname, 'public','errorPages', 'user_404.html'));
//     }
// });













