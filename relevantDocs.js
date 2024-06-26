//for google users later on for address management



# Check logs to ensure the application is running correctly
pm2 logs

# Set up PM2 to start on server reboot
pm2 startup
# Follow the instructions that appear, which will involve running a command with sudo

# Save the PM2 process list
pm2 save


// to create a new file using command prompt 
// type nul > fileName.extension















// --=======================  razorpay details ====================
key_id,
rzp_test_Mjpyug9KzUZ3Wb,

key_secret
ItgtAc365vyuqpoorMcCUsrw

{/* <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script> */}


<div class="banner banner-overlay">
<script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script><dotlottie-player src="https://lottie.host/72ef9b38-e534-415c-a451-5d9ccea05bec/ErU02LkRoE.json" background="#FFFFFF" speed="1" style="width: 300px; height: 300px" direction="1" playMode="normal" loop autoplay></dotlottie-player>



<script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script><dotlottie-player src="https://lottie.host/63f92b03-9df2-4ec9-9a02-cf1f719c3f2c/QUWZQKsool.json" background="#FFFFFF" speed="1" style="width: 300px; height: 300px" direction="1" playMode="normal" loop autoplay></dotlottie-player>



<div class="col-md-4">
    <div class="banner banner-overlay" style="margin-top: 100px;"> <!-- Add margin-top here -->
        <script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script>
        <dotlottie-player src="https://lottie.host/63f92b03-9df2-4ec9-9a02-cf1f719c3f2c/QUWZQKsool.json" background="#FFFFFF" speed="1" style="width: 300px; height: 300px" direction="1" playMode="normal" loop autoplay></dotlottie-player>
    </div><!-- End .banner banner-overlay -->
</div><!-- End .col-md-4 -->





const userId = req.session.userData;

 const userNameforProfile = await User.findById(userId);

 let cart =await Cart.findOne({userId:user}).populate({
     path:"products.productId",
     model: 'Product',
    })

 const totalPriceOfCartProducts = cart?.products.reduce((acc, curr) => acc + curr.totalPrice, 0) || 0;



 .search-results {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    z-index: 1000;
    background-color: #fff;
    border: 1px solid #ced4da;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 5px 5px;
    display: none; /* Initially hidden */
    border: 2px solid red; /* Temporary border for debugging */
}

.search-results-list li {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #ced4da;
    background-color: lightgreen; /* Temporary background color for debugging */
}








 let debounceTimer;

function debounce(func, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
}

function handleSearchInputChange(event) {
    const searchInput = event.target.value.trim();

    if (searchInput) {
        debounce(() => fetchSearchResults(searchInput), 300); // Adjust the delay as needed
    } else {
        clearSearchResults();
    }
}

function handleSearchResultClick(event) {
    const productName = event.target.textContent;
    console.log('Clicked on product:', productName);
    // Add your logic here, such as navigating to the product page
}

async function fetchSearchResults(query) {
    try {
        const response = await fetch(`/search?query=${query}`);
        const data = await response.json();

        const searchResultsContainer = document.getElementById('searchResults');
        searchResultsContainer.innerHTML = '';

        if (data.length > 0) {
            const dropdownList = document.createElement('ul');
            dropdownList.classList.add('search-results-list');

            data.forEach(product => {
                const listItem = document.createElement('li');
                listItem.textContent = product.name;
                dropdownList.appendChild(listItem);
            });

            searchResultsContainer.appendChild(dropdownList);
            searchResultsContainer.style.display = 'block'; // Show dropdown
        } else {
            searchResultsContainer.style.display = 'none'; // Hide dropdown if no results
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

function clearSearchResults() {
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.style.display = 'none'; // Hide dropdown
}

// Event listeners
const searchInput = document.getElementById('q');
searchInput.addEventListener('input', handleSearchInputChange);

const searchForm = document.querySelector('form[action="#"]');
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const searchInputValue = searchInput.value.trim();
    if (searchInputValue) {
        fetchSearchResults(searchInputValue);
    }
});

const searchResultsContainer = document.getElementById('searchResults');
searchResultsContainer.addEventListener('click', handleSearchResultClick);








//============== toast sample -----------------------\
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});
Toast.fire({
  icon: "warning",
  title: "Product already exists!"
});










