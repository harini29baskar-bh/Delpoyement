import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(".env") });
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { User } from "../models/index.js";
await connectDB();
const {ADMIN_NAME,ADMIN_EMAIL,ADMIN_PASSWORD}=process.env;
if(!ADMIN_NAME||!ADMIN_EMAIL||!ADMIN_PASSWORD||ADMIN_PASSWORD.length<12)throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars) in .env");
const email=ADMIN_EMAIL.toLowerCase().trim();
const existing=await User.findOne({email});
if(existing){console.log("Admin email already exists; no changes made.");process.exit(0);}
await User.create({name:ADMIN_NAME,email,passwordHash:await bcrypt.hash(ADMIN_PASSWORD,12),role:"admin",status:"active"});
console.log("Admin created:",email);process.exit(0);
