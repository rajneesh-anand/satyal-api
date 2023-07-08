const router=require('express').Router();
const path=require('path');
const fs=require('fs');


router.get('/',async(req,res)=>{
    
    fs.readFile(path.join(__dirname,'../','upload','/','pricing.json'),'utf-8',(err,data)=>{
     if(err){
        res.status(400).type('json').json(err)
     }
     res.status(200).type('json').json(JSON.parse(data));
    })
    
  
})

module.exports=router;