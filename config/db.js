const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.MONGODB_URI;

const connectDB = async (dbName) => {
    try {
        // If already connected to the desired database, skip reconnection
        
        if (mongoose.connection.readyState === 1 && mongoose.connection.name === dbName) {
            console.log(`Already connected to database: ${dbName}`);
            return;
        }

        // If a connection exists but to a different DB, disconnect first
        if (mongoose.connection.readyState === 1 && mongoose.connection.name !== dbName) {
            console.log(`Disconnecting from current database: ${mongoose.connection.name}`);
            await mongoose.disconnect();
        }

        // Establish a new connection
        await mongoose.connect(URI, { dbName });
        console.log(`Connected to database: ${dbName}`);
    } catch (error) {
        console.error(`Failed to connect to database: ${dbName}`);
        console.error('Error:', error);
    }
};

module.exports = connectDB;


//mongodb+srv://jyoti:Jyoti06@cluster0.esxtk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// const mongoose = require('mongoose');
// require('dotenv').config();

// const URI = process.env.MONGODB_URI;

// const connectDB = async (dbName) => {
//     //const dbURI = `${URI}/${dbName}`; // Construct the database URI with the provided dbName
//     //const dbName = "Jyoti"

// console.log("dbname",dbName);
//     try {
//         await mongoose.connect(URI, {
//             dbName
//         });
//         console.log(`Connected to database: ${dbName}`);
//     } catch (error) {
//         console.error(`Failed to connect to database: ${dbName}`);
//         console.error('Error:', error);
//     }
// }

// module.exports = connectDB;


// const mongoose = require('mongoose');
// require('dotenv').config();

// const URI = process.env.MONGODB_URI

// const connectDB = async () => {

//     try {
//         await mongoose.connect(URI);
//         console.log('Connected to database');
//     } catch (error) {
//         console.error("database is  not connected successfully")
//         handleError(error);
//     }


// }
// module.exports = connectDB;



// exports.onExecutePostLogin = async (event, api) => {
//     const prodNamespace = 'https://coruscating-sunshine-25faaf.netlify.app'; // Production namespace
//     const devNamespace = 'https://localhost:3000'; // Development namespace
    
//     const assignedRoles = event.authorization?.roles || [];
  
//     // Only proceed if no roles are assigned
//     if (assignedRoles.length === 0) {
//       try {
//         const response = await fetch(`https://lms-server-5uw4.vercel.app/api/teacher/check-role?email=${encodeURIComponent(event.user.email)}`);
//         const data = await response.json();
  
//         if (response.ok && data.role) {
//           assignedRoles.push(data.role);
//         } else {
//           assignedRoles.push('Student'); // Default role
//         }
  
//       } catch (error) {
//         console.error('Error calling the role check API: ', error);
//       }
//     }
  
//     // Set the roles in the ID Token for both production and development namespaces
//     api.idToken.setCustomClaim(`${prodNamespace}/roles`, assignedRoles);
//     api.idToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
  
//     // Set the roles in the Access Token for both production and development namespaces
//     api.accessToken.setCustomClaim(`${prodNamespace}/roles`, assignedRoles);
//     api.accessToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
//   };
  


// exports.onExecutePostLogin = async (event, api) => {
//     const prodNamespace = 'https://coruscating-sunshine-25faaf.netlify.app'; // Production namespace
//     const devNamespace = 'https://localhost:3000'; // Development namespace
    
//     const assignedRoles = event.authorization?.roles || [];
//     const isNewUser = event.stats.logins === 1; // Assuming this indicates the first login
  
//     if (isNewUser) {
//       // Assign 'Admin' role for new users
//       assignedRoles.push('Admin');
//       console.log('Assigned Roles:', assignedRoles);
//   // Setting claims
//     api.idToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
//     api.accessToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
//       // Create a new database using Admin name
//       try {
//         const dbName = event.user.email.split('@')[0]; // Use the email prefix as the database name
  
//         // Replace the URL with your server's endpoint for creating a database
//         const createDbResponse = await fetch('https://lms-server-5uw4.vercel.app/api/admin/create-database', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ dbName }), // New database name derived from the email
//         });
  
//         if (!createDbResponse.ok) {
//           const errorResponse = await createDbResponse.json();
//           console.error('Failed to create database:', errorResponse);
//         }
  
//       } catch (error) {
//         console.error('Error creating database:', error);
//       }
//     } else {
//       // Check if the user is a Student or Teacher
//       try {
//         // Check if the user is a Student
//         const studentResponse = await fetch(`https://lms-server-5uw4.vercel.app/api/student/check-role?email=${encodeURIComponent(event.user.email)}`);
//         const studentData = await studentResponse.json();
  
//         if (studentResponse.ok && studentData.exists) {
//           assignedRoles.push('Student');
//         }
  
//         // Check if the user is a Teacher
//         const teacherResponse = await fetch(`https://lms-server-5uw4.vercel.app/api/teacher/check-role?email=${encodeURIComponent(event.user.email)}`);
//         const teacherData = await teacherResponse.json();
  
//         if (teacherResponse.ok && teacherData.exists) {
//           assignedRoles.push('Teacher');
//         }
  
//       } catch (error) {
//         console.error('Error calling the role check APIs: ', error);
//       }
//     }
  
//     // Set the roles in the ID Token for both production and development namespaces
//     api.idToken.setCustomClaim(`${prodNamespace}/roles`, assignedRoles);
//     api.idToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
  
//     // Set the roles in the Access Token for both production and development namespaces
//     api.accessToken.setCustomClaim(`${prodNamespace}/roles`, assignedRoles);
//     api.accessToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
//   };
  