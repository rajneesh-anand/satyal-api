const express = require("express");
const Minio = require("minio");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const prisma = require("../lib/prisma");

const router = express.Router();

var client = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  // port: 11066,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

router.post("/kyc/:id", async (req, res) => {
  const teacherId = req.params.id;
  console.log(teacherId);
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  console.log(data);
  try {
    if (Object.keys(data.files).length !== 0) {
      const content = await fs.promises
        .readFile(data.files.document.path)
        .catch((err) => console.error("Failed to read file", err));

      const uploadResult = await client.putObject(
        "testing",
        data.files.document.name,
        content
      );

      const docUrl = uploadResult
        ? `${process.env.MINIO_HOST}/testing/${data.files.document.name}`
        : null;

      await prisma.user.update({
        where: { id: Number(teacherId) },
        data: {
          kycDocumentType: data.fields.docType,
          kycStatus: "KYC Under Review",
          kycDocument: docUrl,
        },
      });
      return res.status(200).json({
        msg: "success",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

router.get("/:id", async (req, res) => {
  const teacherId = req.params.id;
  try {
    const result = await prisma.user.findFirst({
      where: {
        AND: [{ id: Number(teacherId) }, { userType: "Teacher" }],
      },
    });

    res.status(200).json({
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

module.exports = router;
