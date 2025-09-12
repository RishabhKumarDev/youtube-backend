import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";


dotenv.config({path:"./.env"});

(async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, (req, res) => {
      console.log("App is listening to", `http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Error in Connection", error);
    process.exit(1);
  }
})();
