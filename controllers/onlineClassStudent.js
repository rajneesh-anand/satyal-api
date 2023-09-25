const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Enroll a student in an online class
exports.enrollClass = async (req, res) => {
  try {
    // Extract the enrollment code and student email from the request body
    const { enrollCode, studentEmail } = req.body;

    // Find the online class with the given enrollment code
    const onlineClass = await prisma.onlineClass.findUnique({
      where: { enrollCode },
    });

    if (!onlineClass) {
      return res.status(404).json({ error: 'Online class not found' });
    }

    // Fetch the student's name based on their email from the User model
    const studentUser = await prisma.user.findUnique({
      where: { email: studentEmail },
      select: { firstName: true, middleName: true, lastName: true },
    });

    if (!studentUser) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Create a new StudentInOnlineClass model and associate it with the online class
    const newStudentInClass = await prisma.StudentsInOnlineClass.create({
      data: {
        studentEmail: studentEmail,
        firstName: studentUser.firstName,
        lastName: studentUser.lastName,
        onlineClass: { connect: { id: onlineClass.id } },
      },
    });

    res
      .status(200)
      .json({ message: 'Enrolled in class successfully', student: newStudentInClass });
  } catch (error) {
    console.error('Error enrolling in class:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Enroll in online class alternative
// exports.enrollClass = async (req, res) => {
//   try {
//     // Extract data from the request body
//     const { enrollCode, studentId } = req.body;

//     // Find the class with the given enrollment code
//     const onlineClass = await prisma.onlineClass.findUnique({
//       where: { enrollCode },
//     });

//     if (!onlineClass) {
//       return res.status(404).json({ error: 'Class not found' });
//     }

//     // Connect the student to the class
//     await prisma.onlineClass.update({
//       where: { enrollCode },
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

// Get all online classes based on the studentEmail
exports.getAllEnrolledClasses = async (req, res) => {
  try {
    // Extract the studentEmail from the request parameters
    const studentEmail = req.params.email;

    // Fetch all online classes for the student
    const onlineClasses = await prisma.onlineClass.findMany({
      where: { studentDetails: { some: { studentEmail: studentEmail } } },
      include: {
        studentDetails: true,
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

// Get details of a particular online class(for students)
exports.getClassDetails = async (req, res) => {
  try {
    // Extract the classId from the request parameters
    const classId = parseInt(req.params.classId);

    // Fetch class details
    const onlineClass = await prisma.onlineClass.findUnique({
      where: { id: classId },
      include: {
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
