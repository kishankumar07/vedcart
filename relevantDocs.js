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


//code for save for later at cart page 

/* <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script>
async function moveToSaveForLater(productId) {
  try {
    const response = await axios.post('/moveToSaveForLater', { productId });
    if (response.status === 200) {
      const { removedProduct } = response.data;
      // Remove the respective row from the cart table
      const rowToRemove = document.querySelector(`tr[data-product-id="${removedProduct._id}"]`);
      rowToRemove.remove();

      // Add the removed product to the "Save for Later" section
      const savedForLaterTable = document.querySelector('#savedForLaterTable tbody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${removedProduct.name}</td>
        <td>Rs. ${removedProduct.price}</td>
        <td>
          <button onclick="moveToCart('${removedProduct._id}')">Move to Cart</button>
        </td>
      `;
      savedForLaterTable.appendChild(newRow);

      // Check if the cart is empty and display message dynamically
      const cartTableBody = document.querySelector('.table-cart tbody');
      if (!cartTableBody.querySelector('tr')) {
        // Cart is empty, show the empty cart message
        const emptyCartRow = `
          <tr>
            <td colspan="6">
              <a href="category.html" class="cat-block">
                <figure>
                  <span>
                    <img src="/userAssets/home/assets/images/cart_animation.gif" alt="Category image">
                  </span>
                </figure>
                <h3 class="cat-block-title">Oops...Looks like your cart is empty</h3>
                <!-- End .cat-block-title -->
              </a>
            </td>
          </tr>
        `;
        cartTableBody.innerHTML = emptyCartRow;
      }
    } else {
      console.error('Failed to move product to save for later');
    }
  } catch (error) {
    console.error('Error moving product to save for later:', error);
  }
} */


//save for later in the cart page

// Define the controller function
// const moveToSaveForLater = async (req, res) => {
//     try {
//       // Extract productId from the request body
//       const { productId } = req.body;
//       console.log('this is the product id ::',productId);
//       // Find the cart associated with the user
//       const cart = await Cart.findOne({ userId: req.session.userData });
  
//       // Find the index of the product to be moved in the Products array
//       const index = cart.Products.findIndex(
//         (item) => item.id === productId
//       );
  
//       // If the product is found in the cart, remove it from Products array
//       if (index !== -1) {
//         const [product] = cart.Products.splice(index, 1);
//         // Push the product to the savedForLater array
//         cart.savedForLater.push(product);
  
//         console.log('this is what in save for later array',cart.savedForLater);
  
//         try {
//           // Save the updated cart
//           await cart.save();
//           // Send the removed product as a response
//           res.status(200).send({ message: "Product moved to save for later successfully", removedProduct: product });
//         } catch (error) {
//           console.error("Error saving cart:", error);
//           res.status(500).send({ error: "Error saving cart" });
//         }
//       } else {
//         console.log("reached else");
//         // If the product is not found in the cart, send a failure response
//         res.status(404).send({ error: "Product not found in the cart" });
//       }
//     } catch (error) {
//       // If an error occurs, send an error response
//       console.error("Error moving product to save for later:", error);
//       res.status(500).send({ error: "Internal server error" });
//     }
//   };
  



// to add product to cart===================
// function addtocart(user,productId) {

//   if(!user){
//       Swal.fire({
//           title: 'Login to Purchase',
//           text: 'To make a purchase, please log in.',
//           icon: 'info',
//           showCancelButton: true,
//           confirmButtonColor: '#3085d6',
//           cancelButtonColor: '#d33',
//           confirmButtonText: 'Login'
//       }).then((result) => {
//           if (result.isConfirmed) {
              
//               window.location.href = '/signin';
//           }
//       });
//     }
//   else{
//     // event.preventDefault();
//     const quantity = 1; // Replace with desired quantity
    
//     axios.post('/addToCart', {
//       productId: productId,
//       quantity: quantity,
//       cart: 'yes'
//   })
  
//       .then(response => {
//       //   console.log('Response from server at home cart addition:', response.data);
  
  
        
//         if (response.data.data === 'notFound') {
//           // Product not found
//           Swal.fire({
//             icon: 'error',
//             title: 'Error!',
//             text: 'Product not found.',
//           });
//       }
//           else if (response.data.data === 'noUser') {
//           // Product not found
//           Swal.fire({
//             icon: 'error',
//             title: 'Error!',
//             text: 'User not logged in.',
//           });
  
//         } else if (response.data.data === 'stockOut') {
//           // Insufficient stock
//           Swal.fire({
//             icon: 'error',
//             title: 'Error!',
//             text: 'Insufficient stock.',
//           });
//         } else if (response.data.data === true) {
//           // Product added successfully
//           Swal.fire({
//             icon: 'success',
//             title: 'Success!',
//             text: 'Product added to cart successfully!',
//           });
//         }
//       })
//       .catch(error => {
//         console.error('Error adding product to cart:', error);
//         // Display generic error message for other errors
//         Swal.fire({
//           icon: 'error',
//           title: 'Error!',
//           text: 'Failed to add product to cart.',
//         });
//       });
//   }
//   }


//Toast alert

<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" id="errorToast">
  <div class="toast-header">
    <strong class="mr-auto">Error</strong>
    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="toast-body">
    Error message will appear here.
  </div>
</div>


// css for it
// .toast {
//   position: fixed;
//   top: 10px;
//   right: 10px;
//   z-index: 1000;
// }

//Js to handle the formm validation
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#signin-modal'); // Replace 'yourFormId' with the actual ID of your form
  const errorToast = document.querySelector('#errorToast');

  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission for now

    // Perform form field validation
    const name = document.querySelector('#name').value.trim();
    const mobile = document.querySelector('#mobile').value.trim();
    const pin = document.querySelector('#pincode').value.trim();
    const addressDetails = document.querySelector('#addressDetails').value.trim();
    const city = document.querySelector('#city').value.trim();
    const state = document.querySelector('#state').value.trim();




    if (name === '') {
      showErrorToast('Name is required.');
      return;
    }


    if (addressDetails === '') {
      showErrorToast('Address field is required.');
      return;
    }

    if (city === '') {
      showErrorToast('City is required.');
      return;
    }


 // Validate mobile
 if (mobile === '') {
  showErrorToast('Mobile number is required.');
  return;

} else if (!validateMobile(mobile)) {
  showErrorToast('Invalid mobile number.');
  return;
}
function validateMobile(mobile) {
  // Simple mobile number validation regex (10 digits)
  var mobileRegex = /^\d{10}$/;
  return mobileRegex.test(mobile);
}



    // If all validations pass, you can proceed with form submission
    // form.submit();
  });

  function showErrorToast(message) {
    const toastBody = errorToast.querySelector('.toast-body');
    toastBody.textContent = message;
    $(errorToast).toast('show'); // Bootstrap 5 jQuery method to show the toast
  }

 
});











