const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

const APP_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.vedusone.com/api"
    : "http://localhost:8080/api";

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

router.get("/", async (req, res) => {
  const { orderBy, sortedBy } = req.query;
  const curPage = req.query.page || 1;
  const perPage = req.query.limit || 25;

  const url = `/user?limit=${perPage}`;

  const skipItems =
    curPage == 1 ? 0 : (parseInt(perPage) - 1) * parseInt(curPage);

  const totalItems = await prisma.user.count();

  try {
    const users = await prisma.user.findMany({
      skip: skipItems,
      take: parseInt(perPage),
      where: {
        userType: "Student",
      },
      orderBy: {
        createdAt: sortedBy,
      },
    });
    // console.log(product.length);
    res.status(200).json({
      msg: "success",
      data: users,
      ...paginate(totalItems, curPage, perPage, users.length, url),
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

router.get("/list", async (req, res) => {
  try {
    let result = await prisma.user.findMany({
      // where: {
      //   status: "Active",
      //   userType: "Student",
      // },
    });
    return res.status(200).json({
      msg: "success",
      data: result,
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

router.get("/list/home", async (req, res) => {
  try {
    let result = await prisma.user.findMany({
      take: 15,
      where: {
        status: "Active",
        userType: "Student",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      msg: "success",
      data: result,
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

router.post("/status/:id", async (req, res) => {
  const id = req.params.id;
  const status = req.body.userStatus;
  console.log(id);
  console.log(status);
  try {
    await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        status: status,
      },
    });
    return res.status(200).json({
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

module.exports = router;
