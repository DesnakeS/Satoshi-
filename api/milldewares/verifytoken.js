const jwt=require('jsonwebtoken');


const verifyToken=(req,res)=>{
    const token=req.headers.autorization.split( '')[1];
    if(!token) return res.status(403).json({message:'no token provided'});
    jwt.verify(token,process.env.jwt_SECRET_KEY,(err,decoded)=>{
if(err) return res.status(401).json('echec lors de lors de l.authentification')
     req.user=decoded
next()
    });
    
};
module.exports=verifyToken