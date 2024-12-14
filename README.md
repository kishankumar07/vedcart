
# VedCart - An Ayurvedic E-Commerce Website

VedCart is a fully functional e-commerce web application, tailored for Ayurvedic products, built from scratch using the modern web technologies. The application supports a seamless shopping experience for users and efficient management for administrators with the admin panel.



## Features

### User Features
- **Authentication** : Supports login via OTP and Google.
- **Shopping Experience** : Add products to cart and wishlist.
- **Address Management** : Manage addresses during checkout and also at user profile.
- **Order Management** : View and track orders.
- **Payments** : Integrated Razorpay for secure and seamless transactions.
- **Download Invoice** : Download the order details in pdf format.

### Admin Features
- **User Management** : Add, soft-delete, and update user accounts.
- **Product Management** : Add, update, and delete products with category and image management (using Multer).
- **Order Handling** : View and update user orders.
- **Sales Report** :  View the overall sales using custom filtering such as Daily, Monthly, Weekly and Yearly. Download the report in pdf or excel format
## Technologies Used
- **Backend**: Node.js with Express.js
- **Frontend**: Server-side rendering with EJS templates
- **Database**: MongoDB for scalable and efficient data storage
- **Deployment**: Dockerized using Docker Compose for easy setup and deployment


## Installation

### Prerequisites
Ensure you have the following installed on your system:
- Node.js
- Docker Desktop

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/kishankumar07/vedcart.git

   cd vedCart

2. Create a .env file in project's root and run this command:    

    ```bash
    cp .env.sample .env

    ```
After successful creation please fill in with the respective details for the smooth functioning. A brief description of what should be filled in each of them is also provided.


3. Build and run the Docker containers:

    ```bash
    docker-compose up --build

    ```

4. Access the application in your browser at http:localhost:3000.

## Deployment
The application is containerized using Docker and Docker Compose, ensuring a seamless deployment process across different environments.

## Demo
- video link : https://www.linkedin.com/posts/kishan-ta_ayurveda-ecommerce-nodejs-activity-7207211393215811584-R1rs?utm_source=share&utm_medium=member_desktop
- Live Demo : https://vedcart.onrender.com

## Contributing 
Contributions are welcome! Feel free to fork the repository and create a pull request with your proposed changes.


## 🔗 Links


[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kishan-ta)
[![medium](https://img.shields.io/badge/medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@kishantashok)




## License


This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/mit) file for details.