const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// add note in online class
exports.addNoteAtOnlineClass=async(req,res)=>{
    try{
        let {noteContent,onlineClassId,teacherEmail}=req.body;

        if(!noteContent || !onlineClassId || !teacherEmail){
         return res
         .status(400)
         .type('json')
         .json({error:'Bad request'})
        }

        let onlineClass= await prisma.onlineClass.findUnique({
          where:{
            id:onlineClassId
          }
        })
        // checking given class presend or not in DB
        if(!onlineClass){
          return res
          .status(404)
          .type('json')
          .json({error:'this class does not found'})
        }
        // Check if the teacherEmail in the online class matches the provided teacherEmail
        if(onlineClass?.teacherEmail!==teacherEmail){
          return res
          .status(403)
          .type('json')
          .json({error:"You are not authorized to add note in this class"})
        }

        // adding note at onlineclass 
        let addNote=await prisma.note.create({
          data:{
            content: noteContent,
            onlineClassId: onlineClassId
          }
        })

        res.status(201).type('json').json(addNote);
       
    }catch(err){
      res.status(200).type('json').json('internel server error')
    }
     
}