const express=require('express');
const router=express.Router();

const {addNoteAtOnlineClass} =require('../controllers/note');

router.post('/onlineClass/add',addNoteAtOnlineClass);
router.get('/',(req,res)=>{
    res.status(200).type('json').json('online class get route ')
})




module.exports=router;