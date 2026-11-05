
import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  User,
  AccessRequest,
  Token,
  Phase,
  Problem,
  Progress,
  XPTransaction,
  Note,
  Revision,
  AuditLog
} from "../models/index.js";

import { auth, adminOnly } from "../middleware/auth.js";
import { sendLinkEmail } from "../utils/email.js";

const r = Router();

const hash = (s) =>
  crypto.createHash("sha256").update(s).digest("hex");

const xpFor = (difficulty) =>
  ({ Easy: 10, Medium: 20, Hard: 40 })[difficulty] || 0;

const safeUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  leaderboardVisible: u.leaderboardVisible
});

// ==========================================
// AUTHENTICATION
// ==========================================

// Request student access
r.post("/auth/request-access", async (req, res) => {
  const { name, email, reason = "" } = req.body;

  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      message: "Valid name and email required"
    });
  }

  const normalized = email.toLowerCase().trim();

  if (
    await User.findOne({ email: normalized }) ||
    await AccessRequest.findOne({
      email: normalized,
      status: "pending"
    })
  ) {
    return res.status(409).json({
      message: "An account or pending request already exists"
    });
  }

  await AccessRequest.create({
    name,
    email: normalized,
    reason
  });

  res.status(201).json({
    message: "Access request submitted. Wait for admin approval."
  });
});

// Activate account
r.post("/auth/activate", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password || password.length < 10) {
    return res.status(400).json({
      message: "Token and password (10+ characters) required"
    });
  }

  const record = await Token.findOne({
    tokenHash: hash(token),
    type: "activation",
    expiresAt: { $gt: new Date() }
  });

  if (!record) {
    return res.status(400).json({
      message: "Activation link is invalid or expired"
    });
  }

  const user = await User.findById(record.userId);

  if (!user || user.status !== "pending_activation") {
    return res.status(400).json({
      message: "Account cannot be activated"
    });
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.status = "active";

  await user.save();
  await record.deleteOne();

  res.json({
    message: "Account activated. You can now log in."
  });
});

// Login
r.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: String(email || "").toLowerCase().trim()
  });

  if (
    !user ||
    !user.passwordHash ||
    !(await bcrypt.compare(password || "", user.passwordHash))
  ) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  if (user.status !== "active") {
    return res.status(403).json({
      message: "Your account is not active"
    });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "none",
    maxAge: 8 * 60 * 60 * 1000
  });

  res.json({ user: safeUser(user) });
});

// Logout
r.post("/auth/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true"
  });

  res.json({ message: "Logged out" });
});

// Current user
r.get("/auth/me", auth, (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// FORGOT PASSWORD
// ==========================================

r.post("/auth/forgot-password", async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();

  const user = await User.findOne({ email });

  if (user && user.status === "active") {
    const raw = crypto.randomBytes(32).toString("hex");

    await Token.deleteMany({
      userId: user._id,
      type: "reset"
    });

    await Token.create({
      userId: user._id,
      tokenHash: hash(raw),
      type: "reset",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    await sendLinkEmail({
      to: user.email,
      subject: "V2 CodeZero password reset",
      url: `${process.env.CLIENT_URL}/reset-password?token=${raw}`
    });
  }

  res.json({
    message: "If the account exists, a reset link will be sent."
  });
});

// Reset password
r.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password || password.length < 10) {
    return res.status(400).json({
      message: "Valid token and password (10+ characters) required"
    });
  }

  const record = await Token.findOne({
    tokenHash: hash(token),
    type: "reset",
    expiresAt: { $gt: new Date() }
  });

  if (!record) {
    return res.status(400).json({
      message: "Reset link invalid or expired"
    });
  }

  const user = await User.findById(record.userId);

  if (!user || user.status !== "active") {
    return res.status(400).json({
      message: "Account cannot be reset"
    });
  }

  user.passwordHash = await bcrypt.hash(password, 12);

  await user.save();
  await record.deleteOne();

  res.json({ message: "Password updated" });
});

// ==========================================
// LEARNING PHASES
// ==========================================

r.get("/phases", auth, async (req, res) => {
  const phases = await Phase.find().sort({ number: 1 }).lean();

  const problems = await Problem.find()
    .select("_id phaseNumber")
    .lean();

  const completed = await Progress.find({
    userId: req.user._id
  }).select("problemId").lean();

  const completedSet = new Set(
    completed.map((x) => String(x.problemId))
  );

  res.json(
    phases.map((phase) => {
      const list = problems.filter(
        (p) => p.phaseNumber === phase.number
      );

      const count = list.filter(
        (p) => completedSet.has(String(p._id))
      ).length;

      const unlocked =
        phase.number === 1 ||
        phases
          .slice(0, phase.number - 1)
          .every((previous) => {
            const previousProblems = problems.filter(
              (p) => p.phaseNumber === previous.number
            );

            return (
              previousProblems.length > 0 &&
              previousProblems.every((p) =>
                completedSet.has(String(p._id))
              )
            );
          });

      return {
        ...phase,
        total: list.length,
        completed: count,
        percentage: list.length
          ? Math.round((count / list.length) * 100)
          : 0,
        unlocked
      };
    })
  );
});

