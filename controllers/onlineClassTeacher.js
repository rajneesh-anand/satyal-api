const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// Create a new online class
exports.createClass = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      onlineClassName,
      onlineClassGrade,
      onlineClassSection,
      teacherEmail,
      teacherName,
    } = req.body;

    console.log('teacherEmail', teacherEmail);

    // Verify that the teacherId exists in the User table
    const teacher = await prisma.user.findUnique({
      where: { email: teacherEmail },
    });

    if (!teacher || teacher.userType !== 'Teacher') {
      return res
        .status(400)
        .json({ error: 'Teacher with the provided email does not exist.' });
    }

    // Generate a unique code for enrolling
    const enrollCode = generateEnrollmentCode();

    // Create the online class in the database
    const onlineClass = await prisma.onlineClass.create({
      data: {
        onlineClassName,
        onlineClassGrade,
        onlineClassSection,
        teacherName,
        teacherEmail,
        enrollCode, // Save the enrollment code
        meetingLink: '', // Initialize the meeting link to an empty string
      },
    });

    res.status(201).json({ message: 'Online class created successfully', onlineClass });
  } catch (error) {
    console.error('Error creating online class:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ############### - REMAINING - ########################################
// Remove a student from an online class - teacher side
// Leave the online class - student side
// #####################################################################

// Get all online classes based on the studentEmail
exports.getAllEnrolledStudentsInAClass = async (req, res) => {
  try {
    // Extract the studentEmail from the request parameters
    const studentEmail = req.params.studentEmail;

    // Fetch all online classes for the student
    const onlineClasses = await prisma.onlineClass.findMany({
      where: { students: { some: { email: studentEmail } } },
      include: {
        notes: true,
        worksheets: true,
      },
    });

    res.status(200).json(onlineClasses);
  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all online classes based on the teacherEmail
exports.getAllCreatedClasses = async (req, res) => {
  try {
    // Extract the teacherEmail from the request parameters

    const teacherEmail = req.params.email;

    // Fetch all online classes for the teacher
    const onlineClasses = await prisma.onlineClass.findMany({
      where: { teacherEmail: teacherEmail },
      include: {
        notes: true,
        worksheets: true,
      },
    });

    res.status(200).json(onlineClasses);
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get details of a particular online class(for teachers)
exports.getClassDetails = async (req, res) => {
  try {
    // Extract the classId from the request parameters
    const classId = parseInt(req.params.classId);

    // Fetch class details
    const onlineClass = await prisma.onlineClass.findUnique({
      where: { id: classId },
      include: {
        studentDetails: true,
        notes: true,
        worksheets: true,
      },
    });

    if (!onlineClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.status(200).json(onlineClass);
  } catch (error) {
    console.error('Error fetching class details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update meeting joining link(google meet link) for a class
exports.updateMeetingLink = async (req, res) => {
  try {
    // Extract data from the request body
    const { onlineClassId, meetingLink } = req.body;

    // Validate data (ensure onlineClassId exists)
    if (!onlineClassId || !meetingLink) {
      return res
        .status(400)
        .json({ error: 'Both onlineClassId and meetingLink are required' });
    }

    // Update the meetingLink in the database
    const updatedOnlineClass = await prisma.onlineClass.update({
      where: { id: onlineClassId },
      data: { meetingLink },
    });

    res
      .status(200)
      .json({ message: 'Meeting link updated successfully', updatedOnlineClass });
  } catch (error) {
    console.error('Error updating meeting link:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete an entire online class
exports.deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if the online class exists
    const onlineClass = await prisma.onlineClass.findUnique({
      where: { id: parseInt(classId) },
      include: {
        studentDetails: true, // Include students associated with the class
        notes: true, // Include notes associated with the class
        worksheets: true, // Include worksheets associated with the class
      },
    });

    if (!onlineClass) {
      return res.status(404).json({ error: 'Online class not found' });
    }

    // Delete all associated students
    await prisma.studentsInOnlineClass.deleteMany({
      where: { onlineClassId: parseInt(classId) },
    });

    // Delete all associated notes
    await prisma.note.deleteMany({
      where: { onlineClassId: parseInt(classId) },
    });

    // Delete all associated worksheets
    await prisma.worksheet.deleteMany({
      where: { onlineClassId: parseInt(classId) },
    });

    // Delete the online class itself
    await prisma.onlineClass.delete({
      where: { id: parseInt(classId) },
    });

    res.status(204).send(); // Successfully deleted, no content to send
  } catch (error) {
    console.error('Error deleting online class:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add a note to an online class
// exports.addNote = async (req, res) => {
//   // Implementation for adding notes to the class
// };
// Get all notes for an online class
// exports.addNote = async (req, res) => {
//   // Implementation for adding notes to the class
// };
// Update notes of online class
// exports.addNote = async (req, res) => {
//   // Implementation for adding notes to the class
// };
// Delete notes online class
// exports.addNote = async (req, res) => {
//   // Implementation for adding notes to the class
// };

// Add a worksheet to an online class
// exports.addWorksheet = async (req, res) => {
//   // Implementation for adding worksheets to the class
// };
// Get all worksheets of an online class
// exports.addWorksheet = async (req, res) => {
//   // Implementation for adding worksheets to the class
// };
// Update a worksheet of an online class
// exports.addWorksheet = async (req, res) => {
//   // Implementation for adding worksheets to the class
// };
// Delete a worksheet of an online class
// exports.addWorksheet = async (req, res) => {
//   // Implementation for adding worksheets to the class
// };

// Utility function to generate a random enrollment code
function generateEnrollmentCode() {
  const sectionLength = 3;
  const sections = [];

  for (let i = 0; i < 3; i++) {
    // Generate a random buffer
    const buffer = crypto.randomBytes(sectionLength);
    const section = buffer
      .toString('base64') // Convert bytes to base64 string
      .replace(/[^a-z]/gi, '') // Remove non-alphabetic characters
      .slice(0, sectionLength); // Take the first 3 characters
    sections.push(section);
  }

  return sections.join('-');
}
