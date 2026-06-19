import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
import User from "./user.model.js";
import { createAccessToken, createRefreshToken } from "../../utils/tokens.js";
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies } from "../../utils/cookies.js";

// ===== LOGIN =====
export const login = async (req,res)=>{ 
  try {
    const { email,password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if(!user) return res.status(401).json({ message:"Invalid credentials" });

    const ok = await bcrypt.compare(password,user.password);
    if(!ok) return res.status(401).json({ message:"Invalid credentials" });

    const payload = { id:user._id, role:user.role };
    setAccessTokenCookie(res, createAccessToken(payload));
    setRefreshTokenCookie(res, createRefreshToken(payload));

    return res.status(200).json({
      message:"Login successful",
      user:{ id:user._id, firstName:user.firstName, lastName:user.lastName, email:user.email, role:user.role }
    });
} catch(err){
    console.error("Login Error:",err);
    return res.status(500).json({ message:"Internal server error" });
} };

// ===== LOGOUT =====
export const logout = (req,res)=>{ 
  clearAuthCookies(res); 
  return res.status(200).json({ message:"Logout successful" }); 
};

// ===== REFRESH =====
export const refresh = async (req,res)=>{ 
  try {
    const token = req.cookies?.RefreshToken;
    if(!token) return res.status(401).json({ message:"Missing refresh token" });

    const decoded = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if(!user){
      clearAuthCookies(res);
      return res.status(401).json({ message:"User not found" });
    }

    const payload = { id:user._id, role:user.role }
    setAccessTokenCookie(res, createAccessToken(payload));

    return res.status(200).json({ message:"Token refreshed" });
} catch(err){
    clearAuthCookies(res);
    return res.status(401).json({ message:"Invalid or expired refresh token" });
} };

// ===== ME =====
export const me = async (req,res)=>{ 
  try {
    const user = await User.findById(req.user.id);
    if(!user) return res.status(404).json({ message:"User not found" });

    return res.status(200).json({ user });
} catch(err){
    console.error("Me Error:",err);
    return res.status(500).json({ message:"Internal server error" });
} };