const mongoose=require('mongoose')
require('dotenv').config({path:'src/config/dot.env'})


mongoose.connect(process.env.mongo_url1,{//connecting to database by mongoose
useNewUrlParser:true,

}).then(()=>{console.log('connection')}).catch((e)=>console.log(e))