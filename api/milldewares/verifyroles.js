const verifyRoles=(...allowedRoles)=>{
    return(req,res,next)=>{
        if(!req.user||! req.user.roles) return res.sendStatus(403) 
            const roles=req.user.roles
        const hasRoles=allowedRoles.some(role=>roles.includes(role));
        if(!hasRoles) return res.sendStatus(403)
            next()
    };
};
module.exports=verifyRoles