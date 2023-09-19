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

    // Verify that the teacherId exists in the User table
    const teacherExists = await prisma.user.findUnique({
      where: { email: teacherEmail },
    });

    if (!teacherExists) {
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

// Get all online classes based on the teacherEmail
exports.getAllClassesCreated = async (req, res) => {
  try {
    // Extract the teacherEmail from the request parameters

    const teacherEmail = req.params.teacherEmail;

    // Fetch all online classes for the teacher
    const onlineClasses = await prisma.onlineClass.findMany({
      where: { teacher: { email: teacherEmail } },
      include: {
        teacher: true,
        students: true,
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

// Change meeting joining code for a class
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

// Enroll a student in an online class
exports.enrollClass = async (req, res) => {
  try {
    // Extract data from the request body
    const { enrollCode, studentId } = req.body;

    // Find the class with the given enrollment code
    const onlineClass = await prisma.onlineClass.findUnique({
      where: { enrollCode },
    });

    if (!onlineClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Connect the student to the class
    await prisma.onlineClass.update({
      where: { enrollCode },
      data: {
        students: { connect: { id: studentId } },
      },
    });

    res.status(200).json({ message: 'Enrolled in class successfully' });
  } catch (error) {
    console.error('Error enrolling in class:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all online classes based on the studentEmail
exports.getAllClassesEnrolled = async (req, res) => {
  try {
    // Extract the studentEmail from the request parameters
    const studentEmail = req.params.studentEmail;

    // Fetch all online classes for the student
    const onlineClasses = await prisma.onlineClass.findMany({
      where: { students: { some: { email: studentEmail } } },
      include: {
        teacher: true,
        students: true,
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

// Get details of an online class
exports.getClassDetails = async (req, res) => {
  try {
    // Extract the classId from the request parameters
    const classId = parseInt(req.params.classId);

    // Fetch class details
    const onlineClass = await prisma.onlineClass.findUnique({
      where: { id: classId },
      include: {
        teacher: true,
        students: true,
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

// Add a note to an online class
// exports.addNote = async (req, res) => {
//   // Implementation for adding notes to the class
// };

// Add a worksheet to an online class
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
