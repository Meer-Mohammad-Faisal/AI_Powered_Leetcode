const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require('../models/submission');

const register = async (req, res) => {
    try{

         //console.log("📩 Received register request:", req.body); // 👈 Add this line first
        // validate the data:
        validate(req.body);
        const {firstName, emailId, password} = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user';

       
        const user = await User.create(req.body);
        const token = jwt.sign({_id:user._id, emailId, role: 'user'}, process.env.JWT_KEY, {expiresIn: 60*60});
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }
        
        res.cookie('token', token, {maxAge: 60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })

    }
    catch(err){
        console.log(err);
        res.status(400).send("Error: "+err);
    }
}


// login:
const login = async (req, res) => {

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        // extracting email, password:
        const user = await User.findOne({emailId});

        const match = await bcrypt.compare(password, user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        }

        const token = jwt.sign({_id:user._id, emailId, role:user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
        res.cookie('token', token, {maxAge: 60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })

    }
    catch(err){
        res.status(503).send("Error "+err);
    }
}


// logout feature

const logout = async(req, res) => {
    try{
        const {token} = req.cookies;

        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);


         res.cookie("token", null, {expires: new Date(Date.now())});
        res.send("Logged Out Successfully");
        // validate the token
        // token add in the Redis blocklist
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}




const adminRegister = async(req, res) =>{
    try{
        // validate the data:
        validate(req.body);
        const {firstName, emailId, password} = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        
       
        const user = await User.create(req.body);
        const token = jwt.sign({_id:user._id, emailId, role:user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
        res.cookie('token', token, {maxAge: 60*60*1000});
        res.status(201).send("User register successfully");

    }
    catch(err){
        console.log(err);
        res.status(400).send("Error: "+err);
    }
}


const deleteProfile = async(req, res) => {
    try{
        const userId = req.result._id;

        // user schema delete
        await User.findByIdAndDelete(userId);

        // Submission se bhi delete kro...
        // await Submission.deleteMany({userId});

        res.status(200).send("Deleted Successfully");


    }
    catch(err){
        res.status(500).send("Internal server Error");
    }
}


module.exports = {register, login, logout, adminRegister, deleteProfile};