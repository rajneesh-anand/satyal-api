const route = require('express').Router();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const Minio = require('minio');

var client = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  port: 8080,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

async function getQuestions(sheetTitle) {
  if (
    !(
      process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_SPREADSHEET_SATYAL
    )
  ) {
    throw new Error('forbidden');
  }

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_SATYAL);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[sheetTitle]; // or use doc.sheetsById[id]
  const rows = await sheet.getRows(); // can pass in { limit, offset }

  const products = rows?.map(
    ({ Subject, Chapter_Name, Chapter_Number, Question, Question_Type, Image_Link }) => ({
      Subject,
      Chapter_Name,
      Chapter_Number,
      Question,
      Question_Type,
      Image_Link,
    })
  );
  return products;
}

async function fetchQuestionImagesFromMinio(questions, bucketName, subject) {
  try {
    let updatedQuestions = [];

    for (const question of questions) {
      if (question.Image_Link) {
        const fileName = question.Image_Link;
        const fullFileName = `${subject}/${fileName}`;
        const signedUrl = await client.presignedGetObject(bucketName, fullFileName);

        const updatedQuestion = {
          ...question,
          Image_Minio_Link: signedUrl,
        };

        updatedQuestions.push(updatedQuestion);
      } else {
        updatedQuestions.push(question);
      }
    }

    return updatedQuestions;
  } catch (error) {
    console.error('Error while fetching images from MinIO:', error);
    throw new Error('Failed to fetch images from MinIO');
  }
}

route.get('/:className/:subject', async (req, res) => {
  const className = req.params.className;
  const subjectQuery = req.params.subject;

  // className === bucketName;
  // subject === folder name inside bucketName
  // front should send subject name as folder name inside bucketName and className as bucketName

  try {
    let data = await getQuestions(className);
    let filterData_withSubject = data.filter((item) => item.Subject == subjectQuery);

    const updatedQuestions = await fetchQuestionImagesFromMinio(
      filterData_withSubject,
      className,
      subjectQuery
    );
    // console.log(updatedQuestions);

    res.status(200).type('json').json({ questions: updatedQuestions });
  } catch (err) {
    res.status(404).type('json').json('server internal error');
  }
});

module.exports = route;
