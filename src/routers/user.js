const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth');
const multer = require('multer')
const {sendMail,cancelMail}=require('../emails/account')
const router = new express.Router()
const sharp=require('sharp')//for resizing images on uploading 

router.post('/user', async (req, res) => {

    const user = new User(req.body)//User creates a mongoose model for user

    try {
        await user.save()
        sendMail(user.email,user.name)
        const token = await user.generateAuth()
        res.status(201).send({ user, token })

    } catch (e) {
        res.status(400)
        res.send(e)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuth()
        res.send({ user, token })
    }
    catch (e) {
        res.status(400).send()
    }
})


router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/user/logoutall', auth, async (req, res) => {
    try {

        req.user.tokens = []
        await req.user.save()

        res.send()

    } catch (e) {
        res.status(500).send()
    }
})
router.get('/users', async (req, res) => {//not for production only testing

    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/user/me', auth, async (req, res) => {

    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})


const upload = multer({
    // dest:'images',
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('NOt a image'))
        }

        cb(undefined, true)

    }
})
router.post('/user/me/avatar', auth, upload.single('upload'), async (req, res) => {
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    //req.user.avatar = req.file.buffer
    req.user.avatar=buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/user/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch (e) {
        res.status(404).send()
    }
})




/* router.get('/user/:id', async (req, res) => {       //not needed as there is already /user/me
    const _id = req.params.id
    try {
        const user = await User.find({ _id })
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})
 */


router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isvalidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isvalidOperation) {
        return res.status(404).send({ error: 'Invalid Updates' })
    }
    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        //since it bypasses the password securing method so the down process is used


        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})


router.delete('/user/me', auth, async (req, res) => {
    try {
        /*    const user = await User.findByIdAndDelete(req.params.id)
           if (!user) {
               return res.status(404).send()
           } */


        await req.user.remove()
        cancelMail(req.user.email,req.user.name)
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
