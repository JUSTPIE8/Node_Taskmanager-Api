const jwt = require('jsonwebtoken')
const User = require('../models/user')

require('dotenv').config({path:'src/config/dot.env'})

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
       // console.log(token)
        const decoded = jwt.verify(token, process.env.jwt_text)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
       // console.log(user)

        if (!user) {
            throw new Error()
        }
        req.token=token;
        req.user = user;

        next()
    }

    catch (e) {
        res.status(401).send({
            error: 'please authenticate'
        })
    }
}

module.exports = auth