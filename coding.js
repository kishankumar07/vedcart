// let query = [{
//     id:1,name:"Alice"
// },
// {
//     id:2,name:"Bob"
// },
// {
//     id:3,name:"Henry"
// }]

// let n=2;//number of items to skip
// let m = 1;//limit amount

// let result = query.slice(n, n+m);

// console.log('result value is :',result)

let arr =[1,2,3,4,5,6,7,7,8,0]

let b = arr.slice(2,3);
console.log('value of b is :',b)






<% userNameforProfile.addressField.forEach(address =>{ %>
    <div
      class="modal fade"
      id="editModal<%= address._id %>"
      tabindex="-1"
      role="dialog"
      aria-labelledby="editModalLabel<%= address._id %>"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <!-- Add your modal content here -->
          <div class="modal-header">
            <h5
              class="modal-title"
              id="editModalLabel<%= address._id %>"
            >
              Edit Address
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <!-- Add your form fields with predefined values here -->
            <form id="editForm<%= address._id %>">
              <!-- Example input field (replace with your actual form fields) -->
              <div class="modal-body mx-3">
                <div class="modal-body mx-3">
                  <div class="form-group">
                    <label for="editName<%= address._id %>"
                      >Name</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="editName<%= address._id %>"
                      value="<%= address.name %>"
                      name="name"
                    />

                    <p id="addn" style="color: red"></p>
                  </div>

                  <div class="form-group">
                    <label for="editMobile<%= address._id %>"
                      >Mobile Number</label
                    >
                    <input
                      type="tel"
                      class="form-control"
                      id="editMobile<%= address._id %>"
                      value="<%= address.mobile %>"
                      name="mobile"
                      required
                    />
                    <p id="addm" style="color: red"></p>
                  </div>

                  <div class="form-group">
                    <label for="editPincode<%= address._id %>"
                      >Pincode</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="editPincode<%= address._id %>"
                      value="<%= address.pincode %>"
                      name="pincode"
                      required
                    />
                    <p id="addp" style="color: red"></p>
                  </div>

                  <div class="form-group">
                    <label for="editAddress<%= address._id %>"
                      >Address</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="editAddress<%= address._id %>"
                      value="<%= address.addressDetails %>"
                      name="address"
                      required
                    />
                    <p id="adda" style="color: red"></p>
                  </div>

                  <div class="form-group">
                    <label for="editCity<%= address._id %>"
                      >City</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="editCity<%= address._id %>"
                      value="<%= address.city %>"
                      name="city"
                      required
                    />
                    <p id="addc" style="color: red"></p>
                  </div>

                  <div class="form-group">
                    <label for="editState<%= address._id %>"
                      >State</label
                    >

                    <select
                      class="form-control"
                      id="editState<%= address._id %>"
                      name="state"
                    >
                      <option value="" selected disabled>
                        Select your state
                      </option>
                      <% states.forEach(state => { %>
                      <option value="<%= state %>">
                        <%= state %>
                      </option>
                      <% }); %>
                    </select>
                  </div>
                  <p id="adds" style="color: red"></p>
                </div>

                <!-- Add more fields as needed -->

                <!-- Example Save button -->
                <button
                  type="button"
                  class="btn btn-primary"
                  onclick="saveEdit('<%= address._id %>')"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <%})%>