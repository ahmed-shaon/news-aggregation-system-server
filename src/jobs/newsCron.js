import cron from "node-cron";
import { fetchAndStoreNews } from "../services/newsDataService.js";

// Run every hour at minute 0 (1:00, 2:00, 3:00...)
const CRON_SCHEDULE = "00 * * * *";

export function startCron() {
  cron.schedule(CRON_SCHEDULE, () => {
    console.log(`Cron running at ${new Date().toISOString()}`);
    fetchAndStoreNews();
  });
  console.log("Cron job scheduled (every 1 hour)");
}
