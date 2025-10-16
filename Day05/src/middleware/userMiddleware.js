const jwt = require("jsonwebtoken"); 
const User = require("../models/user");
const redisClient = require("../config/redis");
const userMiddleware = async (req, res, next) => {
    try{

        const {token} = req.cookies;
        if(!token)
            throw new Error("token is not present");

        const payload =  jwt.verify(token,process.env.JWT_KEY);

        const {_id} = payload;
 
        if(!_id){
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);

        if(!result) 
            throw new Error("User doesn't exist");


        // is they present in redis blocklist:
        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("invalid Token");

        req.result = result;

        next();
    }
    catch(err){
        res.status(401).send("Error: "+ err.message);
    }
} 

module.exports = userMiddleware;