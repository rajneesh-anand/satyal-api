const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

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

router.get("/students-list", async (req, res) => {
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
      where: { id: Number(studentId), userType: "Student" },
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

module.exports = router;
