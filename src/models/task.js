const mongoose=require('mongoose')
const Taskschema = new mongoose.Schema( {
   
        description:{
        type:String,
        required:true,
            validate(value){
               if(!value.length>6) {
                   throw new Error('Must be longer than 6 characters');
               }
            }
    },
    completed:{
        type:Boolean,
        default:false,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
},
{
    timestamps:true
}
)

const Task=mongoose.model('Task',Taskschema)

module.exports=Task