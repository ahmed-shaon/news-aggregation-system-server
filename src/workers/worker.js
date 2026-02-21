import "dotenv/config";
import { connectDB } from "../config/db.js";
import { startCron } from "../jobs/newsCron.js";

async function startWorker() {
  try {
    await connectDB();
    console.log("Worker connected to DB");
    startCron();
  } catch (error) {
    console.error("Worker failed:", error);
    process.exit(1);
  }
}

startWorker();