//-------------------- sales report ---------------------

const moment = require('moment');

// Calculate total sales
const totalSales = await Orders.aggregate([
  { $match: { date: { $gte: startDate, $lte: endDate } } },
  { $group: { _id: null, totalSales: { $sum: "$grandTotal" } } }
]);

// Calculate total orders
const totalOrders = await Orders.countDocuments({ date: { $gte: startDate, $lte: endDate } });

// Product-wise sales
const productSales = await Orders.aggregate([
  { $match: { date: { $gte: startDate, $lte: endDate } } },
  { $unwind: "$Products" },
  { $group: { _id: "$Products.productId", totalQuantity: { $sum: "$Products.quantity" }, totalRevenue: { $sum: "$Products.subTotal" } } }
]);

// Order status distribution
const orderStatusDistribution = await Orders.aggregate([
  { $match: { date: { $gte: startDate, $lte: endDate } } },
  { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
]);

// Payment mode distribution
const paymentModeDistribution = await Orders.aggregate([
  { $match: { date: { $gte: startDate, $lte: endDate } } },
  { $group: { _id: "$paymentMode", count: { $sum: 1 } } }
]);

// Time-based analysis
const dailySalesTrend = await Orders.aggregate([
  { $match: { date: { $gte: startDate, $lte: endDate } } },
  { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, totalSales: { $sum: "$grandTotal" } } }
]);

// Geographic analysis (if applicable)
// You may need to modify this based on your schema and data structure

// Once you have retrieved the necessary data, you can format it into a report format and present it as needed.








// Calculate total revenue after deducting coupon discounts
const totalRevenueAfterDiscount = await Orders.aggregate([
  { $match: { date: { $gte: startDate, $lte: endDate } } },
  { $group: { _id: null, totalGrandTotal: { $sum: "$grandTotal" }, totalCouponDiscount: { $sum: "$couponDiscount" } } },
  { $project: { _id: 0, totalRevenueAfterDiscount: { $subtract: ["$totalGrandTotal", "$totalCouponDiscount"] } } }
]);

// Access the total revenue after deducting coupon discounts
const totalRevenuhe = totalRevenueAfterDiscount[0].totalRevenueAfterDiscount;








// Example function to calculate total revenue after adjustments
async function calculateTotalRevenueAfterAdjustments(startDate, endDate) {
  // Query orders for the specified date range
  const orders = await Orders.find({ date: { $gte: startDate, $lte: endDate } });

  let totalRevenue = 0;

  // Loop through each order
  for (const order of orders) {
      let orderRevenue = order.grandTotal;
      let orderDiscount = order.couponDiscount;

      // Adjust revenue and discount for canceled products
      for (const product of order.Products) {
          if (product.orderStatus === 'cancelled') {
              orderRevenue -= product.subTotal;
              orderDiscount -= (product.price * product.quantity); // Adjust discount if applicable
          }
      }

      // Adjust revenue and discount for returned products
      for (const product of order.Products) {
          if (product.orderStatus === 'returned') {
              orderRevenue -= (product.price * product.quantity);
              orderDiscount -= (product.price * product.quantity); // Adjust discount if applicable
          }
      }

      totalRevenue += orderRevenue;
  }

  return totalRevenue;
}

// Usage example
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');
const totalRevenue = await calculateTotalRevenueAfterAdjustments(startDate, endDate);
console.log('Total Revenue After Adjustments:', totalRevenue);







//--------------------- end --------------------------





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





