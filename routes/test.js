const express = require("express");
const Minio = require("minio");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const DatauriParser = require("datauri/parser");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
const parser = new DatauriParser();

var client = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  // port: 11066,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUpload = (file) => cloudinary.uploader.upload(file);

router.post("/kyc/:id", async (req, res) => {
  const teacherId = req.params.id;

  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  try {
    if (Object.keys(data.files).length !== 0) {
      const docContent = await fs.promises
        .readFile(data.files.document.path)
        .catch((err) => console.error("Failed to read file", err));

      let doc64 = parser.format(
        path.extname(data.files.document.name).toString(),
        docContent
      );
      const uploadResult = await cloudinaryUpload(doc64.content);

      await prisma.user.update({
        where: { id: Number(teacherId) },
        data: {
          kycDocumentType: data.fields.docType,
          kycStatus: "KYC Under Review",
          kycDocument: uploadResult.secure_url,
        },
      });
      return res.status(200).json({
        msg: "success",
      });
    }
  } catch (error) {
    // error logging
    console.error(error);
    res.status(500).send(error);
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

router.get("/get-photos", async (req, res) => {
  let photos = [];
  let stream = await client.listObjectsV2("kyc");

  stream.on("data", (obj) => {
    photos.push(`http://${process.env.MINIO_HOST}/kyc/${obj.name}`);
  });
  stream.on("end", (obj) => {
    return res.status(200).json({ photos });
  });

  // stream.on("error", (err) => {
  //   console.log(err);
  // });
  console.log("test");
});

router.get("/hello", (req, res) => console.log(`first`));

module.exports = router;
