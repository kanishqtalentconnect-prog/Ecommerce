// import mongoose from "mongoose";

// export const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log("MongoDB Connected");
//     } catch (error) {
//         console.error("MongoDB Connection Error:", error);
//         process.exit(1); // Exit the process on failure
//     }
// };

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
   const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB", error.message);
    process.exit(1);
  }
};