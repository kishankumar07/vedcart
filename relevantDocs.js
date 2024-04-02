//for google users later on for address management

const mongoose = require('mongoose');

// Define GoogleSignIn schema
const GoogleSignInSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  // Other fields specific to Google users

  // Embedding addresses into the GoogleSignIn schema
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }]
});

// Create and export GoogleSignIn model
module.exports = mongoose.model('GoogleSignin', GoogleSignInSchema);


//---------------------------------------------------------------

//address sample for otp verified users=====================

const mongoose = require('mongoose');

// Define OTPAuthentication schema
const OTPAuthenticationSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true
  },
  // Other fields specific to OTP users

  // Embedding addresses into the OTPAuthentication schema
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }]
});

// Create and export OTPAuthentication model
module.exports = mongoose.model('OTPAuthentication', OTPAuthenticationSchema);

//=======================address schema sample ====================

const mongoose = require('mongoose');

// Define Address schema
const AddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  // Other address fields
});

// Create and export Address model
module.exports = mongoose.model('Address', AddressSchema);






//=========== later on linking google and otp verified usr if usre prefers========




// Assuming you have access to the user's OTP authentication data and Google authentication data
const User = require('./models/User');

// Function to link Google account to existing OTP-authenticated user
async function linkGoogleAccount(otpUser, googleUser) {
    try {
        // Update OTP user document with Google credentials
        otpUser.googleId = googleUser.googleId;
        otpUser.name = googleUser.name;
        otpUser.email = googleUser.email;
        // You may want to merge additional user data from Google with existing user data
        
        // Save the updated user document
        await otpUser.save();

        // Alternatively, you can delete the Google user document
        // and update any references to the Google user to point to the OTP user instead

        // Return success or perform additional actions as needed
        return { success: true, message: "Google account linked successfully." };
    } catch (error) {
        // Handle error
        console.error("Error linking Google account:", error);
        return { success: false, message: "An error occurred while linking Google account." };
    }
}




//==== for linking to google account while in the profile page=========

// Assuming you have routes or controller methods for OTP verification and profile management

// Route for OTP verification
app.post('/verifyOTP', async (req, res) => {
  // Verify OTP and authenticate user

  // After successful OTP verification
  // Redirect user to the home page with an option to link Google account
  res.redirect('/home?linkGoogle=true');
});

// Route for profile page
app.get('/profile', async (req, res) => {
  // Authenticate user and retrieve user data

  // Render the profile page with an option to link Google account
  res.render('profile', { linkGoogle: true });
});

// Route to handle linking Google account
app.post('/linkGoogleAccount', async (req, res) => {
  // Obtain Google authentication data
  const googleUser = req.body.googleUser; // Assuming you have the Google user data

  // Obtain OTP-authenticated user data (from session or database)
  const otpUser = req.user; // Assuming you have the OTP-authenticated user data in the request object or session

  // Link Google account to OTP-authenticated user
  const result = await linkGoogleAccount(otpUser, googleUser);

  // Handle the result (success or failure) and respond accordingly
  if (result.success) {
      // Redirect user to a success page or display a success message
      res.redirect('/profile?linked=true');
  } else {
      // Handle error and redirect user back to the profile page with an error message
      res.redirect('/profile?error=true');
  }
});




// Assuming you have the necessary models imported

const createUser = async (name, email, mobile, password, googleId) => {
  let user;
  if (googleId) {
    // If signing up via Google, create a corresponding entry in GoogleSignIn collection
    const googleUser = await GoogleSignIn.create({ googleId, name, email });
    // Create a User document with reference to the GoogleSignIn document
    user = await User.create({ name, email, mobile, googleUser: googleUser._id });
  } else {
    // If signing up with email/password, create a User document without googleUser field
    user = await User.create({ name, email, mobile, password });
  }
  return user;
};



// for adding products to the cart a sample code

// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Add to Cart</title>
// </head>
// <body>
//   <button onclick="addToCart()">Add to Cart</button>

//   <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
//   <script>
//     function addToCart() {
//       const productId = 'product_id_here'; // Replace with actual product ID
//       const quantity = 1; // Replace with desired quantity

//       axios.post('/api/cart/add', { productId, quantity })
//         .then(response => {
//           console.log('Product added to cart:', response.data.cart);
//           // Display success message to the user
//         })
//         .catch(error => {
//           console.error('Error adding product to cart:', error.response.data.message);
//           // Display error message to the user
//         });
//     }
//   </script>
// </body>
// </html>
