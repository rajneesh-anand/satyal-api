const express = require("express");
const { IncomingForm } = require("formidable");
const fs = require("fs/promises");
const path = require("path");
const router = express.Router();
const prisma = require("../lib/prisma");

async function getStudentSubjectsClassWise(req, res, className) {
  const teachersList = await prisma.teacherkyc.findMany({
    select: {
      classList: true,
      subjectList: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const studentSubjects = await fs.readFile(
    path.join(__dirname, `../upload/subjects/${className}`),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      return data;
    }
  );

  return res.status(200).json({
    teachersList,
    subjectsList: studentSubjects ? JSON.parse(studentSubjects) : null,
  });
}

router.get("/class/:className", async (req, res) => {
  const studentClassName = req.params.className;
  switch (studentClassName) {
    case "CLASS VI":
      await getStudentSubjectsClassWise(req, res, "class_six.json");
      break;
    case "CLASS VII":
      await getStudentSubjectsClassWise(req, res, "class_seven.json");
      break;
    case "CLASS VIII":
      await getStudentSubjectsClassWise(req, res, "class_eight.json");
      break;
    case "CLASS IX":
      await getStudentSubjectsClassWise(req, res, "class_nine.json");
      break;
    case "CLASS X":
      await getStudentSubjectsClassWise(req, res, "class_ten.json");
      break;
    case "CLASS XI":
      await getStudentSubjectsClassWise(req, res, "class_eleven.json");
      break;
    case "CLASS XII":
      await getStudentSubjectsClassWise(req, res, "class_twelve.json");
      break;
    default:
      null;
  }
});

router.get("/pricing", async (req, res) => {
  res.statusCode = 200;
  res.header("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "../upload/pricing.json"));
});

module.exports = router;
