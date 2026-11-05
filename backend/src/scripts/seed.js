import "dotenv/config";
import { connectDB } from "../config/db.js";
import { Phase, Problem } from "../models/index.js";
import data from "./seed-data.json" with { type: "json" };
await connectDB();
for (const phase of data.phases) await Phase.updateOne({number:phase.number},{$set:phase},{upsert:true});
for (const p of data.problems) await Problem.updateOne({phaseNumber:p.phaseNumber,order:p.order},{$set:p},{upsert:true});
// Remove obsolete placeholder rows beyond each phase's new curated count while preserving IDs for matching phase/order records.
for (const phase of data.phases) { const maxOrder = Math.max(...data.problems.filter(p => p.phaseNumber === phase.number).map(p => p.order)); await Problem.deleteMany({phaseNumber:phase.number,order:{$gt:maxOrder}}); }
console.log(`Seeded ${data.phases.length} phases and ${data.problems.length} problems.`);
process.exit(0);
