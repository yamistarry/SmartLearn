// const mongoose = require("mongoose");

// require("dotenv").config();

// exports.connect = () => {
//     mongoose.connect(process.env.MONGODB_URL,{
//         // useNewUrlParser:true,
//         // useUnifiedTopology:true
//     })
//     .then(() => {console.log("DB connected successfully")})
//     .catch( (err) => {
//         console.log("DB CONNECTION ISSUES");
//         console.error(err);
//         process.exit(1);
//     } );
// }
// const mongoose = require("mongoose");
// require("dotenv").config(); // Ensure this is present

// exports.connect = async () => {
//   try {
//     const uri = process.env.MONGO_URI;
//     if (!uri) {
//       throw new Error("MongoDB URI is missing from .env file");
//     }

//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log("Database connected successfully");
//   } catch (err) {
//     console.error("DB CONNECTION ISSUES", err);
//     process.exit(1);
//   }
// };
const mongoose = require("mongoose");
require("dotenv").config(); // Ensures .env is loaded

exports.connect = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MongoDB URI is missing from .env file");
    }

    await mongoose.connect(uri); // No need for deprecated options

    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ DB CONNECTION ISSUES:", err);
    process.exit(1); // Exit if connection fails
  }
};
