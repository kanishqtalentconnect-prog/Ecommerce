import axios from "axios";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const res = await axios.post(process.env.GAS_EMAIL_URL, {
      to,
      subject,
      html,
    });

    console.log("✅ GAS Email sent:", to);
    return res.data;
  } catch (err) {
    console.error("❌ GAS Email failed:", err.message);
    return null;
  }
};
