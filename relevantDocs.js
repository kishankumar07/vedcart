//for google users later on for address management


// --=======================  razorpay details ====================
key_id,
rzp_test_Mjpyug9KzUZ3Wb,

key_secret
ItgtAc365vyuqpoorMcCUsrw

{/* <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script> */}








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










//To convert the date to a standart Indian format
// ------------------------------------------------------------------
function convertDateFormat(startDate,endDate) {
         
  let startDatePart = startDate.split('-');
  let endDatePart = endDate.split('-');
  
  let newFormatofStartDate = startDatePart[2] + '-' + startDatePart[1] + '-' + startDatePart[0];

  let newFormatofEndDate = endDatePart[2] + '-' + endDatePart[1] + '-' + endDatePart[0];
   
  return {newFormatofStartDate,newFormatofEndDate};
 }
     
 let {newFormatofStartDate,newFormatofEndDate} = convertDateFormat(startDate,endDate);

// -------------------------------------------------






// =================== for shop page, loading parts====================
// taken out for pagenation

// <div class="products mb-3 tablet">
// <div class="row">

//   <% if(product.length > 0) {%>
//   <% for(let i=0;i< product.length;i++) { %>

//   <div class="col-6 col-md-4 col-xl-3">
//     <div class="product">
//       <figure class="product-media">
      
//         <a href="/productPage?id=<%= product[i]._id %>" class="product-link">
//           <img class="default-img product-image" src="/adminAssets/imgs/category/<%= product[i].images[0] %>" alt="Product image">
//           <img class="hover-img product-image" src="/adminAssets/imgs/category/<%= product[i].images[1] %>" alt="Product image">
//       </a>
        
//         <div class="product-action-vertical">



//           <% if (user) { %>
//             <a
//                 href="#"
//                 onclick="wishList(event,'<%= product[i]._id %>','<%= user %>')"
//                 class="btn-product-icon btn-wishlist btn-expandable"
//             >
//                 <span>add to wishlist</span>
//             </a>
//         <% } else { %>
//             <a
//                 href="#"
//                 onclick="wishList(event,'<%= product[i]._id %>','')"
//                 class="btn-product-icon btn-wishlist btn-expandable"
//             >
//                 <span>add to wishlist</span>
//             </a>
//         <% } %>
        
        




//           <a
//             href="#"
//             class="btn-product-icon btn-compare"
//             title="Compare"
//             ><span>Compare</span></a
//           >
//           <a
//             href="/userAssets/home/popup/quickView.html"
//             class="btn-product-icon btn-quickview"
//             title="Quick view"
//             ><span>Quick view</span></a
//           >
//         </div>
//         <!-- End .product-action-vertical -->

//         <div class="product-action">
//           <a href="#" 
//           class="btn-product btn-cart"
//           title="Add to cart"
//           onclick="addToCart('<%= user %>','<%= product[i].id %>');return false;"
//           data-product-id="<%= product[i].id %>">
//           <span>add to cart</span>
//        </a>
//         </div>



//         <!-- End .product-action -->
//       </figure>
//       <!-- End .product-media -->

//       <div class="product-body">
//         <div class="product-cat">
//           <a href="#"><%= product[i].category.name %></a>
//         </div>
//         <!-- End .product-cat -->
//         <h3 class="product-title">
//           <a href="/productPage?id=<%=  product[i]._id%>"
//             ><%= product[i].name %></a
//           >
//         </h3>
//         <!-- End .product-title -->
//         <div class="product-price ">
//           <% if (product[i].offer || product[i].category.offer) { %>
//               <div class="row">


//                   <br>
//                   <span class="original-price  " style="margin-left: 10px;">₹
//                       <%= product[i].price %>
//                   </span>
                 
//                   <span class="offer-price" style="color: red;font-size:16px ;">
//                      (<%= product[i].offer ? product[i].offer.discount :
//                           product[i].category.offer.discount %> % Off)
//                   </span> 


//               </div>
//               <span class="w-100" style="color: rgb(0, 170, 0);font-size: 18px;">₹<%= product[i].offerprice %>
//                       </span>

//               <% } else { %>
//                 <span class="original-price  " style="margin-left: 10px;color:rgb(0, 170, 0);font-size: 15px;">₹
//                   <%= product[i].price %>
//               </span>
//                       <% } %>
//       </div>
//         <!-- End .product-price -->

  
//         <!-- stock part -->
//         <% if (product[i].quantity === 0) { %>
//           <h5 style="color: red;">OUT OF STOCK!</h5>
//           <% } else if(product[i].quantity ===1) { %>
//               <span style="color: #4eb44e;">Only <%=product[i].quantity%> left!</span>
//               <% } else if(product[i].quantity <=15) { %>
//                   <span style="color: #40a240;"> Hurry Only <%=product[i].quantity%> items left!</span>
//                   <% } %>

//                 <!-- stock part ends -->

//         <div class="ratings-container">
//           <div class="ratings">
//             <div class="ratings-val" style="width: 60%"></div>
//             <!-- End .ratings-val -->
//           </div>
//           <!-- End .ratings -->
//           <span class="ratings-text">( 6 Reviews )</span>
//         </div>
//         <!-- End .rating-container -->
//       </div>
//       <!-- End .product-body -->
//     </div>
//     <!-- End .product -->
//   </div>
//   <!-- End .col-sm-6 col-md-4 col-xl-3 -->

