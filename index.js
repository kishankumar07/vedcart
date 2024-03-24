let express = require('express')
let app = express();
let path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
let userRoute = require('./routes/userRoute');
let adminRoute = require('./routes/adminRoute')
let dbConnect=require('./config/dbConnect');
let flash = require('connect-flash');
let session =require('express-session')
const GoogleSignIn = require('./model/googleModel');

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

app.use('/',userRoute)
app.use('/admin',adminRoute)



app.set('view engine', 'ejs');



// Passport setup for Google authentication
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true // Add this option to enable accessing req in the callback
},
    async function (req,accessToken, refreshToken, profile, cb) {
        try {
            // Search for the user in the database based on Google profile ID
            let user = await GoogleSignIn.findOne({ googleId: profile.id });
            if (!user) {
                // Create a new user if not found in the database
                user = new GoogleSignIn({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value
                });
                await user.save();
            
                
            }
            return cb(null, user);
        } catch (error) {
            return cb(error);
        }
    }
));

// Serialize and deserialize user functions
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




app.use('/',userRoute)
app.use('/admin',adminRoute)