function validateForm(category) {
  // Reset any existing error messages
  clearErrorMessages();

  const name = document.getElementById('product_name').value.trim();
  const image = document.getElementById('image').files[0];
  const description = document.getElementById('description').value.trim();

  let isValid = true;

  // Check if name is empty or has trailing spaces
  if (name === '') {
      displayErrorMessage('name-error', 'Please enter a category name.');
      isValid = false;
  } else if (name !== document.getElementById('product_name').value) {
      displayErrorMessage('name-error', 'Please avoid trailing spaces.');
      isValid = false;
  }

  // Check if an image is selected and is of the correct type (jpg, jpeg, png, webp)
  if (!image) {
      displayErrorMessage('image-error', 'Please select an image.');
      isValid = false;
  } else if (!isImageTypeValid(image)) {
      displayErrorMessage('image-error', 'Please select a valid image file (jpg, jpeg, png, webp).');
      isValid = false;
  }

  // Check if description is empty or has trailing spaces
  if (description === '') {
      displayErrorMessage('description-error', 'Please enter a category description.');
      isValid = false;
  } else if (description !== document.getElementById('description').value) {
      displayErrorMessage('description-error', 'Please avoid trailing spaces.');
      isValid = false;
  }

  // Check if category already exists
  const categoryName = document.getElementById("product_name").value.trim().toLowerCase();
  const existingCategories = JSON.parse(category).map(cat => cat.name.toLowerCase());

  if (existingCategories.includes(categoryName)) {
      Swal.fire({
          title: "Duplicate Category!",
          text: "This category already exists.",
          icon: "error",
          timer: 3000,
          showConfirmButton: false,
      });
      return false; // Prevent form submission
  }

  return isValid; // Form is valid
}

function isImageTypeValid(file) {
  return /\.(jpg|jpeg|png|webp)$/i.test(file.name);
}

function displayErrorMessage(errorId, message) {
  const errorDiv = document.getElementById(errorId);
  errorDiv.innerText = message;
}

function clearErrorMessages() {
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach((errorMessage) => {
      errorMessage.innerText = '';
  });
}







// //from here add product temped -----------------------
// <%- include('./layouts/header.ejs')%>

// <!-- iziToast CSS -->
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/izitoast/1.4.0/css/iziToast.min.css">
// <!-- iziToast JS -->
// <script src="https://cdnjs.cloudflare.com/ajax/libs/izitoast/1.4.0/js/iziToast.min.js"></script>

// <!-- cropper.js css -->
// <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.js"></script>
// <!-- CropperJS JS -->
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css">





// <% if (message.length !==0) { %>
//     <script>
//         // Display toast message
//         iziToast.error({
//             title: '<%= message %>',
//             position: 'topRight',
//             theme: 'dark', 
//         });
//     </script>
// <% } %>



// <section class="content-main">
//     <div class="row">
//         <div class="col-6">
//             <div class="content-header">
//                 <h2 class="content-title">Add New Product</h2>
                
//             </div>
//         </div>
//     </div>
//     <div class="row">
//         <div class="col-lg-6">
//             <div class="card mb-4">
//                 <div class="card-body">
//                     <form action="/admin/createProduct" id="addProductForm" method="post" enctype="multipart/form-data" onsubmit="return validateForm()">
//                     <div class="row">
//                         <div class="col-md-3">
//                             <h6>1. General info</h6>
//                         </div>
//                         <div class="col-md-9">
//                             <div class="mb-4">
//                                 <label class="form-label">Product name</label>
//                                 <input type="text" id="name" placeholder="Type here" class="form-control" name="name">
//                                 <div class="error-message text-danger" id="name-error"></div>
//                             </div>
//                             <div class="mb-4">
//                                 <label class="form-label">Description</label>
//                                 <textarea name="description" id="description" placeholder="Type here" class="form-control" rows="4"></textarea>
//                                 <div class="error-message text-danger" id="description-error"></div>
//                             </div>
//                             <div class="mb-4">
//                                 <label class="form-label">Brand name</label>
//                                 <input name="brand" id="brand" type="text" placeholder="Type here" class="form-control">
//                                 <div class="error-message text-danger" id="brand-error"></div>
//                             </div>
//                             <div class="mb-4">
//                                 <label class="form-label">Quantity</label>
//                                 <input name="quantity" id="quantity" type="number"  class="form-control">
//                                 <div class="error-message text-danger" id="quantity-error"></div>
//                             </div>
//                         </div> <!-- col.// -->
//                     </div> <!-- row.// -->
//                     <hr class="mb-4 mt-0">
//                     <div class="row">
//                         <div class="col-md-3">
//                             <h6>2. Pricing</h6>
//                         </div>
//                         <div class="col-md-9">
//                             <div class="mb-4">
//                                 <label class="form-label">Cost </label>
//                                 <input type="text" id="price" name="price" class="form-control">
//                                 <div class="error-message text-danger" id="price-error"></div>
//                             </div>
//                         </div> <!-- col.// -->
//                     </div> <!-- row.// -->
//                     <hr class="mb-4 mt-0">
//                     <div class="row">
//                         <div class="col-md-3">
//                             <h6>3. Date </h6>
//                         </div>
//                         <div class="col-md-9">
//                             <div class="mb-4">
//                                 <label class="form-label">Date </label>
                        
