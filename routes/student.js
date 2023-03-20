const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const { IncomingForm } = require("formidable");

const router = express.Router();

const APP_URL = `${process.env.API_ENDPOINT}/student`;

function paginate(totalItems, currentPage, pageSize, count, url) {
  const totalPages = Math.ceil(totalItems / pageSize);

  // ensure current page isn't out of range
  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  // calculate start and end item indexes
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  // return object with all pager properties required by the view
  return {
    total: totalItems,
    currentPage: +currentPage,
    count,
    lastPage: totalPages,
    firstItem: startIndex,
    lastItem: endIndex,
    perPage: pageSize,
    first_page_url: `${APP_URL}${url}&page=1`,
    last_page_url: `${APP_URL}${url}&page=${totalPages}`,
    next_page_url:
      totalPages > currentPage
        ? `${APP_URL}${url}&page=${Number(currentPage) + 1}`
        : null,
    prev_page_url:
      totalPages > currentPage ? `${APP_URL}${url}&page=${currentPage}` : null,
  };
}

router.get("/students-list", auth, async (req, res) => {
  const { orderBy, sortedBy } = req.query;
  const curPage = req.query.page || 1;
  const perPage = req.query.limit || 25;

  const url = `/students-list?limit=${perPage}`;

  const skipItems =
    curPage == 1 ? 0 : (parseInt(perPage) - 1) * parseInt(curPage);

  const totalItems = await prisma.user.count({
    where: { userType: "Student" },
  });

  try {
    const student = await prisma.user.findMany({
      where: { userType: "Student" },
      skip: skipItems,
      take: parseInt(perPage),
      orderBy: {
        createdAt: sortedBy,
      },
    });

    res.status(200).json({
      msg: "success",
      data: student,
      ...paginate(totalItems, curPage, perPage, student.length, url),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

router.put("/status/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        userStatus: req.body.userStatus,
      },
    });

    res.status(200).json({
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

router.get("/:id", async (req, res) => {
  const studentId = req.params.id;
  try {
    const student = await prisma.user.findFirst({
      where: {
        AND: [{ id: Number(studentId) }, { userType: "Student" }],
      },
    });

    res.status(200).json({
      msg: "success",
      data: student,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

router.put("/:id", async (req, res) => {
  const studentId = req.params.id;
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
  try {
    await prisma.user.update({
      where: {
        id: Number(studentId),
      },
      data: {
        firstName: data.fields.fname,
        lastName: data.fields.lname,
        address: data.fields.address,
        city: data.fields.city,
        province: data.fields.province,
        class: data.fields.class,
        mobile: data.fields.mobile,
      },
    });

    res.status(200).json({
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

router.post("/fetch-teachers", async (req, res) => {
  const studentClass = req.body.class;
  const studentSubject = req.body.subject;
  console.log(req.body);
  const result = await prisma.teacherkyc.findMany({
    select: {
      class: true,
      subject: true,
      email: true,
    },
  });

  const listOfTeachers = result.reduce((acc, item) => {
    const className = JSON.parse(item.class);
    const classExists = className.find((itm) => itm.value === studentClass);
    if (classExists) {
      acc.push(item);
    }
    return acc;
  }, []);

  if (listOfTeachers.length > 0) {
    const listOfTeachersSubjectWise = listOfTeachers.reduce((acc, item) => {
      const subjectName = JSON.parse(item.subject);
      const subjectExists = subjectName.find(
        (itm) => itm.value === studentSubject
      );
      if (subjectExists) {
        acc.push(item.email);
      }
      return acc;
    }, []);

    console.log(listOfTeachersSubjectWise);

    req.socketIO.on("connection", (socket) => {
      console.log(`⚡: ${socket.id} user just connected!`);

      socket.on("newEvent", (event) => {
        socketIO.emit("newUserResponse", listOfTeachersSubjectWise);
      });

      socket.on("disconnect", () => {
        socket.disconnect();
        console.log("🔥: A user disconnected");
      });
    });
  }
});

module.exports = router;
