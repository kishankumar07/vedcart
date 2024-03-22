//index : line 119 is login validation


//====================Registration validation=====================

function registerValidation() {
  let name = document.getElementById("name");
  let email = document.getElementById("email");
  let mobile = document.getElementById("mobile");
  let password = document.getElementById("password");
  let conPassword = document.getElementById("conPassword");

  //Error fields
  let nameErr = document.getElementById("nameErr");
  let emailErr = document.getElementById("emailErr");
  let mobileErr = document.getElementById("mobileErr");
  let passwordErr = document.getElementById("passwordErr");
  let passwordMismatch = document.getElementById("passwordMismatch");
  let finalArr = [nameErr, emailErr, mobileErr, passwordErr, passwordMismatch];
  //Regex
  const nameRegex = /^[A-Z]/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail+\.[a-zA-Z]{3}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const mobileRegex = /^[0-9]\d{9}$/;

  //No field for confirm password

  //name Field

// Function to clear error messages
function clearErrors() {
  nameErr.innerHTML = "";
  emailErr.innerHTML = "";
  mobileErr.innerHTML = "";
  passwordErr.innerHTML = "";
  passwordMismatch.innerHTML = "";
}

// Clear errors when any field is focused
name.addEventListener("focus", clearErrors);
email.addEventListener("focus", clearErrors);
mobile.addEventListener("focus", clearErrors);
password.addEventListener("focus", clearErrors);
conPassword.addEventListener("focus", clearErrors);



  if (name.value.trim() === "") {
    nameErr.innerHTML = "Name cannot be blank";
    console.log("name error");
    // setTimeout(()=>{
    //     nameErr.innerHTML = '';
    // },5000)
    return false;
  }

  if (!nameRegex.test(name.value)) {
    nameErr.innerHTML = "First letter should be a capital letter";
    console.log("name error2");
    // setTimeout(() => {
    //   nameErr.innerHTML = "";
    // }, 5000);
    return false;
  }
  //email field
  if (email.value.trim() === "") {
    emailErr.innerHTML = "Email is required";
    // setTimeout(() => {
    //   email.innerHTML = "";
    // }, 5000);
    return false;
  }
  if (!emailRegex.test(email.value)) {
    emailErr.innerHTML = "Please enter a valid email";
    // setTimeout(() => {
    //   emailErr.innerHTML = "";
    // }, 5000);
    return false;
  }

//Mobile field
if (mobile.value.trim() === "") {
  mobileErr.innerHTML = "Mobile cannot be empty";
  // setTimeout(() => {
  //   mobileErr.innerHTML = "";
  // }, 5000);
  return false;
}
if (new Set(mobile.value).size === 1) {
  mobileErr.innerHTML = "Mobile number should not consist of the same digit.";
  // setTimeout(() => {
  //   mobileErr.innerHTML = "";
  // }, 5000);
  return false;
}
if (!mobileRegex.test(mobile.value)) {
  mobileErr.innerHTML = "Please enter a 10 digit mobile number";
  // setTimeout(() => {
  //   mobileErr.innerHTML = "";
  // }, 5000);
  return false;
}

  //password field
  if (password.value.trim() === "") {
    passwordErr.innerHTML = "Field is required";
    // setTimeout(() => {
    //   passwordErr.innerHTML = "";
    // }, 5000);
    return false;
  }
  if (!passwordRegex.test(password.value)) {
    passwordErr.innerHTML = "Please enter a Strong password";
    // setTimeout(() => {
    //   passwordErr.innerHTML = "";
    // }, 5000);
    return false;
  }
  if (password.value !== conPassword.value) {
    passwordErr.innerHTML = "Passwords do not match. Please try again.";
    // setTimeout(() => {
    //   passwordErr.innerHTML = "";
    // }, 5000);
    return false;
  }

  

  return true;
}


//=====================Login validation========================================

async function loginValidation(event){
  event.preventDefault(); // Prevent the default form submission
      
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        const emailErr = document.getElementById("emailErr");
        const passwordErr = document.getElementById("passwordErr");
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        // Email field
        if (email.value.trim() === "") {
          emailErr.innerHTML = "Email field is required";
          setTimeout(() => {
            emailErr.innerHTML = "";
          }, 5000);
          return false;
        } else if (!emailRegex.test(email.value)) {
          emailErr.innerHTML = "Please enter a valid email";
          setTimeout(() => {
            emailErr.innerHTML = "";
          }, 5000);
          return false;
        }

        // Password field
        if (password.value.trim() === "") {
          passwordErr.innerHTML = "Password field is required";
          setTimeout(() => {
            passwordErr.innerHTML = "";
          }, 5000);
          return false;
        }

        return true; // Form is valid
      }
    
