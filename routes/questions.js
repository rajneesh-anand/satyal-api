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

function convertClass(studentClass) {
  switch (studentClass) {
    case 'CLASS Nursery':
      return 'class-n';

    case 'CLASS LKG':
      return 'class-l';

    case 'CLASS UKG':
      return 'class-u';

    case 'CLASS I':
      return 'class-1';

    case 'CLASS II':
      return 'class-2';

    case 'CLASS III':
      return 'class-3';

    case 'CLASS IV':
      return 'class-4';

    case 'CLASS V':
      return 'class-5';

    case 'CLASS VI':
      return 'class-6';

    case 'CLASS VII':
      return 'class-7';

    case 'CLASS VIII':
      return 'class-8';

    case 'CLASS IX':
      return 'class-9';

    case 'CLASS X':
      return 'class-10';
  }
}

function convertClassToBucketName(studentClass) {
  switch (studentClass) {
    case 'class-n':
      return 'question-n';

    case 'class-l':
      return 'question-l';

    case 'class-u':
      return 'question-u';

    case 'class-1':
      return 'question-1';

    case 'class-2':
      return 'question-2';

    case 'class-3':
      return 'question-3';

    case 'class-4':
      return 'question-4';

    case 'class-5':
      return 'question-5';

    case 'class-6':
      return 'question-6';

    case 'class-7':
      return 'question-7';

    case 'class-8':
      return 'question-8';

    case 'class-9':
      return 'question-9';

    case 'class-10':
      return 'question-10';

    default:
      return null;
  }
}

async function fetchQuestionImagesFromMinio(questions, bucketName) {
  try {
    let updatedQuestions = [];

    for (const question of questions) {
      if (question.Image_Link) {
        const fileName = question.Image_Link;
        const fullFileName = `English-Vol-3/${fileName}`;
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
  //synchronizing user send classname to googleSheet className
  let googleSpreadClass = convertClass(className);
  //synchronizing user send classname to minio bucketName
  let bucketName = convertClassToBucketName(googleSpreadClass);

  try {
    let data = await getQuestions(googleSpreadClass);
    let filterData_withSubject = data.filter((item) => item.Subject == subjectQuery);

    const updatedQuestions = await fetchQuestionImagesFromMinio(
      filterData_withSubject,
      bucketName
    );
    console.log(updatedQuestions);

    res.status(200).type('json').json({ questions: updatedQuestions });
  } catch (err) {
    res.status(404).type('json').json('server internal error');
  }
});

module.exports = route;
