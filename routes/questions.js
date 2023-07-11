const route=require('express').Router();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const Minio = require("minio");

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
   
    const products = rows?.map(({ Subject, Chapter_Name, Chapter_Number,Question,Question_Type,Image_Link }) => ({
      Subject,
      Chapter_Name,
      Chapter_Number,
      Question,
      Question_Type,
      Image_Link
    }));
    return products;
  }
function convertClass(studentClass){
    switch(studentClass){
        case'CLASS Nursery':
        return'class-n';
        
        case'CLASS LKG':
        return'class-l';
        
        case'CLASS UKG':
        return'class-u';
        
        case'CLASS I':
        return'class-1';
        
        case'CLASS II':
        return'class-2';
        
        case'CLASS III':
        return'class-3';
        
        case'CLASS IV':
        return'class-4';
        
        case'CLASS V':
        return'class-5';
        
        case'CLASS VI':
        return'class-6';
        
        case'CLASS VII':
        return'class-7';
        
        case'CLASS VIII':
        return'class-8';
        
        case'CLASS IX':
        return'class-9';
        
        case'CLASS X':
        return'class-10';
        
     } 
}

route.get("/:className/:subject",async(req,res)=>{
    const className=req.params.className;
    const subjectQuery=req.params.subject;
     let googleSpreadClass=convertClass(className);//synchronizing user send classname to googleSheet className
      
     try{
       let data=await getQuestions(googleSpreadClass);
       let filterData_withSubject=data.filter((item)=>item.Subject==subjectQuery);
      
       res.status(200).type('json').json({questions:filterData_withSubject});
     
     }catch(err){
        res.status(404).type('json').json('server internal error')
     }
   
})

module.exports=route;