//                                 <input type="date" id="date" name="date" class="form-control">

//                                 <div class="error-message text-danger" id="date-error"></div>
//                             </div>
//                         </div> <!-- col.// -->
//                     </div> <!-- row.// -->
//                     <hr class="mb-4 mt-0">
//                     <div class="row">
//                         <div class="col-md-3">
//                             <h6>3. Category</h6>
//                         </div>
//                         <div class="col-md-9">
//                             <div class="mb-4">
//                                 <% category.forEach((categ, index) => { %>
//                                     <label class="mb-2 form-check form-check-inline" style="width: 45%;">
//                                         <input class="form-check-input" name="category" type="radio" value="<%= categ._id %>" id="category<%= index %>">
//                                         <span class="form-check-label"> <%= categ.name %> </span>
//                                     </label>
//                                 <% }) %>
//                             </div>
//                             <!-- Error message element placed after all category input fields -->
//                             <div class="category-error text-danger" id="category-error"></div>
//                         </div>
                        
//                     </div> <!-- row.// -->
//                     <hr class="mb-4 mt-0">
//                     <div class="row">
//                         <div class="col-md-3">
//                             <h6>4. Media</h6>
//                         </div>
//                         <div class="col-md-9">
//                             <div class="mb-4">

//                                 <label class="form-label">Images</label>


//                                 <input id="images" name="images" class="form-control" type="file" multiple>

//                                 <div class="error-message text-danger" id="image-error"></div>

                            
        
//                             </div>
//                         </div> <!-- col.// -->
//                     </div> <!-- .row end// -->
//                     <div>
                   
//                         <button type="submit" id="submit-btn" class="btn btn-md rounded font-sm hover-up">Publish</button>
//                     </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     </div>
//     </div>
// </section> <!-- content-main end// -->

// <!-- jQuery -->
// <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

// <!-- Bootstrap JS -->
// <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js"></script>






// <script>

// function validateForm() {
//         let isValid = true;
    
//         // General Info Validation
//         const name = document.getElementById('name').value.trim();
//         if (!name) {
//             displayErrorMessage('name-error', 'Please enter the product name.');
//             isValid = false;
//         } else {
//             displayErrorMessage('name-error', '');
//         }
    
//         const description = document.getElementById('description').value.trim();
//         if (!description) {
//             displayErrorMessage('description-error', 'Please enter the product description.');
//             isValid = false;
//         } else {
//             displayErrorMessage('description-error', '');
//         }
    
//         const brand = document.getElementById('brand').value.trim();
//         if (!brand) {
//             displayErrorMessage('brand-error', 'Please enter the brand name.');
//             isValid = false;
//         } else {
//             displayErrorMessage('brand-error', '');
//         }
    
//         const quantity = document.getElementById('quantity').value.trim();
//         if (!quantity) {
//             displayErrorMessage('quantity-error', 'Please enter the product quantity.');
//             isValid = false;
//         } else {
//             displayErrorMessage('quantity-error', '');
//         }
    
//         // Pricing Validation
//         const price = document.getElementById('price').value.trim();
//         if (!price) {
//             displayErrorMessage('price-error', 'Please enter the product price.');
//             isValid = false;
//         } else {
//             displayErrorMessage('price-error', '');
//         }
    
//         // Date Validation
//         const date = document.getElementById('date').value.trim();
//         if (!date) {
//             displayErrorMessage('date-error', 'Please select a valid date.');
//             isValid = false;
//         } else {
//             displayErrorMessage('date-error', '');
//         }
    
