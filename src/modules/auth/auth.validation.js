

export const validateLogin = (req,res,next)=>{ 
    let { email,password } = req.body;

    email = email?.trim().toLowerCase();
    req.body.email = email;

    if(!email || !password)
    return res.status(400).json({ message:"Email and password are required" });

    next();
};