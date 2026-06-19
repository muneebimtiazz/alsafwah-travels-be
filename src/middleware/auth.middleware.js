import jwt from "jsonwebtoken";

export const verifyAccessToken = (req,res,next)=>{ 
  try{
    const token = req.cookies?.AccessToken;
    if(!token) return res.status(401).json({ message:"Unauthorized" });

    const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

    req.user = { id:decoded.id, role:decoded.role };
    next();
}catch(err){
  return res.status(401).json({ message:"Token invalid or expired" });
}};