//        // Validate Category
//     const selectedCategory = document.querySelector('input[name="category"]:checked');
//     if (!selectedCategory) {
//         const categoryError = document.getElementById('category-error');
//         categoryError.textContent = 'Please select a product category.';
//         isValid = false;
//     } else {
//         const categoryError = document.getElementById('category-error');
//         categoryError.textContent = ''; // Clear error message
//     }

//     // Media Validation
//     const images = document.getElementById('images').files;
//     if (images.length === 0) {
//         const imageError = document.getElementById('image-error');
//         imageError.textContent = 'Please select at least one image.';
//         isValid = false;
//     } else {
//         const imageError = document.getElementById('image-error');
//         imageError.textContent = ''; // Reset error message
//     }

//     return isValid;
// }
    
//     function displayErrorMessage(elementId, message) {
//         const errorElement = document.getElementById(elementId);
//         errorElement.textContent = message;
//     }



//     //---------- cropper.js ------------------------------
//     document.addEventListener('DOMContentLoaded', function () {
//         console.log("DOM content loaded");
//         const input = document.getElementById('images');
//         const form = document.getElementById('addProductForm');
//         const submitBtn = document.getElementById('submit-btn');
//         let croppers = [];

//         input.addEventListener('change', function (event) {
//             console.log("File input changed");
//             const files = event.target.files;
//             if (!files || files.length === 0) return;
            
//             // Clear existing croppers
//             croppers.forEach(cropper => cropper.destroy());
//             croppers = [];

//             // Create cropper for each selected image
//             Array.from(files).forEach(file => {
//                 const reader = new FileReader();
//                 reader.onload = function (e) {
//                     console.log("Image file loaded");
//                     const img = new Image();
//                     img.src = e.target.result;
//                     img.onload = function () {
//                         console.log("Image loaded");
//                         const cropper = new Cropper(img, {
//                             aspectRatio: 1, // Set aspect ratio as needed
//                             viewMode: 2, // Set view mode as needed
//                             crop(event) {
//                                 // Handle crop event if needed
//                             }
//                         });
//                         croppers.push(cropper);
//                     };
//                 };
//                 reader.readAsDataURL(file);
//             });
//         });

//         form.addEventListener('submit', function (event) {
//             console.log("Form submitted");
//             event.preventDefault();
//             const formData = new FormData(form);

//             // Append cropped images to formData
//             croppers.forEach((cropper, index) => {
//                 const canvas = cropper.getCroppedCanvas({
//                     width: 300, // Set desired width
//                     height: 300, // Set desired height
//                 });
//                 canvas.toBlob(blob => {
//                     formData.append(`croppedImage_${index}`, blob);
//                     if (formData.getAll('images').length === croppers.length) {
//                         // Submit form with cropped images
//                         fetch('/admin/createProduct', {
//                             method: 'POST',
//                             body: formData,
//                         })
//                         .then(response => response.json())
//                         .then(data => {
//                             // Handle response from backend if needed
//                         })
//                         .catch(error => {
//                             console.error('Error:', error);
//                         });
//                     }
//                 });
//             });
//         });
//     });



//     </script>
    


// <%- include('./layouts/footer.ejs')%>



// </div>


//-------------------------------------------------------------------------------------------------------------------------------------------------------------------<%- include('./layouts/header.ejs')%>