// ==========================================
// PROBLEMS
// ==========================================

r.get("/problems", auth, async (req, res) => {
  const {
    q = "",
    topic = "",
    difficulty = "",
    phase = ""
  } = req.query;

  const filter = {};

  if (q) {
    filter.title = {
      $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i"
    };
  }

  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  if (phase) filter.phaseNumber = Number(phase);

  const problems = await Problem.find(filter)
    .sort({ phaseNumber: 1, order: 1 })
    .limit(500)
    .lean();

  const completed = await Progress.find({
    userId: req.user._id
  }).select("problemId").lean();

  const completedSet = new Set(
    completed.map((x) => String(x.problemId))
  );

  res.json(
    problems.map((p) => ({
      ...p,
      completed: completedSet.has(String(p._id))
    }))
  );
});

// Complete problem
r.post("/problems/:id/complete", auth, async (req, res) => {
  const problem = await Problem.findById(req.params.id);

  if (!problem) {
    return res.status(404).json({
      message: "Problem not found"
    });
  }

  if (problem.phaseNumber > 1) {
    const previous = await Problem.find({
      phaseNumber: problem.phaseNumber - 1
    }).select("_id").lean();

    const done = await Progress.countDocuments({
      userId: req.user._id,
      problemId: { $in: previous.map((p) => p._id) }
    });

    if (!previous.length || done !== previous.length) {
      return res.status(403).json({
        message: "Complete the previous phase first"
      });
    }
  }

  try {
    await Progress.create({
      userId: req.user._id,
      problemId: problem._id,
      completedAt: new Date()
    });

    await XPTransaction.create({
      userId: req.user._id,
      problemId: problem._id,
      points: xpFor(problem.difficulty),
      reason: "Problem completed"
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  res.json({
    message: "Completion saved",
    xp: xpFor(problem.difficulty)
  });
});

// Undo problem completion
r.delete("/problems/:id/complete", auth, async (req, res) => {
  const problem = await Problem.findById(req.params.id);

  if (!problem) {
    return res.status(404).json({
      message: "Problem not found"
    });
  }

  await Progress.deleteOne({
    userId: req.user._id,
    problemId: problem._id
  });

  await XPTransaction.deleteOne({
    userId: req.user._id,
    problemId: problem._id
  });

  res.json({ message: "Completion removed" });
});

// ==========================================
// DASHBOARD
// ==========================================

r.get("/dashboard", auth, async (req, res) => {
  const userId = req.user._id;
  const [solved, xp, phases, problems, recent] = await Promise.all([
    Progress.countDocuments({ userId }),
    XPTransaction.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]),
    Phase.countDocuments(),
    Problem.countDocuments(),
    Progress.find({ userId })
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(400)
      .populate("problemId", "title difficulty")
      .lean()
  ]);

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const completedDays = new Set(recent.map(item => {
    const date = item.completedAt || item.createdAt;
    return date ? new Date(date).toISOString().slice(0, 10) : null;
  }).filter(Boolean));
  const todayStart = new Date(`${todayKey}T00:00:00.000Z`);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const solvedToday = await Progress.countDocuments({ userId, completedAt: { $gte: todayStart, $lt: tomorrowStart } });

  let streak = 0;
  const cursor = new Date(`${todayKey}T00:00:00.000Z`);
  if (!completedDays.has(todayKey)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (completedDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  res.json({
    solved,
    xp: xp[0]?.total || 0,
    phases,
    problems,
    progress: problems ? Math.round((solved / problems) * 100) : 0,
    streak,
    solvedToday,
    dailyGoal: 5,
    recentActivity: recent.slice(0, 5).map(item => ({
      id: String(item._id),
      title: item.problemId?.title || "Completed problem",
      date: item.completedAt || item.createdAt,
      xp: xpFor(item.problemId?.difficulty)
    }))
  });
});

// ==========================================
// NOTES
// ==========================================

r.get("/notes", auth, async (req, res) => {
  res.json(
    await Note.find({ userId: req.user._id })
      .populate("problemId", "title difficulty")
      .sort({ updatedAt: -1 })
  );
});

r.post("/notes", auth, async (req, res) => {
  const { problemId, content } = req.body;

  if (!problemId || typeof content !== "string") {
    return res.status(400).json({
      message: "Problem and note required"
    });
  }

  const note = await Note.findOneAndUpdate(
    {
      userId: req.user._id,
      problemId
    },
    { content },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  res.json(note);
});

r.delete("/notes/:id", auth, async (req, res) => {
  await Note.deleteOne({
    _id: req.params.id,
    userId: req.user._id
  });

  res.json({ message: "Note deleted" });
});

// ==========================================
// REVISIONS
// ==========================================

r.get("/revisions", auth, async (req, res) => {
  res.json(
    await Revision.find({ userId: req.user._id })
      .populate("problemId", "title difficulty")
      .sort({ dueDate: 1 })
  );
});

r.post("/revisions", auth, async (req, res) => {
  const { problemId, dueDate } = req.body;

  if (!problemId || !dueDate) {
    return res.status(400).json({
      message: "Problem and due date required"
    });
  }

  const item = await Revision.create({
    userId: req.user._id,
    problemId,
    dueDate: new Date(dueDate)
  });

  res.status(201).json(item);
});

r.patch("/revisions/:id", auth, async (req, res) => {
  const item = await Revision.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id
    },
    {
      status: req.body.status === "completed"
        ? "completed"
        : "pending"
    },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({
      message: "Revision not found"
    });
  }

  res.json(item);
});

r.delete("/revisions/:id", auth, async (req, res) => {
  await Revision.deleteOne({
    _id: req.params.id,
    userId: req.user._id
  });

  res.json({ message: "Revision removed" });
});

// ==========================================
// LEADERBOARD
// ==========================================

r.get("/leaderboard", auth, async (req, res) => {
  const rows = await XPTransaction.aggregate([
    {
      $group: {
        _id: "$userId",
        xp: { $sum: "$points" }
      }
    },
    { $sort: { xp: -1 } },
    { $limit: 100 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $match: {
        "user.leaderboardVisible": true,
        "user.status": "active"
      }
    },
    {
      $project: {
        name: "$user.name",
        xp: 1
      }
    }
  ]);

  const counts = await Progress.aggregate([
    {
      $group: {
        _id: "$userId",
        solved: { $sum: 1 }
      }
    }
  ]);

  const map = new Map(
    counts.map((x) => [String(x._id), x.solved])
  );

  res.json(
    rows.map((x, i) => ({
      rank: i + 1,
      name: x.name,
      xp: x.xp,
      solved: map.get(String(x._id)) || 0
    }))
  );
});

// ==========================================
// ADMIN
// ==========================================

// Admin overview
r.get("/admin/overview", auth, adminOnly, async (req, res) => {
  const [total, pending, active, suspended, solves, totalXp] =
    await Promise.all([
      User.countDocuments({ role: "student" }),
      AccessRequest.countDocuments({ status: "pending" }),
      User.countDocuments({
        role: "student",
        status: "active"
      }),
      User.countDocuments({
        role: "student",
        status: "suspended"
      }),
      Progress.countDocuments(),
      XPTransaction.aggregate([{ $group: { _id: null, total: { $sum: "$points" } } }])
    ]);

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 29);
  const registrationRows = await User.aggregate([
    { $match: { role: "student", createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({ total, pending, active, suspended, solves, totalXp: totalXp[0]?.total || 0, registrations: registrationRows });
});

// Pending access requests
r.get("/admin/requests", auth, adminOnly, async (req, res) => {
  res.json(
    await AccessRequest.find({ status: "pending" })
      .sort({ createdAt: 1 })
  );
});

// Approve student request
r.post("/admin/requests/:id/approve", auth, adminOnly, async (req, res) => {
  const request = await AccessRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      message: "Request not found"
    });
  }

  let user = await User.findOne({ email: request.email });

  if (!user) {
    user = await User.create({
      name: request.name,
      email: request.email,
      role: "student",
      status: "pending_activation"
    });
  }

  const raw = crypto.randomBytes(32).toString("hex");

  await Token.deleteMany({
    userId: user._id,
    type: "activation"
  });

  await Token.create({
    userId: user._id,
    tokenHash: hash(raw),
    type: "activation",
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
  });

  request.status = "approved";
  await request.save();

  await AuditLog.create({
    actorId: req.user._id,
    action: "student_approved",
    targetId: user._id
  });

  await sendLinkEmail({
    to: user.email,
    subject: "Activate your V2 CodeZero account",
    url: `${process.env.CLIENT_URL}/activate?token=${raw}`
  });

  res.json({
    message: "Approved. Activation email sent if SMTP is configured."
  });
});

// Reject student request
r.post("/admin/requests/:id/reject", auth, adminOnly, async (req, res) => {
  const request = await AccessRequest.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" }
  );

  if (!request) {
    return res.status(404).json({
      message: "Request not found"
    });
  }

  await AuditLog.create({
    actorId: req.user._id,
    action: "request_rejected",
    targetId: request._id
  });

  res.json({ message: "Request rejected" });
});

// List students
r.get("/admin/students", auth, adminOnly, async (req, res) => {
  res.json(
    await User.find({ role: "student" })
      .select("-passwordHash")
      .sort({ createdAt: -1 })
  );
});

// Suspend or reactivate student
r.patch("/admin/students/:id/status", auth, adminOnly, async (req, res) => {
  if (!["active", "suspended"].includes(req.body.status)) {
    return res.status(400).json({
      message: "Invalid status"
    });
  }

  const user = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      role: "student"
    },
    { status: req.body.status },
    { new: true }
  ).select("-passwordHash");

  if (!user) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  await AuditLog.create({
    actorId: req.user._id,
    action: `student_${req.body.status}`,
    targetId: user._id
  });

  res.json(user);
});

// Audit logs
r.get("/admin/audit", auth, adminOnly, async (req, res) => {
  res.json(
    await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
  );
});

export default r;
