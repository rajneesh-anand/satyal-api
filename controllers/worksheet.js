const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Minio = require('minio'); // Import the Minio library

// Initialize Minio client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  port: 8080,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Function to upload a worksheet to Minio
const uploadWorksheetToMinio = async (worksheetFile) => {
  return new Promise((resolve, reject) => {
    minioClient.putObject(
      'worksheet-bucket',
      worksheetFile.name,
      worksheetFile.data,
      (err, etag) => {
        if (err) {
          reject(err);
        } else {
          resolve(etag);
        }
      }
    );
  });
};

exports.addWorksheetToOnlineClass = async (req, res) => {
  try {
    const { onlineClassId, teacherEmail, worksheetName } = req.body;
    const worksheetFile = req.file; // Assuming you're using multipart form data for file upload

    if (!onlineClassId || !teacherEmail || !worksheetName || !worksheetFile) {
      return res.status(400).json({ error: 'Bad request' });
    }

    const onlineClass = await prisma.onlineClass.findUnique({
      where: {
        id: onlineClassId,
      },
    });

    if (!onlineClass) {
      return res.status(404).json({ error: 'Online class not found' });
    }

    if (onlineClass.teacherEmail !== teacherEmail) {
      return res
        .status(403)
        .json({ error: 'You are not authorized to add a worksheet in this class' });
    }

    // Upload the worksheet file to Minio
    const fileEtag = await uploadWorksheetToMinio(worksheetFile);

    // Add the worksheet record to the database
    const addedWorksheet = await prisma.worksheet.create({
      data: {
        name: worksheetName,
        url: `https://${process.env.MINIO_HOST}/worksheet-bucket/${worksheetFile.name}`,
        onlineClassId: onlineClassId,
      },
    });

    res.status(201).json(addedWorksheet);
  } catch (error) {
    console.error('Error adding worksheet to class:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteWorksheetFromOnlineClass = async (req, res) => {
  try {
    const { id, onlineClassId, teacherEmail, url } = req.body;

    if (!id || !onlineClassId || !teacherEmail) {
      return res.status(400).json({ error: 'Bad Request, Please Try Again' });
    }

    const onlineClass = await prisma.onlineClass.findUnique({
      where: {
        id: onlineClassId,
      },
    });

    if (!onlineClass) {
      return res.status(400).json({ error: 'Bad Request, Please Try Again' });
    }

    if (onlineClass.teacherEmail !== teacherEmail) {
      return res.status(401).json({ error: 'You Are An Unauthorized User' });
    }

    const worksheetToDelete = await prisma.worksheet.findUnique({
      where: {
        id: id,
      },
    });

    if (!worksheetToDelete) {
      return res.status(404).json({ error: 'This Worksheet Does Not Exist' });
    }

    // Delete the worksheet file from Minio
    const fileName = url.split('/').pop(); // Extract the filename from the URL
    minioClient.removeObject('worksheet-bucket', fileName, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting worksheet file' });
      }
    });

    // Delete the worksheet record from the database
    await prisma.worksheet.delete({
      where: {
        id: id,
      },
    });

    return res.status(204).json({ message: 'Worksheet Deleted' });
  } catch (error) {
    console.error('Error deleting worksheet from class:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Implement a route to serve worksheets to students for viewing and downloading
exports.getWorksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const worksheet = await prisma.worksheet.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!worksheet) {
      return res.status(404).json({ error: 'Worksheet not found' });
    }

    // You can implement code here to serve the file to students
    // For example, you can send the URL as a download link in the response

    res.status(200).json(worksheet);
  } catch (error) {
    console.error('Error getting worksheet:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
