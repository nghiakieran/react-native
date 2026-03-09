import { connectDatabase } from "../config/database";
import { seedAdmin } from "./user.seeder";

const runSeed = async () => {
  try {
    await connectDatabase();
    await seedAdmin();
    console.log("Standalone seed finished.");
    process.exit(0);
  } catch (error) {
    console.error("Standalone seed failed:", error);
    process.exit(1);
  }
};

runSeed();
