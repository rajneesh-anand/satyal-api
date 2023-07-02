const express = require('express');
const Minio = require('minio');
const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');
const DatauriParser = require('datauri/parser');
const cloudinary = require('cloudinary').v2;

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

router.post('/kyc/:id', async (req, res) => {
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
        .catch((err) => console.error('Failed to read file', err));

      let doc64 = parser.format(
        path.extname(data.files.document.name).toString(),
        docContent
      );
      const uploadResult = await cloudinaryUpload(doc64.content);

      await prisma.user.update({
        where: { id: Number(teacherId) },
        data: {
          kycDocumentType: data.fields.docType,
          kycStatus: 'KYC Under Review',
          kycDocument: uploadResult.secure_url,
        },
      });
      return res.status(200).json({
        msg: 'success',
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

router.get('/get-photos', async (req, res) => {
  let photos = [];
  let stream = await client.listObjectsV2('kyc');

  stream.on('data', (obj) => {
    photos.push(`http://${process.env.MINIO_HOST}/kyc/${obj.name}`);
  });
  stream.on('end', (obj) => {
    return res.status(200).json({ photos });
  });

  stream.on('error', (err) => {
    console.log(err);
  });
  console.log(first);
  console.log('test');
});

router.get('/test-user', async (req, res) => {
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
    res.status(200).json({ data: result, message: 'success' });
  } catch (error) {
    console.log('error');
    res.status(404).json({ message: error });
  }
});

const stripUrlDetails = (url) => {
  // Extract the image endpoint, bucket name, and image name from the URL
  const imageEndpoint = url.substring(0, url.indexOf('/', 7)); // Extract the base URL
  const bucketName = url.substring(
    url.indexOf('/', 7) + 1,
    url.indexOf('/', url.indexOf('/', 7) + 1)
  ); // Extract the bucket name
  const imageName = url.substring(url.lastIndexOf('/') + 1); // Extract the image name

  return { imageEndpoint, bucketName, imageName };
};

router.get('/image/:url', async (req, res) => {
  try {
    const { imageEndpoint, bucketName, imageName } = stripUrlDetails(req.params.url);
    const expiration = 604800;

    const authenticatedUrl = await client.presignedGetObject(
      bucketName,
      imageName,
      expiration
    );
    const fullUrl = `${imageEndpoint}/${bucketName}/${imageName}${authenticatedUrl.query}`;
    console.log(fullUrl);
    res.json({ authenticatedUrl: fullUrl });
  } catch (error) {
    console.error('Error generating authenticated URL:', error);
    res.status(500).json({ error: 'Failed to generate authenticated URL' });
  }
});

async function fetchBooksFromMinio(req, res, bucketName) {
  console.log(bucketName);
  let booksAndImages = [];
  let books = [];
  let images = [];
  let stream = client.listObjectsV2(bucketName);

  stream.on('data', async (obj) => {
    const url = `http://${process.env.MINIO_HOST}/${bucketName}/${obj.name}`;

    if (obj.name.endsWith('.jpg')) {
      // Generate authenticated URL for the image
      // const signedUrl = await client.presignedGetObject(bucketName, obj.name);
      // console.log(signedUrl);
      // images.push(signedUrl);
      images.push(url);
    } else if (obj.name.endsWith('.pdf')) {
      books.push(url);
    }
    booksAndImages.push(url);
  });

  stream.on('end', (obj) => {
    // console.log('Books:', books);
    // console.log('Images:', images);
    return res.status(200).json({
      data: {
        books,
        images,
      },
    });
  });
}

router.get('/book/:studentClass', (req, res) => {
  const studentClass = req.params.studentClass;
  console.log(studentClass);

  switch (studentClass) {
    case 'CLASS VI':
      fetchBooksFromMinio(req, res, 'book-6');
      break;
    case 'CLASS VII':
      fetchBooksFromMinio(req, res, 'book-7');
      break;
    case 'CLASS VIII':
      fetchBooksFromMinio(req, res, 'book-8');
      break;
    case 'CLASS IX':
      fetchBooksFromMinio(req, res, 'book-9');
      break;
    case 'CLASS X':
      fetchBooksFromMinio(req, res, 'book-10');
      break;
  }
});

// Get user details:
router.get('/test-users', async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        address: true,
      },
    });
    res.status(200).json({
      msg: 'User data fetched successfully',
      user,
    });
  } catch (error) {
    res.status(200).json({
      msg: 'User creation failed',
      error: error.message,
    });
  }
});

// Edit user details:
router.patch('/update-user/:id', async (req, res) => {
  const userId = req.params.id;
  const { email, firstName, lastName, address } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        email,
        firstName,
        lastName,
        address,
      },
    });
    res.status(200).json({
      msg: 'User data updated successfully',
      user,
    });
  } catch (error) {
    res.status(200).json({
      msg: 'User update failed',
      error: error.message,
    });
  }
});

module.exports = router;
