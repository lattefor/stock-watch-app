import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase } from "../database/mongoose";

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function main() {
  console.log("Testing MongoDB connection...");
  console.log(`MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
  console.log(`MONGODB_URI length: ${process.env.MONGODB_URI?.length || 0}`);
  
  try {
    const connection = await connectToDatabase();
    console.log("✅ MongoDB connection successful!");
    console.log(`Database: ${connection.connection.db?.databaseName}`);
    console.log(`Host: ${connection.connection.host}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB connection failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