{/* <section class="content-main">
    <div class="row">
        <div class="col-6">
            <div class="content-header">
                <h2 class="content-title">Edit the Product</h2>
                
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-lg-6">
            <div class="card mb-4">
                <div class="card-body">
                    <form action="/admin/productEdited" method="post" enctype="multipart/form-data" onsubmit="return validateForm()">
                    <div class="row">
                        <div class="col-md-3">
                            <h6>1. General info</h6>
                        </div>
                        <div class="col-md-9">
                            <div class="mb-4">
                                <label class="form-label">Product name</label>
                                <input type="text" id="name" placeholder="Type here" class="form-control" value="<%= product.name %>" name="name">
                                <div class="error-message text-danger" id="name-error"></div>
                            </div>
                            <div class="mb-4">
                                <label class="form-label">Description</label>
                                <textarea name="description" id="description" placeholder="Type here" class="form-control" rows="4" ><%= product.description %></textarea>
                                <div class="error-message text-danger" id="description-error"></div>
                            </div>
                            <input type="hidden" name="id" value="<%= product._id %>">
                            <div class="mb-4">
                                <label class="form-label">Brand name</label>
                                <input value="<%=product.brand%>" name="brand" id="brand" type="text" placeholder="Type here" class="form-control">
                                <div class="error-message text-danger" id="brand-error"></div>
                            </div>
                            <div class="mb-4">
                                <label class="form-label">Quantity</label>
                                <input value="<%= product.quantity %>" name="quantity" id="quantity" type="number"  class="form-control">
                                <div class="error-message text-danger" id="quantity-error"></div>
                            </div>
                        </div> <!-- col.// -->
                    </div> <!-- row.// -->
                    <hr class="mb-4 mt-0">
                    <div class="row">
                        <div class="col-md-3">
                            <h6>2. Pricing</h6>
                        </div>
                        <div class="col-md-9">
                            <div class="mb-4">
                                <label class="form-label">Cost </label>
                                <input type="text" value="<%= product.price %>" id="price" name="price" class="form-control">
                                <div class="error-message text-danger" id="price-error"></div>
                            </div>
                        </div> <!-- col.// -->
                    </div> <!-- row.// -->
                    <div class="row">
                        <div class="col-md-3">
                            <h6>3. Date of creation</h6>
                        </div>
                        <div class="col-md-9">
                            <div class="mb-4">
                                <label class="form-label">Date </label>
                        
                                <input type="date" value="<%= moment(product.date).format('YYYY-MM-DD') %>" id="date" name="date" class="form-control">

                                <div class="error-message text-danger" id="date-error"></div>
                            </div>
                        </div> <!-- col.// -->
                    </div> <!-- row.// -->
                    <hr class="mb-4 mt-0">
                    <div class="row">
                        <div class="col-md-3">
                            <h6>3. Category</h6>
                        </div>
                        <div class="col-md-9">
                            <div class="mb-4">
                                <% category.forEach((categ) => { %>
                                    <label class="mb-2 form-check form-check-inline" style="width: 45%;">
                                        <input class="form-check-input" name="category" type="radio" value="<%= categ.name %>" <%= product.category.name === categ.name ? 'checked' : '' %>>
                                        <span class="form-check-label"> <%= categ.name %> </span>
                                    </label>
                                <% }) %>
                                
                               
                         </div>
                        </div> <!-- col.// -->
                    </div> <!-- row.// -->
                    <hr class="mb-4 mt-0">
                    <div class="row">
                        <div class="col-md-3">
                            <h6>4. Media</h6>
                        </div>
                        <div class="col-md-9">
                            <div class="mb-4">
                             
                                <label class="form-label">Images</label>
                                <input id="images" name="images" class="form-control" type="file"  multiple>

                                <% product.images.forEach((image, index) => { %>
                                    <input id="hiddenImage" type="hidden" name="existingImages" value="<%= image %>">
                                <% }) %>
                                <!-- Display filenames -->
                                <div>
                                    <% product.images.forEach((image, index) => { %>
                                        <span id="imageValidationTest"><%= image %></span>
                                       
                                       
                                    <% }) %>
                                </div>


                                <div class="error-message text-danger" id="image-error"></div>
                            </div>
                        </div> <!-- col.// -->



                        <div class="mb-4">
                            <label class="form-label">Images</label>


                            <% product.images.forEach((image, index) => { %>
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <div class="d-flex align-items-center">
                                        <img src="/adminAssets/imgs/category/<%= image %>" alt="Product Image" style="width: 30px; height: 30px; margin-right: 10px;">
                                        <span><%= image %></span>
                                    </div>
                                    <a href="#" onclick="confirmDelete('<%= index %>', '<%= product._id %>', event)" class="btn btn-danger btn-sm">Delete</a>

                                </div>
                            <% }) %>
                        </div>
                        



                    </div> <!-- .row end// -->
                    <div>
                   
                        <button type="submit" class="btn btn-md rounded font-sm hover-up">Publish</button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    </div>
</section> <!-- content-main end// -->

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>





    function validateForm() {
        // Reset any existing error messages
        clearErrorMessages();

        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const brand = document.getElementById('brand').value;
        const quantity = document.getElementById('quantity').value;
        const price = document.getElementById('price').value;
        const images = document.getElementById('imageValidationTest').value;

        
        let isValid = true;

        // General Info Validation
        if (!name.trim()) {
            displayErrorMessage('name-error', 'Please enter a product name.');
            isValid = false;
        }

        if (!description.trim()) {
            displayErrorMessage('description-error', 'Please enter a product description.');
            isValid = false;
        }

        if (!brand.trim()) {
            displayErrorMessage('brand-error', 'Please enter a brand name.');
            isValid = false;
        }

        if (!quantity.trim() || isNaN(quantity) || quantity < 0) {
            displayErrorMessage('quantity-error', 'Please enter a valid product quantity.');
            isValid = false;
        }

        // Pricing Validation
        if (!price.trim() || isNaN(price) || price < 0) {
            displayErrorMessage('price-error', 'Please enter a valid product price.');
            isValid = false;
        }

        // Category Validation
        const selectedCategory = document.querySelector('input[name="category"]:checked');
        if (!selectedCategory) {
            displayErrorMessage('category-error', 'Please select a category.');
            isValid = false;
        }

        // Media Validation
        if (images.length === 0) {
            displayErrorMessage('image-error', 'Please select at least one image.');
            isValid = false;
        } else {
            // Validate image types (JPG or PNG)
            const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            for (const image of images) {
                if (!allowedImageTypes.includes(image.type)) {
                    displayErrorMessage('image-error', 'Please select images with JPG or PNG formats.');
                    isValid = false;
                    break; // Stop checking once an invalid image type is found
                }
            }
        }

        return isValid;
    }

    function clearErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach((errorMessage) => {
            errorMessage.innerText = '';
        });
    }

    function displayErrorMessage(errorId, message) {
        const errorDiv = document.getElementById(errorId);
        errorDiv.innerText = message;
    }



// delete image===============================
function confirmDelete(index, productId, event) {
    event.preventDefault(); // Prevent the default action of the anchor tag
    Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to delete this image!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = `/admin/deleteimage?index=${index}&id=${productId}`;
        }
    });
}


    </script>




<%- include('./layouts/footer.ejs')%></div>





</section> */}

