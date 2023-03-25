const nodemailer = require('nodemailer')

const body = (type, message, name)=>{
    switch(type) {
        case "ACCEPT":
          return    `
                    <p>Hello <b>${name}</b>!</p>
                    <p>Thank you for signing up for OCR.</p>
                    <p>We'd like to confirm that <span style="color:green;">your account was created successfully</span>. To get you started, please click on the link below to log in to your account.</p>
                    <p>Admin message: ${message}</p>
                    <br/>
                    The OCR tech team,<br/>
                    ocr.tech.team@gmail.com
                    `
        case "REJECT":
            return    `
                    <p>Hello <b>${name}</b>!</p>
                    <p>Thank you for signing up for OCR.</p>
                    <p>We regret to inform you that <span style="color:red;">your account activation was rejected</span>. To learn more, please contact the system administrator.</p>
                    <p>Admin message: ${message}</p>
                    <br/>
                    The OCR tech team,<br/>
                    ocr.tech.team@gmail.com
            `
        default:
           return ' '
    }
}

function sendEmail(recieversEmail, type, message, name){

    return new Promise((resolve, reject)=>{

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.SENDERS_EMAIL,
                pass: process.env.SENDERS_PASS
            }
        })

        const mail_config = {
            from: `OCR Tech Team <${process.env.SENDERS_EMAIL}>`,
            to: recieversEmail,
            subject: 'OCRP Account Registrations',
            matext:'Your OCRP account is ready to use. Use your credentials to login to the application.',
            html: body(type,message,name)
        }

        transporter.sendMail(mail_config, function(error, info){
            if(error){
                return reject({message: 'Error sending emails'})
            }

            return resolve({message: 'email sent successfuly'})
        })
    })

}

module.exports = { sendEmail };