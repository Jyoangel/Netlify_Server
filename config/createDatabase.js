

const express = require('express');
const connectDB = require('./db'); // Adjust the path accordingly

const router = express.Router();

router.post('/create-database', async (req, res) => {
    const { dbName } = req.body;
    console.log("Res", dbName);// Connect to the new database

    if (!dbName) {
        return res.status(400).json({ error: 'Database name is required' });
    }

    try {

        const response = await connectDB(dbName);
        console.log("Resss", response);// Connect to the new database
        res.status(200).json({ message: `Database ${dbName} created successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create database', details: error.message });
    }
});

module.exports = router;


// exports.onExecutePostLogin = async (event, api) => {
//     const prodNamespace = 'https://coruscating-sunshine-25faaf.netlify.app'; // Production namespace
//     const devNamespace = 'https://localhost:3000'; // Development namespace
  
//     // Log the event object to inspect its structure
//     console.log('Event Object:', JSON.stringify(event, null, 2));
  
//     const assignedRoles = event.authorization?.roles || [];
  
//     // Check if the user is a Student
//     try {
//       const studentResponse = await fetch(`https://lms-server-5uw4.vercel.app/api/student/check-role?email=${encodeURIComponent(event.user.email)}`);
//       const studentData = await studentResponse.json();
  
//       if (studentResponse.ok && studentData.exists) {
//         assignedRoles.push('Student');
//         console.log('Assigned Roles after Student check:', assignedRoles);
//       }
  
//       // Check if the user is a Teacher
//       const teacherResponse = await fetch(`https://lms-server-5uw4.vercel.app/api/teacher/check-role?email=${encodeURIComponent(event.user.email)}`);
//       const teacherData = await teacherResponse.json();
  
//       if (teacherResponse.ok && teacherData.exists) {
//         assignedRoles.push('Teacher');
//         console.log('Assigned Roles after Teacher check:', assignedRoles);
//       }
  
//       // If the user is neither a Student nor a Teacher, assign 'Admin' role
//       if (!studentData.exists && !teacherData.exists) {
//         assignedRoles.push('Admin');
//         console.log('Assigned Roles for user not found in any role:', assignedRoles);
  
//         // Create a new database using Admin name
//         try {
//           const dbName = event.user.sub; // Use the email prefix as the database name
  
//           // Replace the URL with your server's endpoint for creating a database
//           const createDbResponse = await fetch('https://lms-server-5uw4.vercel.app/api/admin/create-database', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ dbName }), // New database name derived from the email
//           });
  
//           if (!createDbResponse.ok) {
//             const errorResponse = await createDbResponse.json();
//             console.error('Failed to create database:', errorResponse);
//           } else {
//             console.log('Database created successfully:', dbName);
//           }
  
//         } catch (error) {
//           console.error('Error creating database:', error);
//         }
//       }
  
//     } catch (error) {
//       console.error('Error calling the role check APIs: ', error);
//     }
  
//     // Set the roles in the ID Token and Access Token for both production and development namespaces
//     api.idToken.setCustomClaim(`${prodNamespace}/roles`, assignedRoles);
//     api.idToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
//     api.accessToken.setCustomClaim(`${prodNamespace}/roles`, assignedRoles);
//     api.accessToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
  
//     console.log('Final Assigned Roles:', assignedRoles); // Log the final assigned roles
//   };


// exports.onExecutePostLogin = async (event, api) => {
//     const prodNamespace = 'https://coruscating-sunshine-25faaf.netlify.app'; // Production namespace
//     const devNamespace = 'https://localhost:3000'; // Development namespace
  
//     // Log the event object to inspect its structure
//     console.log('Event Object:', JSON.stringify(event, null, 2));
  
//     const assignedRoles = event.authorization?.roles || [];
    
//     // Retrieve user metadata (if it exists)
//     const userMetadata = event.user.app_metadata || {};
//     let userDbName = userMetadata.database || null;
  
//     // Check if the user is a Student
//     try {
//       const studentResponse = await fetch(`https://lms-server-5uw4.vercel.app/api/student/check-role?email=${encodeURIComponent(event.user.email)}`);
//       const studentData = await studentResponse.json();
  
//       if (studentResponse.ok && studentData.exists) {
//         assignedRoles.push('Student');
//         console.log('Assigned Roles after Student check:', assignedRoles);
//       }
  
//       // Check if the user is a Teacher
//       const teacherResponse = await fetch(`https://lms-server-5uw4.vercel.app/api/teacher/check-role?email=${encodeURIComponent(event.user.email)}`);
//       const teacherData = await teacherResponse.json();
  
//       if (teacherResponse.ok && teacherData.exists) {
//         assignedRoles.push('Teacher');
//         console.log('Assigned Roles after Teacher check:', assignedRoles);
//       }
  
//       // If the user is neither a Student nor a Teacher (i.e., Admin)
//       if (!studentData.exists && !teacherData.exists) {
//         assignedRoles.push('Admin');
//         console.log('Assigned Roles for user not found in any role:', assignedRoles);
  
//         // Create a new database using Admin name if not already set
//         if (!userDbName) {
//           try {
//             const dbName = event.user.sub; // Use unique user identifier (sub) as the database name
  
//             // Replace the URL with your server's endpoint for creating a database
//             const createDbResponse = await fetch('https://lms-server-5uw4.vercel.app/api/admin/create-database', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({ dbName }), // Send new database name to your server
//             });
  
//             if (!createDbResponse.ok) {
//               const errorResponse = await createDbResponse.json();
//               console.error('Failed to create database:', errorResponse);
//             } else {
//               console.log('Database created successfully:', dbName);
              
//               // Store the database name in the user's app metadata
//               api.user.setAppMetadata('database', dbName);
//               userDbName = dbName; // Update userDbName with the newly created database name
//             }
  
//           } catch (error) {
//             console.error('Error creating database:', error);
//           }
//         } else {
//           console.log(`User is connected to existing database: ${userDbName}`);
//         }
//       }
  
//     } catch (error) {
//       console.error('Error calling the role check APIs: ', error);
//     }
  
//     // Set the roles in the ID Token and Access Token for both production and development namespaces
//     api.idToken.setCustomClaim(`${prodNamespace}/roles`, assignedRoles);
//     api.idToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
//     api.accessToken.setCustomClaim(`${prodNamespace}/roles`, assignedRoles);
//     api.accessToken.setCustomClaim(`${devNamespace}/roles`, assignedRoles);
  
//     // Pass the database name in the tokens
//     if (userDbName) {
//       api.idToken.setCustomClaim(`${prodNamespace}/dbName`, userDbName);
//       api.idToken.setCustomClaim(`${devNamespace}/dbName`, userDbName);
//       api.accessToken.setCustomClaim(`${prodNamespace}/dbName`, userDbName);
//       api.accessToken.setCustomClaim(`${devNamespace}/dbName`, userDbName);
//     }
  
//     console.log('Final Assigned Roles:', assignedRoles); // Log the final assigned roles
//   };
  