//


const updatedProductsDiscount = async (products) => {
  try {
    // Retrieve offers for products and categories
    const productOffers = await Promise.all(products.map(async (product) => {
      if (product.offer) {
        return product.offer;
      }
      return null;
    }));

    const categoryOffers = await Promise.all(products.map(async (product) => {
      if (product.category && product.category.offer) {
        return product.category.offer;
      }
      return null;
    }));

    // Count the number of offers
    const numProductOffers = productOffers.filter(offer => offer !== null).length;
    const numCategoryOffers = categoryOffers.filter(offer => offer !== null).length;

    // Compare counts and choose the offer type
    const chosenOffers = numProductOffers > numCategoryOffers ? productOffers : categoryOffers;

    // Apply discounts based on chosen offers
    return await Promise.all(products.map(async (product, index) => {
      const offer = chosenOffers[index];

      if (offer) {
        const discount = Math.round(product.price * (offer.discount / 100));
        product.offerprice = product.price - discount;
      } else {
        product.offerprice = undefined;
      }

      await product.save();
      return product;
    }));
  } catch (error) {
    console.error("Error updating products:", error);
    throw error;
  }
};

















const placeTheOrder = async (req, res) => {
  try {
      console.log('order placing started')
      const userId = req.session.userData;
      const { couponCode, paymentMethod, selectedValue } = req.body;

      console.log('payment method selected is :', paymentMethod);

      // ...

      // Calculate total discount directly from the coupon amount received from the frontend
      let discountAmount = 0;
      if (couponCode) {
          discountAmount = couponCode; // Assuming couponCode contains the discount amount
          totalWithDiscount -= discountAmount;
      }

      console.log('discount amount at place order:', discountAmount);

      // ...

      // Calculate shipping charges based on totalWithDiscount
      let shippingCharges = totalWithDiscount > 500 ? 'free delivery' : '₹40.00';

      // Adjust grand total based on shipping charges
      let grandTotal = shippingCharges === '₹40.00' ? totalWithDiscount + 40 : totalWithDiscount;

      // ...

      // Construct order data
      const orderData = {
          // ...
          couponDiscount: discountAmount,
          total: totalWithDiscount,
          // ...
      };

      // ...
  } catch (error) {
      console.error('Error placing order at placeTheOrder of ordercontroller:', error);
      res.status(500).json({ success: false, message: 'An error occurred while processing the order.' });
  }
};