//  <% } %>

//  <% } else { %>
//   <tr>
//     <td colspan="2">Product not found</td>
//   </tr>
//   <% } %>


// </div>
// <!-- End .row -->
// </div>





// <div class="col-lg-9">
//     <!-- Other content -->

//     <!-- Table to display ordered products -->
// 	<h6>Order details</h6>
//     <table class="table">
//         <thead>
//             <tr>
//                 <th>Product</th>
//                 <th>Price</th>
// 				<th>Coupon</th>
//             </tr>
//         </thead>
//         <tbody>
//             <% cartData.products.forEach(product => { %>
//                 <tr>
//                     <td><%= product.name %></td>
//                     <td>₹ <%= product.totalPrice %>.00</td>


// 					<% 

// 					let arr = [];
// 					cartData.products.forEach(x=>{
// 					  arr.push(x.totalPrice)
// 					})

// 					console.log('total price at checkout page ejs : ',arr);


// 					let val = [];
// 			coupon.forEach(x=>{
//   			val.push(x.minAmount)
// 			})
// 			console.log('coupon minAmount at checkout ejs :',val)

// 					let couponAvailable = false;
// 					if (coupon && coupon.length > 0) {
// 						for (let i = 0; i < coupon.length; i++) {
// 							if (product.totalPrice > coupon[i].minAmount) {
// 							couponAvailable = true;
// 							break;
// 							}
// 						}
// 					}
// 					console.log('couponAvailable value at checkout :',couponAvailable)
// 					%>
// 					<td>
// 						<%= coupon.length > 0 ? (couponAvailable ? 'Coupon available scroll down to select :' : 'Order not eligible for coupon') : 'No coupon available' %>
// 					</td>
					

//                 </tr>
//             <% }); %>
//         </tbody>
//     </table>


// 	<h6>Add coupon</h6>
// 	<label for="checkout-discount-input" class="text-truncate">Have a coupon?
// 		<span>Select here</span></label><br>

// 	<div class="cart-discount">
// 		<form action="#">
// 		  <div class="input-group">
// 			<input
// 			  type="text"
// 			  class="form-control"
// 			  required
// 			  placeholder="coupon code"
// 			/>
// 			<div class="input-group-append">
// 			  <button class="btn btn-outline-primary-2" type="submit">
// 				<i class="icon-long-arrow-right"></i>
// 			  </button>
// 			</div>
// 			<!-- .End .input-group-append -->
// 		  </div>
// 		  <!-- End .input-group -->
// 		</form>
// 	  </div>
// </div><!-- End .col-lg-9 -->



// salesReport.js

async function customSortOrders() {
  try {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;

      const response = await fetch('/admin/customSort', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ startDate, endDate })
      });

      const data = await response.json();
      populateTable(data);
  } catch (error) {
      console.error(error.message);
  }
}

function populateTable(data) {
  const tableBody = document.querySelector('tbody');
  tableBody.innerHTML = ''; // Clear previous data in the table body

  data.forEach(order => {
      tableBody.innerHTML += `
          <tr>
              <td class="text-center">
                  <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="transactionCheck02" />
                      <label class="form-check-label" for="transactionCheck02"></label>
                  </div>
              </td>
              <td><a href="#" class="fw-bold">#SK${order._id}</a></td>
              <td>${order.userId.name}</td>
              <td>${new Date(order.date).toLocaleDateString('en-US')}</td>
              <td>$${order.total}</td>
              <td>
                  <span class="badge badge-pill badge-soft-success">${order.paymentStatus}</span>
              </td>
              <td><i class="material-icons md-payment font-xxl text-muted mr-5"></i> ${order.paymentMode}</td>
              <td hidden>
                  <a href="#" class="btn btn-xs"> View details</a>
              </td>
          </tr>
      `;
  });
}

// Attach an event listener to a button or form submission to trigger the custom sorting
document.getElementById('customSortBtn').addEventListener('click', customSortOrders);










const addBannerDetails = async (req, res) => {
  try {
      console.log('this is the req.body at the addBanner :', req.body);
      const image = req.file.filename; // Get the filename from req.file

      console.log('image got at c ::', image);

      const { title, description, date, location } = req.body;

      const newBanner = new Banner({
          title,
          description,
          location,
          date,
          image: image // Assign the filename to the image field
      });

      let values = await newBanner.save();
      console.log('values stored at db :', values);

      const promises = [image].map(async (filename) => {
          const originalImagePath = path.join(__dirname, '../public/uploads', filename);
          const resizedPath = path.join(__dirname, '../public/uploads', 'resized_Banner' + filename);

          await sharp(originalImagePath)
              .resize(1920, 900)
              .toFile(resizedPath);
      });

      await Promise.all(promises);
  } catch (error) {
      console.log('error at banner addition :', error);
      res.status(500).send("Internal Server Error");
  }
};










if (date === "") { // Check if date is empty
  document.getElementById("date-error").textContent = "Date is required";
  isValid = false;
} else {
  const currentDate = new Date();
  const selectedDate = new Date(date);
  if (selectedDate < currentDate) {
      document.getElementById("date-error").textContent = "Date must be today or in the future";
      isValid = false;
  }
}








