const express = require("express");
const Minio = require("minio");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const DatauriParser = require("datauri/parser");
const cloudinary = require("cloudinary").v2;
const { GoogleSpreadsheet } = require("google-spreadsheet");

const router = express.Router();
const parser = new DatauriParser();

var client = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  port: 8080,
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
});

router.get("/test-user", async (req, res) => {
  try {
    const result = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        address: true,
      },
    });
    console.log(result);
    res.status(200).json({ data: result, message: "success" });
  } catch (error) {
    console.log("error");
    res.status(404).json({ message: error });
  }
});

function fetchBooksFromMinio(req, res, bucketName) {
  console.log(bucketName);
  let photos = [];
  let stream = client.listObjectsV2(bucketName);

  stream.on("data", (obj) => {
    photos.push(`http://${process.env.MINIO_HOST}/${bucketName}/${obj.name}`);
  });
  stream.on("end", (obj) => {
    return res.status(200).json({ data: photos });
  });
}

router.get("/book/:className", (req, res) => {
  const studentClass = req.params.className;
  console.log(studentClass);

  switch (studentClass) {
    case "CLASS VI":
      fetchBooksFromMinio(req, res, "book-6");
      break;
    case "CLASS VII":
      fetchBooksFromMinio(req, res, "book-7");
      break;
    case "CLASS VIII":
      fetchBooksFromMinio(req, res, "book-8");
      break;
  }
});

async function getQuestions(sheetTitle) {
  if (
    !(
      process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_SPREADSHEET_SATYAL
    )
  ) {
    throw new Error("forbidden");
  }

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_SATYAL);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(
      /\\n/gm,
      "\n"
    ),
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[sheetTitle]; // or use doc.sheetsById[id]
  const rows = await sheet.getRows(); // can pass in { limit, offset }

  const products = rows?.map(({ Subject, Chapter_Name, Chapter_Number }) => ({
    Subject,
    Chapter_Name,
    Chapter_Number,
  }));
  return products;
}

router.get("/questions/:className", async (req, res) => {
  const sheetName = req.params.className;
  try {
    const data = await getQuestions(sheetName);

    return res.status(200).json({ questions: data });
  } catch (e) {
    console.log(e.message);
    return res.status(202).json({ products: null });
  }
});

module.exports = router;
