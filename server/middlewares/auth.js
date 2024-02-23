const jwt = require("jsonwebtoken")
require("dotenv").config()
const User = require("../models/User")


//auth 
exports.auth = async(req,res,next) => {
    try{
        //extract token 
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "")

        //if token missing-> return response
        if(!token) {
            return res.status(401).json({
                success:false,
                message: "Token is missing"
            })
        }

        //if token available-> verify it
        try{
            const decode = await jwt.verify(token, process.env.JWT_SECRET)
            console.log(decode)
            req.user = decode
        }
        catch(error) {
            //verification issue
            return res.status(401).json({
                success:false,
                message: "Token is Invalid"
            })
        }

        next()
    }
    catch(error) {
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validatingt token"
        })
    }

}

//isStudent 
exports.isStudent = async(req,res, next) => {
    try{
        if(req.user.accountType !== "Student")
        {
            return res.status(401).json({
                success:false,
                message:"This is protected route for Students only"
            })
        }
        next()
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"User role can not be verified"
        })
    }
}

//isInstructor
exports.isInstructor = async(req,res, next) => {
    try{
        if(req.user.accountType !== "Instructor")
        {
            return res.status(401).json({
                success:false,
                message:"This is protected route for Instructor only"
            })
        }
        next()
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"User role can not be verified"
        })
    }
}

//isAdmin
exports.isAdmin = async(req,res, next) => {
    try{
        if(req.user.accountType !== "Admin")
        {
            return res.status(401).json({
                success:false,
                message:"This is protected route for Admin only"
            })
        }
        next()
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"User role can not be verified"
        })
    }
}
