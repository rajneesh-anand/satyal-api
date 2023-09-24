const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
exports.getAllEnrolledClasses = async (req, res) => {
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
