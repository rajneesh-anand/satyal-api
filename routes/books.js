const router=require('express').Router();
const Minio = require("minio");
const DatauriParser = require("datauri/parser");

const parser = new DatauriParser();
var client = new Minio.Client({
    endPoint: process.env.MINIO_HOST,
    port: 8080,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  });
async function fetchBooksFromMinio(req, res, bucketName) {
    try {
      console.log(bucketName);
      let books = [];
      let images = [];
      let stream = client.listObjectsV2(bucketName);
  
      stream.on("data", async (obj) => {
        // Generate authenticated URL for the image
        const expiresIn = 3600; // Set the expiration time to 1 hour (3600 seconds)
        const signedUrl = await client.presignedGetObject(
          bucketName,
          obj.name,
          expiresIn
        );
  
        // const url = `http://${process.env.MINIO_HOST}/${bucketName}/${obj.name}`;
  
        if (
          obj.name.endsWith(".png") ||
          obj.name.endsWith(".jpg") ||
          obj.name.endsWith(".jpeg")
        ) {
          images.push(signedUrl);
        } else if (obj.name.endsWith(".pdf")) {
          books.push(signedUrl);
        }
      });
  
      await new Promise((resolve, reject) => {
        stream.on("end", () => {
          // console.log('Books:', books);
          // console.log('Images:', images);
          resolve();
        });
  
        stream.on("error", (err) => {
          console.error("Error while fetching objects from MinIO:", err);
          reject(err);
          // return res.status(500).json({ error: 'Failed to fetch objects from MinIO' });
        });
      });
  
      return res.status(200).json({
        data: {
          books,
          images,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  
  
  router.get("/:studentClass", (req, res) => {
    const studentClass = req.params.studentClass;
  
    switch (studentClass) {
      case "CLASS I":
        fetchBooksFromMinio(req, res, "book-1");
        break;
      case "CLASS II":
        fetchBooksFromMinio(req, res, "book-2");
        break;
      case "CLASS III":
        fetchBooksFromMinio(req, res, "book-3");
        break;
      case "CLASS IV":
        fetchBooksFromMinio(req, res, "book-4");
        break;
      case "CLASS V":
        fetchBooksFromMinio(req, res, "book-5");
        break;
      case "CLASS VI":
        fetchBooksFromMinio(req, res, "book-6");
        break;
      case "CLASS VII":
        fetchBooksFromMinio(req, res, "book-7");
        break;
      case "CLASS VIII":
        fetchBooksFromMinio(req, res, "book-8");
        break;
      case "CLASS IX":
        fetchBooksFromMinio(req, res, "book-9");
        break;
      case "CLASS X":
        fetchBooksFromMinio(req, res, "book-10");
        break;
       default:
        res.status(404).type('json').json(`${studentClass} books are not found`)
    }
   
  });


  module.exports=router;