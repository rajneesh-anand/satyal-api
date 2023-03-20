const express = require("express");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/pricing", async (req, res) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const rawData = fs.readFileSync(data.files.uploadedFile.path);

  try {
    fs.writeFile(
      path.join(__dirname, `../upload/pricing.json`),
      rawData,
      function (err) {
        if (err) console.log(err);
        return res.status(200).json({
          status: "success",
          message: "File uploaded successfully",
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

router.get("/pricing", async (req, res) => {
  res.statusCode = 200;
  res.header("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "../upload/pricing.json"));
});

router.post("/file/class", (req, res) => {
  const className = req.body.class;

  switch (className) {
    case "CLASS VI":
      res.statusCode = 200;
      res.header("Content-Type", "application/json");
      res.sendFile(path.join(__dirname, "../upload/subjects/class_six.json"));
      break;
    case "CLASS VII":
      res.statusCode = 200;
      res.header("Content-Type", "application/json");
      res.sendFile(path.join(__dirname, "../upload/subjects/class_seven.json"));
      break;
    case "CLASS VIII":
      res.statusCode = 200;
      res.header("Content-Type", "application/json");
      res.sendFile(path.join(__dirname, "../upload/subjects/class_eight.json"));
      break;
    default:
      null;
  }
});

module.exports = router;
