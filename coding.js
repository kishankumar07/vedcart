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







const signinUser = async (req, res) => {
    try {
      let message = req.flash("er"); // Use the correct flash message key
      console.log('message passed at signin page when session is out:', message);
      res.render("userSignin", { message });
    } catch (error) {
      console.log("login user error:", error);
      res.redirect('/error');
    }
  };
  



  const verifyLogin = async (req, res) => {
    try {
      console.log('reached at verifylogin controller ');
      let { email, password } = req.body;
      const userData = await User.findOne({ email: email });
  
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
  
        if (passwordMatch) {
          if (!userData.isBlocked && userData.isVerified) {
            req.session.userData = userData._id;
            console.log('finally at session :', req.session.userData);
            return res.redirect('/');
          } else {
            req.flash('er', 'Account blocked by the administrator or user not verified');
            return res.redirect('/signin');
          }
        } else {
          req.flash('er', 'Incorrect username or password');
          return res.redirect('/signin');
        }
      } else {
        req.flash('er', 'No user found');
        return res.redirect('/signin');
      }
    } catch (error) {
      console.log('error at verify login ,:', error);
      res.redirect("/error");
    }
  };
  