// onlineClassController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new online class
let createClass = async (req, res) => {
  try {
    // Extract data from the request body
    const { onlineClassName, onlineClassGrade, onlineClassSection, teacherId } = req.body;

    // Generate a unique code for enrolling
    const enrollCode = generateEnrollmentCode();

    // Create the online class in the database
    const onlineClass = await prisma.onlineClass.create({
      data: {
        onlineClassName,
        onlineClassGrade,
        onlineClassSection,
        teacher: { connect: { id: teacherId } }, // Connect the class to the teacher
        enrollCode, // Save the enrollment code
      },
    });

    res.status(201).json({ message: 'Online class created successfully', onlineClass });
  } catch (error) {
    console.error('Error creating online class:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Enroll a student in an online class
// exports.enrollClass = async (req, res) => {
//   try {
//     // Extract data from the request body
//     const { enrollmentCode, studentId } = req.body;

//     // Find the class with the given enrollment code
//     const onlineClass = await prisma.onlineClass.findUnique({
//       where: { enrollmentCode },
//     });

//     if (!onlineClass) {
//       return res.status(404).json({ error: 'Class not found' });
//     }

//     // Connect the student to the class
//     await prisma.onlineClass.update({
//       where: { enrollmentCode },
//       data: {
//         students: { connect: { id: studentId } },
//       },
//     });

//     res.status(200).json({ message: 'Enrolled in class successfully' });
//   } catch (error) {
//     console.error('Error enrolling in class:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// Get details of an online class
// exports.getClassDetails = async (req, res) => {
//   try {
//     // Extract the classId from the request parameters
//     const classId = parseInt(req.params.classId);

//     // Fetch class details
//     const onlineClass = await prisma.onlineClass.findUnique({
//       where: { id: classId },
//       include: {
//         teacher: true,
//         students: true,
//         notes: true,
//         worksheets: true,
//       },
//     });

//     if (!onlineClass) {
//       return res.status(404).json({ error: 'Class not found' });
//     }

//     res.status(200).json(onlineClass);
//   } catch (error) {
//     console.error('Error fetching class details:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// Add a note to an online class
// exports.addNote = async (req, res) => {
//   // Implementation for adding notes to the class
// };

// Add a worksheet to an online class
// exports.addWorksheet = async (req, res) => {
//   // Implementation for adding worksheets to the class
// };

// Utility function to generate a random enrollment code
// function generateEnrollmentCode() {
//   // Implementation for generating a random code (e.g., a combination of letters and numbers)
// }

module.exports={createClass};
