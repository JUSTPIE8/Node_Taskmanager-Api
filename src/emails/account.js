const sgMail=require('@sendgrid/mail')
require('dotenv').config({path:'src/config/dot.env'})


sgMail.setApiKey(process.env.sendgridApi)

const sendMail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'justpie8@gmail.com',
        subject:'Thanks for joining in',
        text:`Welcome to the app , ${name} Let me know how you got along with the app`
    })
}


const cancelMail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'justpie8@gmail.com',
        subject:'Deleting account',
        text:`Thank you for using our app .Hoping to see you again ${name}`
    })
}

module.exports={
    sendMail,
    cancelMail
}