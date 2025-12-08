// import jwt from "jsonwebtoken"


// const userAuth= async (req,res,next)=>{
//     const {token}=req.headers;
//     if(!token){
//         return res.json({success: false, message:'Not Authorized. Login Again'});
//     }
//     try{
//           const tokenDecode = jwt.verify(token,process.env.JWT_SECRET)
//           if(tokenDecode.id){
          
//             req.body.userId = tokenDecode.id;
//           }else{
//             return res.json({success:false,message:'Not Authorized. Login Again'})
//           }
//           next();
//     }catch(error){
//        res.json({success:false,message:error.message})
//     }
// };

// export default userAuth;

import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    let token = req.headers.token || req.headers.authorization;
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    if (typeof token === "string" && token.startsWith("Bearer ")) token = token.slice(7).trim();
    token = token.replace(/^["']|["']$/g, "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) return res.status(401).json({ success: false, message: "Not authorized" });

    req.user = { id: decoded.id, ...decoded }; // attach user safely
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default userAuth;
