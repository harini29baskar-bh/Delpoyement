import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export async function auth(req, res, next) {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user || user.status !== "active") return res.status(403).json({ message: "Account is not active" });
    req.user = user;
    next();
  } catch { return res.status(401).json({ message: "Invalid or expired session" }); }
}
export const adminOnly = (req,res,next) => req.user?.role === "admin" ? next() : res.status(403).json({message:"Admin access required"});
