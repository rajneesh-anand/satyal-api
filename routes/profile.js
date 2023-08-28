

const express=require("express");
const router=express.Router();
const prisma = require("../lib/prisma");

router.get('/:useremail',async(req,res)=>{
    let useremail=req.params.useremail;
  
    try{
      let logInUser=await prisma.user.findUnique({
        where:{
            email:useremail,
      },
      select:{
        firstName:true,
        middleName:true,
        lastName:true,
        email:true,
        address:true,
        city:true,
        parentName:true,
        parentContactNumber:true,
        province:true,
        studentClass:true,
        userContactNumber:true,
        image:true,
        userType:true,
        userStatus :true,
        kycStatus:true,
        schoolName:true,
        schoolContact:true,
        schoolAddress:true,
        schoolCity:true,
        schoolProvince:true,
        teacherkycs:true,
      }
      })
      res.status(200).type('json').json(logInUser);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }finally{
        async()=>{
            await prisma.$disconnect();
        }
    }
    
    // res.status(200).type('json').json(email)
})


module.exports=router;