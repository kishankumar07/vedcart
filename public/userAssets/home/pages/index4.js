<%- include('../partials/header'); -%>




<section class="content-main">

  <style>
        .image-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: flex-start; /* Align items at the start of the container */
        }

        .image-box {
            flex: 0 0 calc(33.33% - 8px); /* Adjust the width as needed, considering margin */
            margin: 4px; /* Add margin between image boxes */
            overflow: hidden;
            position: relative;
        }

        .image-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .delete-button {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: red;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
        }
    </style>
 <div class="col-md-15 mr-auto ">
  <form
    id="myForm"
    action=""
    method="post"
    enctype="multipart/form-data"
  >
    <div class="row">
      <div class="col-6">
        <div class="content-header">
          <h2 class="content-title">Add New Product</h2>
          <div></div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-6">
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <h6>1. General info</h6>
              </div>
              <div class="col-md-9">
                <div class="mb-4">
                  <label class="form-label">Product title</label>
                  <input
                    type="text"
                    placeholder="Type here"
                    class="form-control"
                    id="productName"
                    name="productName"
                    required
                  />
                </div>
                <div class="mb-4">
                  <label class="form-label">Description</label>
                  <textarea
                    placeholder="Type here"
                    class="form-control"
                    rows="4"
                    id="description"
                    name="description"
                    required
                  ></textarea>
                </div>
                <div class="mb-4">
                  <label class="form-label">Brand name</label>
                <input
                    type="text"
                    placeholder="Type here"
                    class="form-control"
                    id="brand"
                    name="brand"
                    required
                  />
                </div>
              </div>
              <!-- col.// -->
            </div>
            <!-- row.// -->
            <hr class="mb-4 mt-0" />
            <div class="row">
              <div class="col-md-3">
                <h6>2. Pricing</h6>
              </div>
              <div class="col-md-9">
                <div class="mb-4">
                  <label class="form-label">Cost in USD</label>
                  <input
                    type="text"
                    placeholder="$00.0"
                    class="form-control"
                    id="price"
                    name="price"
                    required
                  />
                </div> 
              </div>
              <!-- col.// -->
            </div>
            <!-- row.// -->
            <hr class="mb-4 mt-0" />
            <div class="row">
              <div class="col-md-3">
                <h6>3. Category</h6>
              </div>

            <div class="col-md-9">
    <div class="mb-4">
        <!-- Dropdown select for category -->
        <select class="form-select" name="mycategory" id="category" required>
            <option value="">Select Category</option>
            <% category.forEach(category => { %>
                <option value="<%= category._id%>"><%= category.category_name %></option>
            <% }); %>
        </select>
    </div>
</div>

              <!-- col.// -->
            </div>
            <!-- row.// -->
            <hr class="mb-4 mt-0" />
            <div class="row">
              <div class="col-md-3">
                <h6>4. Quantity</h6>
              </div>
              <div class="col-md-9">
                <div class="mb-4">
                  <label class="form-label">Available Quantity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    class="form-control"
                    id="quantity"
                    name="quantity"
                    required
                  />
                </div>
              </div>
              <!-- col.// -->
            </div>
            <!-- .row end// -->

            <!-- Added Quantity field -->
            <hr class="mb-4 mt-0" />
            <div class="row">
              <div class="col-md-3">
                               <h6>5. Media</h6>
                            </div>
                            <div class="col-md-9">
                                <div class="mb-4">
                                    <label class="form-label">Images</label>
                                    <input
                                        id="images"
                                        name="images"
                                        multiple
                                        class="form-control"
                                        type="file"
                                         accept="image/*"
                                        onchange="handleImage()"
                                        required
                                    />
                                </div>

                                <!-- <div class="d-flex align-items-start">
                                    <div class="mb-4 me-4"> -->
                                        <!-- Display the original image -->
                                        <!-- <img id="output" class="img-fluid" alt="Original Image" />
                                    </div>

                                    <div class="mb-4">
                                        <button
                                            id="cropImgBtn"
                                            class="btn btn-md rounded font-sm hover-up"
                                            disabled
                                        >
                                            Crop image
                                        </button>
                                    </div>
                                </div>

                                <div id="croppedOutputContainer" class="mb-4 text-end">
                                    Display the cropped image on the right side
                                    <img id="croppedOutput" class="img-fluid" alt="Cropped Image" />
                                </div> -->

                                <!-- Moved the submit button to the end -->
                                <div class="row">
                                    <div class="col-md-12 text-end">
                                        <button class="btn btn-md rounded font-sm hover-up" onclick="return sendForm()">
                                            Submit
                                        </button>
                                          <!-- <input type="hidden" id="croppedImageData" name="croppedImageData" /> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </form>
 <div class="col-md-6 bg-light">
  <h6 class="text-center">Image Preview</h6>
  <div id="imagePreviewContainer" class="image-container">
    <!-- Image previews will be displayed here -->
  </div>
</div>

</section>

