const express=require('express')
const Task=require('../models/task')
const auth=require('../middleware/auth')
const router=new express.Router()


router.post('/task',auth, async (req, res) => {//for endpoint task
  //  const task = new Task(req.body);//Task is the mongoose model
const task=new Task({
    ...req.body,
    owner:req.user._id
})
    try {
      await  task.save()
        res.send(task).status(201)
    } catch (e) {
        res.status(500).send(e)
    }

})


router.get('/tasks',auth, async (req, res) => {
  const match=req.query.completed
 const limit=parseInt(req.query.limit)
 const skip=parseInt(req.query.skip)
const sort={}

 if(req.query.sortby){
const parts=req.query.sortby.split('-')
sort[parts[0]]=parts[1]==='desc'?-1:1
} 

    try {
       
const tasks = await Task.find({owner:req.user._id,completed:match}).limit(limit).skip(skip).sort(sort)
        res.send(tasks)
    } catch (e) {
        res.status(500).send(e)
    }

})

router.get('/task/:id',auth, async (req, res) => {
    const _id = req.params.id
    try {
       // const task = await Task.find({ _id })
       const task=await Task.findOne({_id,owner:req.user._id
       }) 
       if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})


router.patch('/task/:id', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed'];
    const isvalidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isvalidOperation) {
        return res.status(400).send({ error: 'Invalid Updates' })
    }
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
       
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update)=>{
            task[update]=req.body[update]
        })
await task.save()
        res.send(task)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/task/:id',auth,async(req,res)=>{
    const _id=req.params.id;
    try{
       // const task=await Task.findByIdAndDelete(req.params.id)
       const task=await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task){
           return res.status(404).send()
        }
       
        res.send(task)
    }
catch (e){
res.status(500).send(e)
}
})


module.exports=router