import nodemailer from "nodemailer";

const sendVerificationMail = async (email: string, token: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            }
        } as nodemailer.TransportOptions);
    
        const verificationLink = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;
    
        const mailOptions = {
          from: `"Authentication App" <${process.env.MAILTRAP_USERNAME}>`,
          to: email,
          subject: "Please verify your email address",
          text: `
            Thank you for registering! Please verify your email address to complete your registration.
            ${verificationLink}
            This verification link will expire in 10 mins.
            If you did not create an account, please ignore this email.
          `,
        };
    
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return true
    } catch (error) {
        console.log('Error sending email:', error);
        return false
    }
}

export default sendVerificationMail