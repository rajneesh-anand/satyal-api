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

const uploadPhoto = async (path, name) => {
  try {
    const content = await fs.promises.readFile(path);
    const uploadResult = await client.putObject("testing", name, content);
    const photoUrl = uploadResult
      ? `${process.env.MINIO_HOST}/testing/${name}`
      : null;
    return photoUrl;
  } catch (err) {
    console.log(err.message);
    return null;
  }
};

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
      const citizenFirstPagePhotoUrl =
        data.fields.citizenFirst != "null"
          ? await uploadPhoto(
              data.files.citizenFirst.path,
              data.files.citizenFirst.name
            )
          : "";

      const citizenLastPagePhotoUrl =
        data.fields.citizenLast != "null"
          ? await uploadPhoto(
              data.files.citizenLast.path,
              data.files.citizenLast.name
            )
          : "";

      const schoolIdentityPhotoUrl =
        data.fields.schoolIdentity != "null"
          ? await uploadPhoto(
              data.files.schoolIdentity.path,
              data.files.schoolIdentity.name
            )
          : "";

      const bachelorDegreePhotoUrl =
        data.fields.degreeBachelor != "null"
          ? await uploadPhoto(
              data.files.degreeBachelor.path,
              data.files.degreeBachelor.name
            )
          : "";
      const masterDegreePagePhotoUrl =
        data.fields.degreeMaster != "null"
          ? await uploadPhoto(
              data.files.degreeMaster.path,
              data.files.degreeMaster.name
            )
          : "";

      const result = await prisma.teacherkyc.create({
        data: {
          citizenPhotoFirstPage: citizenFirstPagePhotoUrl,
          citizenPhotoLastPage: citizenLastPagePhotoUrl,
          schoolIdentityCard: schoolIdentityPhotoUrl,
          bachelorDegree: bachelorDegreePhotoUrl,
          masterDegree: masterDegreePagePhotoUrl,
          class: data.fields.class,
          subject: data.fields.subjects,
          bankName: data.fields.bankName,
          bankBranch: data.fields.branch,
          accountName: data.fields.name,
          accountNumber: data.fields.accountNumber,
          user: { connect: { id: Number(teacherId) } },
        },
      });
      if (result) {
        await prisma.user.update({
          where: {
            id: Number(teacherId),
          },
          data: {
            kycStatus: "KYC Under Review",
          },
        });

        return res.status(200).json({
          msg: "success",
        });
      } else {
        throw new Error("Server is down !");
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
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
