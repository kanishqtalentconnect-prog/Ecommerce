import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  console.log("📨 sendEmail called");
  console.log("To:", to);
  console.log("Subject:", subject);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Shop" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
};