//--------- forgot email

const { value: email } = await Swal.fire({
  title: "Input email address",
  input: "email",
  inputPlaceholder: "Type here"
});

if (email) {
  // Redirect to OTP verification page
  window.location.href = "/otp-verification?email=" + email;
}










const mongoose = require('mongoose');
const randomstring = require('randomstring');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, default: () => randomstring.generate(10) },
  orderStatus: String,
  paymentMode: String,
  date: Date,
  address: {
    name: String,
    // other address fields
  },
  productPrice: Number
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;



const randomStrHex = randomstring.generate({
  length: 16,
  charset: 'hex'
});









const generateWeeklyReport = async (req, res) => {
  try {
      // Get the start and end of the current week
      const startOfWeek = moment().startOf('isoWeek');
      const endOfWeek = moment().endOf('isoWeek');

      console.log('Start of Week:', startOfWeek.toDate());
      console.log('again debug :', moment(startOfWeek).format('DD-MM-YYYY'));
      console.log('End of Week:', endOfWeek.toDate());
      console.log('again debug :', moment(endOfWeek).format('DD-MM-YYYY'));

      const weeklyOrders = await Orders.aggregate([
          {
              $match: {
                  createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
              }
          },
          {
              $group: {
                  _id: { $week: "$createdAt" },
                  totalOrders: { $sum: 1 },
                  totalCouponDiscount: { $sum: "$couponDiscount" },
                  products: { $push: "$Products" }
              }
          },
          {
              $unwind: "$products"
          },
          {
              $unwind: "$products"
          },
          {
              $match: {
                  "products.orderStatus": "delivered"
              }
          },
          {
              $group: {
                  _id: "$_id",
                  totalOrders: { $first: "$totalOrders" },
                  totalCouponDiscount: { $first: "$totalCouponDiscount" },
                  totalSubTotal: { $sum: "$products.subTotal" }
              }
          },
          {
              $addFields: {
                  weekRange: {
                      $let: {
                          vars: {
                              startOfWeek: { $dateToString: { format: "%d-%b-%Y", date: startOfWeek.toDate() } },
                              endOfWeek: { $dateToString: { format: "%d-%b-%Y", date: endOfWeek.toDate() } }
                          },
                          in: { $concat: ["$$startOfWeek", " to ", "$$endOfWeek"] }
                      }
                  }
              }
          },
          {
              $project: {
                  _id: "$weekRange",
                  totalOrders: 1,
                  totalCouponDiscount: 1,
                  totalSubTotal: 1
              }
          }
      ]);

      console.log('Weekly orders shown in the DOM when the weekly button is clicked:', weeklyOrders);

      res.render('reports', {
          report: weeklyOrders,
          reportType: 'Weekly',
          moment,
      });
  } catch (error) {
      console.log('Error generating weekly sales report:', error);
      res.redirect('/error');
  }
};

\






let orders = await Orders.aggregate([
  {
      $match: {}
  },
  {
      $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalCouponDiscount: { $sum: "$couponDiscount" },
          products: { $push: "$Products" }
      }
  },
  {
      $unwind: "$products"
  },
  {
      $unwind: "$products"
  },
  {
      $match: { "products.orderStatus": "delivered" }
  },
  {
      $group: {
          _id: "$_id",
          totalOrders: { $first: "$totalOrders" },
          totalCouponDiscount: { $first: "$totalCouponDiscount" },
          totalSubTotal: { $sum: "$products.subTotal" }
      }
  }
]);

console.log('orders is :', orders);
