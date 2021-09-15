const express = require('express')
const bcrypt=require('bcryptjs')

require('dotenv').config({path:'src/config/dot.env'})


require('./db/mongoose.js')

const userRouter=require('./routers/user')//all routes are placed on user.js 
const taskRouter=require('./routers/task')

const app = express()
const port = process.env.PORT 

app.use(express.json())//converts incoming json directly to object

app.use(userRouter)
app.use(taskRouter)






app.listen(port, () => {
    console.log('server running in port  ' + port)
})