<script>
function handleImage() {
    var input = document.getElementById('images');
    var realTimePreviewContainer = document.getElementById('imagePreviewContainer');
    var selectedImages = []; 

    for (var i = 0; i < input.files.length; i++) {
        var reader = new FileReader();

        reader.onload = (function (index) {
            return function (e) {
                var div = document.createElement('div');
                div.className = 'image-box';

                var img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'img-fluid';
                div.appendChild(img);
                 selectedImages.push(img.src); // Add the selected image to the array

                var deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.innerHTML = 'Delete';
                deleteButton.onclick = function () {
                    var deletedSrc = img.src;
                    var index = selectedImages.indexOf(deletedSrc);
                    console.log("deleted image",selectedImages);
                    if (index !== -1) {
                        selectedImages.splice(index, 1); // Remove the selected image from the array
                    }
                    div.remove(); // Remove the image box when the delete button is clicked
                };

                div.appendChild(deleteButton);

               
                console.log("selected ima", selectedImages);
                realTimePreviewContainer.appendChild(div);
            };
        })(i);

        reader.readAsDataURL(input.files[i]);
    }

    return selectedImages;
}

</script>

<script>
    function sendForm() {
        const selectedImages = handleImage();
        if (validateForm(selectedImages)) {
            const productName = document.getElementById("productName").value;
            const description = document.getElementById("description").value;
            const brand = document.getElementById("brand").value;
            const price = document.getElementById("price").value;
            const quantity = document.getElementById("quantity").value;

            fetch("/admin/createProduct", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: selectedImages,
                    productName: productName,
                    description: description,
                    brand: brand,
                    price: price,
                    quantity: quantity
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }
</script>

<script>
    function validateForm(selectedImages) {
        const productName = document.getElementById("productName").value;
        const description = document.getElementById("description").value;
        const brand = document.getElementById("brand").value;
        const price = document.getElementById("price").value;
        const quantity = document.getElementById("quantity").value;
        console.log(productName,description,brand,price,quantity,selectedImages.length);

        if (!productName || !description || !brand || !price || !quantity || selectedImages.length === 0) {
            alert("Please fill all the required fields and select at least one image");
            return false;
        }

        if (!/^(?!\s+$)[A-Za-z\d. ']+$/.test(productName)) {
            alert("Product name cannot contain spaces");
            return false;
        }

        if (!/^(?!\s+$)[A-Za-z\d. ']+$/.test(description)) {
            alert("Description cannot contain spaces");
            return false;
        }

        if (!/^(?!\s+$)[A-Za-z\d. ']+$/.test(brand)) {
            alert("Brand cannot contain spaces");
            return false;
        }

        if (!/^(?!\s+$)[A-Za-z\d. ']+$/.test(price)) {
            alert("Price cannot contain spaces");
            return false;
        }

        if (/\s/.test(quantity)) {
            alert("Quantity cannot contain spaces");
            return false;
        }

        // You can add more validation if needed

        return true;
    }
</script>




<!-- <script>
  let cropper; // Define cropper as a global variable

  function handleImage() {
    const input = document.getElementById("image");
    const file = input.files[0];
    console.log("Selected file:", file);

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const imageUrl = e.target.result;

        // Initialize CropperJS on the image element
        cropper = new Cropper(document.getElementById("output"), {
          aspectRatio: 0,
          viewMode: 1,
        });

        // Set the source of the Cropper to the selected image
        cropper.replace(imageUrl);

        // Enable the Crop button
        document.getElementById("cropImgBtn").disabled = false;
      };

      reader.readAsDataURL(file);
    }
  }



document.getElementById("cropImgBtn").addEventListener("click", (event) => {
    event.preventDefault();
    
    const croppedCanvas = cropper.getCroppedCanvas();
    if (croppedCanvas) {
      // Convert the cropped image data to a Blob
      croppedCanvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append("croppedImage", blob, "cropped-image.jpg");

        // Display the cropped image
        var croppedImage = croppedCanvas.toDataURL("image/jpeg");
        document.getElementById("croppedOutput").src = croppedImage;

        // Store the Blob in a hidden input field
        document.getElementById("croppedImageData").value = blob;

        console.log("Cropped image data stored.");
      }, "image/jpeg");
    } else {
      // Handle case where no selection is made
      console.error("No selection made.");
    }
  });
  function submitForm() {

        var croppedImage = document.getElementById("croppedImageData").value;

    var productName = document.getElementById("productNmae").value;
    var description = document.getElementById("description").value
    var brand       = document.getElementById("brand").value
    var price       = document.getElementById("price").value   
    var category    = document.getElementById("category").value
    var quantity    = document.getElementById("quantity").value

    var formData = {
  productName: productName,
  description: description,
  brand: brand,
  price: price,
  category: category,
  quantity: quantity,
  croppedImageData:croppedImage,
};
    
// const croppedCanvas = cropper.getCroppedCanvas();
// console.log("image when submit button clicked",croppedCanvas);
    fetch('/admin/createProduct', {
      method: 'POST',
      body: JSON.stringify(formData),

    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
        // Handle errors
      });
  }
</script> -->

<%- include('../partials/footer'); -%>