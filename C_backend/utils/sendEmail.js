import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  console.log("📨 Attempting to send email to:", to);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, 
      port: 465,                   
      secure: true,                
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, 
      },
      // Adding timeouts to prevent the process from hanging too long
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"UtsaviCraft" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    // On hosted environments, we catch the error but don't let it crash the app
    return null; 
  }
};