import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  status: { type: String, enum: ["pending_activation", "active", "suspended"], default: "pending_activation" },
  leaderboardVisible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  name: String, email: { type: String, lowercase: true, trim: true },
  reason: String, status: { type: String, enum: ["pending","approved","rejected"], default: "pending" }
}, { timestamps: true });

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, unique: true },
  type: { type: String, enum: ["activation","reset"], required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const phaseSchema = new mongoose.Schema({
  number: { type: Number, unique: true }, title: String, description: String, topics: [String], order: Number
}, { timestamps: true });

const problemSchema = new mongoose.Schema({
  phaseNumber: { type: Number, index: true }, title: String, leetcodeId: Number, pattern: String,
  difficulty: { type: String, enum: ["Easy","Medium","Hard"] },
  topic: String, objective: String, description: String, leetcodeUrl: String,
  order: Number
}, { timestamps: true });

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  completedAt: Date
}, { timestamps: true });
progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const xpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  points: Number, reason: String
}, { timestamps: true });
xpSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  content: { type: String, maxlength: 10000 }
}, { timestamps: true });
noteSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const revisionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  dueDate: Date, status: { type: String, enum: ["pending","completed"], default: "pending" }
}, { timestamps: true });

const auditSchema = new mongoose.Schema({
  actorId: mongoose.Schema.Types.ObjectId, action: String, targetId: mongoose.Schema.Types.ObjectId, details: String
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
export const AccessRequest = mongoose.model("AccessRequest", requestSchema);
export const Token = mongoose.model("Token", tokenSchema);
export const Phase = mongoose.model("Phase", phaseSchema);
export const Problem = mongoose.model("Problem", problemSchema);
export const Progress = mongoose.model("Progress", progressSchema);
export const XPTransaction = mongoose.model("XPTransaction", xpSchema);
export const Note = mongoose.model("Note", noteSchema);
export const Revision = mongoose.model("Revision", revisionSchema);
export const AuditLog = mongoose.model("AuditLog", auditSchema);
