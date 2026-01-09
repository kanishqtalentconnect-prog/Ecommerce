import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import addressRoutes from "./routes/address.route.js";
import shippingrateRoutes from "./routes/shippingrate.route.js";
import trackingRoutes from "./routes/tracking.route.js";
import blogRoutes from "./routes/blog.route.js";
import staticPageRoutes from "./routes/pages.route.js";
import faqRoutes from "./routes/faq.route.js";
import categoryRoutes from "./routes/categories.route.js";
import discountRoutes from "./routes/discount.route.js"; // Add discount routes
import { connectDB } from "./lib/db.js";
import productVariantRoutes from "./routes/productVariant.route.js";
import supportTickerRoutes from "./routes/supportTicket.route.js";
import subsRoutes from "./routes/subscription.route.js";
import path from 'path';
import { fileURLToPath } from 'url';
import checkoutRoutes from "./routes/checkout.route.js";
import ordersRoutes from "./routes/orders.route.js";
import messageRoutes from "./routes/message.route.js";
import reviewRoutes from "./routes/review.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import session from "express-session"; 
import { sendEmail } from "./utils/sendEmail.js";
import { razorpayWebhook } from "./controllers/payment.controller.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use CORS middleware with environment-based
//  frontend URL
const allowedOrigins = [
  "http://localhost:5173", 
  process.env.FRONTEND_URL,
];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  razorpayWebhook
);
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true if using HTTPS in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);



// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoute);
app.use("/api/addresses", addressRoutes);
app.use("/api/rates", shippingrateRoutes);
app.use("/api/orders", trackingRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/pages", staticPageRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/discounts", discountRoutes); // Add discount routes
app.use("/api/products/:id/variants", productVariantRoutes);
app.use("/api/tickets", supportTickerRoutes);
app.use("/api/subscription", subsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/checkout", checkoutRoutes);
app.use("/api/admin/orders",ordersRoutes);
app.use("/api/header-messages", messageRoutes);
app.use("/api/reviews", reviewRoutes); // Add review routes
app.use("/api/address", addressRoutes);//Location fetch
app.use("/api/wishlist", wishlistRoutes);//Wishlist
app.get("/test-email", async (req, res) => {
  await sendEmail({
    to: "catastrophe637@gmail.com",
    subject: "SMTP Test",
    html: "<h1>SMTP working</h1>"
  });
  res.send("Email sent");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    connectDB();
});


