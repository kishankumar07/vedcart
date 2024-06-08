
Aws credentials 
user : ubuntu
password : Kckz@123

pm2 start index --watch


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



<script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script><dotlottie-player src="https://lottie.host/e4bfdd69-4e1c-44ec-9dd6-903340c291be/mjMLqsFrvg.json" background="transparent" speed="1" style="width: 150px; height: 100px" direction="1" playMode="normal" loop autoplay></dotlottie-player>






sahajarati kashayam
sukumara kashayam
danwantharam kashayam
moolakathi kashayam
mridyugadhi kashayam
baladi kashayam
punarnavadi kashayam










const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            order.paymentStatus = 'paid';
            await order.save();
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    retryPayment,
    verifyPayment,
    // other functions
};





const loadUserProfile = async (req, res) => {
    try {
      // Access common data attached by the middleware
      const { userNameforProfile, cart, categoriesWithProducts, totalPriceOfCartProducts, userId, cartProductCount, wishlistProductCount } = res.locals.commonData;
  
      if (!userId) {
        res.redirect("/");
        return; // Add return statement to prevent further execution
      }
  
      let category = await Category.find({ status: "active" });
  
      // Query orders sorted by createdAt field in descending order
      const orders = await Orders.find({ userId: userId }).sort({ createdAt: -1 });
  
      let states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
      ];
  
      res.render("userProfile", { cart, totalPriceOfCartProducts, moment, categoriesWithProducts, userNameforProfile, userId, orders, category, states, orders, cartProductCount, wishlistProductCount });
    } catch (error) {
      console.log('error at loading userProfilePage', error);
      res.redirect("/error");
    }
  };
  









  const weeklySalesReport = async (req, res) => {
    try {
        // Define the start and end of the week
        const startOfWeek = moment().utc().startOf('week');
        const endOfWeek = moment().utc().endOf('week');

        // Detailed Orders Aggregation for the Week
        let weeklyOrders1 = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $unwind: "$Products"
            },
            {
                $match: { "Products.orderStatus": "delivered" }
            },
            {
                $project: {
                    orderId: 1,
                    paymentMode: 1,
                    date: 1,
                    address: 1,
                    orderStatus: "$Products.orderStatus",
                    productPrice: "$Products.subTotal"
                }
            }
        ]);

        // Summarized Report Aggregation for the Week
        const weeklyOrders = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%U", date: "$createdAt" } },
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
            }
        ]);

        res.render('reports', {
            report: weeklyOrders,
            reportType: 'Weekly',
            moment,
            tableOrders: weeklyOrders1
        });
    } catch (error) {
        console.log('Error generating weekly sales report:', error);
        res.redirect('/error'); // Redirect to an error page if an error occurs
    }
};




const mongoose = require("mongoose");

const dbConnect = async (req, res) => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            connectTimeoutMS: 30000, // Set the timeout to 30 seconds (adjust as needed)
            useNewUrlParser: true, // Optional: These options are commonly used
            useUnifiedTopology: true, // Optional: These options are commonly used
        });

        console.log("Database connected at atlas");
    } catch (error) {
        console.error("Database error", error);
    }
};

module.exports = dbConnect;
















Yes, using the VS Code Remote - SSH extension, you will be able to edit the code on your deployment server as if it were local. Here's how you can set it up and use it:

Setting Up VS Code Remote - SSH Extension
Install VS Code:
Make sure you have Visual Studio Code installed on your local machine.

Install the Remote - SSH Extension:

Open VS Code.
Go to the Extensions view by clicking the Extensions icon in the Activity Bar on the side of the window or by pressing Ctrl + Shift + X.
Search for "Remote - SSH" and install the extension by Microsoft.
Configure SSH Connection:

Open the command palette by pressing Ctrl + Shift + P (or Cmd + Shift + P on macOS).
Type Remote-SSH: Connect to Host... and select it.
Enter your SSH connection string, e.g., ubuntu@your_server_ip.
If prompted, select the SSH configuration file to update (usually ~/.ssh/config).
Connecting to the Remote Server:

After setting up the connection string, select Remote-SSH: Connect to Host... again.
Choose your configured host from the list.
VS Code will connect to your remote server and open a new window.
Open Your Project:

Once connected, you can open your project directory.
Use File > Open Folder... to navigate to your project directory on the remote server (e.g., /home/ubuntu/vedcart).
Editing and Deploying Code
Editing Files:

You can now edit any files in your project directory using VS Code as if they were on your local machine.
All changes will be saved directly to the files on the remote server.
Using Terminal:

You can also open a terminal in VS Code that will run commands on the remote server.
Use Terminal > New Terminal to open a new terminal window.
From here, you can run commands like npm install, pm2 restart, or any other deployment commands needed.
Deploying Changes:

After making changes to your code, you can restart your application or run deployment scripts directly from the VS Code terminal.
Example Workflow
Open VS Code and connect to your server:

Ctrl + Shift + P > Remote-SSH: Connect to Host... > select your host.
Open your project directory:

File > Open Folder... > navigate to /home/ubuntu/vedcart.
Edit your files:

Make changes to your code using the VS Code editor.
Deploy changes:

Open a terminal in VS Code (Terminal > New Terminal).
Run deployment commands, e.g.:
sh
Copy code
cd ~/vedcart
pm2 restart index
By using the VS Code Remote - SSH extension, you can have the full power of VS Code to edit and manage your project files on the remote server, making it much easier to develop, test, and deploy your application.






git clone https://github.com/kishankumar07/vedcart.git









const updateCategory = async (req, res) => {
    try {
      let { id, name, description } = req.body;
  
      // Check if category with the same name already exists (case-insensitive)
      let existingCategory = await Category.findOne({
        name: { $regex: new RegExp(name, "i") },
      });
  
      // If category exists and it's not the same as the one being updated
      if (existingCategory && existingCategory._id.toString() !== id) {
        return res
          .status(400)
          .json({ success: false, message: "Category already exists" });
      }
  
      // Build the update object
      let updateObject = {
        name: name,
        description: description,
      };
  
      // If image file is provided, add it to the update object
      if (req.file && req.file.filename) {
        updateObject.image = req.file.filename;
      }
  
      // Find the category by ID and update it
      let categoryFound = await Category.findByIdAndUpdate(
        id,
        updateObject,
        { new: true }
      );
  
      return res
        .status(201)
        .json({ success: true, message: "Category updated successfully" });
    } catch (error) {
      console.log("Error at update category:", error);
      res.status(500).redirect("/error");
    }
  };
  


  const forgotPasswordChangePassword = async (req, res) => {
    console.log('change password when forgot password controller at userProfile reached');
    const userId = req.session.userData;
    const {  password } = req.body;

    try {
  
  
      const user = await User.findById(userId)
  
  
      if (!user) {
        console.log('user was not found');
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (!password) {
        return res.status(400).json({ message: 'Password is requiired.' });
      }
  
  
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          return res.status(400).json({ message: 'New password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.' });
        }
  
     
      //if all the validations are passed, move on to update the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;
  
      await user.save()
      
  
      return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
    console.error('error while updating the password at user profile : ',error);
    res.status(500).redirect('/error');
    }
  }
  
  

  const updatePassword = async (req, res) => {
    const email = req.query.email;
    const { password } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Assuming you have a method to hash passwords
        user.password = await hashPassword(password);
        await user.save();

        return res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.log('Error updating password:', err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};









  