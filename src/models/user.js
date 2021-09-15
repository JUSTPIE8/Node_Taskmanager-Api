const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
require('dotenv').config({path:'src/config/dot.env'})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            if (value.length < 6) {
                throw new Error('password must be greater than 6 characters')
            }
            if (value.includes('password')) {
                throw new Error('password cannot contain the word password')
            }

        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
        avatar:{
            type:Buffer
        }
    
},
{
 timestamps:true   
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuth = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.jwt_text)
    //    console.log(token)
    user.tokens = user.tokens.concat({ token })

    await user.save()
    return token
}

userSchema.methods.toJSON = function () {//toJSON name is important
    const user = this

    const userObject = user.toObject()//to change into object
    delete userObject.password;
    delete userObject.tokens
   delete userObject.avatar
    return userObject
}


userSchema.statics.findByCredentials = async (email, password) => {//findByCredentials is used in route file so using schema gives direct access to it 
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('unable to login')

    }
    return user

}


userSchema.pre('save', async function (next) {//like events   for models
    const user = this//changing this to user not necessary only for simplified process

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()//important without it program wont run simply
})


//delete tasks when user gets deleted
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: this._id })
    next()
})


const User = mongoose.model('User', userSchema)//only using userschema for using storing hash passwords 

module.exports = User