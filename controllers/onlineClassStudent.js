const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Enroll a student in an online class
exports.enrollClass = async (req, res) => {
  try {
    // Extract the enrollment code and student email from the request body
    const { enrollCode, studentEmail } = req.body;
    console.log(enrollCode);
    console.log(studentEmail);
    // Find the online class with the given enrollment code
    const onlineClass = await prisma.onlineClass.findUnique({
      where: { enrollCode },
    });

    if (!onlineClass) {
      return res.status(404).json({ error: "Online class not found" });
    }

    // Check if the student is already enrolled in the class
    const isEnrolled = await prisma.StudentsInOnlineClass.findFirst({
      where: {
        onlineClassId: onlineClass.id,
        studentEmail,
      },
    });

    if (isEnrolled) {
      return res
        .status(400)
        .json({ error: "You have already joined this online class" });
    }

    // Fetch the student's name based on their email from the User model
    const studentUser = await prisma.user.findUnique({
      where: { email: studentEmail },
      select: { firstName: true, middleName: true, lastName: true },
    });

    if (!studentUser) {
      return res
        .status(404)
        .json({ error: "No student with this email is found" });
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

    res.status(200).json({
      message: "Enrolled in class successfully",
      student: newStudentInClass,
    });
  } catch (error) {
    console.error("Error enrolling in class:", error);
    res.status(500).json({ error: "Internal Server Error", data: error });
  }
};

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
    console.error("Error fetching student classes:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
      return res.status(404).json({ error: "Class not found" });
    }

    res.status(200).json(onlineClass);
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Student leaves an online class
exports.leaveOnlineClass = async (req, res) => {
  try {
    const { onlineClassId, studentEmail } = req.body;

    // Validate data
    if (!onlineClassId) {
      return res.status(400).json({ error: "onlineClassId is required" });
    }

    // Find the online class by its ID
    const onlineClass = await prisma.onlineClass.findUnique({
      where: { id: onlineClassId },
    });

    if (!onlineClass) {
      return res.status(404).json({ error: "Online class not found" });
    }

    // Check if the authenticated user is a student in the online class
    const isEnrolled = await prisma.studentsInOnlineClass.findFirst({
      where: {
        onlineClassId,
        studentEmail: studentEmail,
      },
    });

    if (!isEnrolled) {
      return res
        .status(403)
        .json({ error: "You are not enrolled in this class" });
    }

    // Remove the student from the online class
    await prisma.studentsInOnlineClass.deleteMany({
      where: {
        onlineClassId,
        studentEmail: studentEmail,
      },
    });

    // Check if the online class has studentDetails and perform the update
    if (onlineClass.studentDetails) {
      const updatedStudentDetails = onlineClass.studentDetails.filter(
        (student) => student.studentEmail !== studentEmail
      );

      // Update the online class with the filtered studentDetails
      await prisma.onlineClass.update({
        where: {
          id: onlineClassId,
        },
        data: {
          studentDetails: {
            set: updatedStudentDetails,
          },
        },
      });
    }

    return res.status(200).json({
      message: "You have left the online class.",
    });
  } catch (error) {
    console.error("Error leaving online class:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
