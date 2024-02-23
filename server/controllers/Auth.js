const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();



//sendOTP
exports.sendotp = async (req, res) => {
  try {
    //fetch email from reqBody
    const { email } = req.body;

    //checl if user already exist
    const checkUserPresent = await User.findOne({ email });

    //if user exist already
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    //generateOTP (requires otp-generator)
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated: ", otp);

    //make sure OTP must be unique
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    //make entry in database
    const otpPayload = { email, otp };
    const optbody = await OTP.create(otpPayload);
    console.log(otpPayload);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



//signup
exports.signup = async (req, res) => {
  try {
    //data fetch from reqBody
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp,
    } = req.body;

    //validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //2 password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords does not match",
      });
    }

    //user exist already ?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    //find most recent otp for user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);

    //validate OTP
    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp[0].otp) {
      //invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)

    //create entry in db of user
    const profileDetails = await Profile.create({
      gender: null,
      contactNumber: null,
      about: null,
      dateOfBirth: null,
    });
    console.log(profileDetails)

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })
    console.log("user: ",user)

    res.status(200).json({
      success: true,
      message: "User is registered successfully",
      data: user
    });
  } 
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User can not be registered",
    });
  }
};



//login
exports.login = async (req, res) => {
  try {
    //fetch data from reqBody
    const { email, password } = req.body;

    //validation of data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    //user exist?
    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, Sign up first",
      });
    }

    //password match
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      //if password matches -> generate token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2hr",
      });



      //toObject
      user.token = token;
      user.password = undefined;

      console.log("Printing user:", user)

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), //3 days
        httpOnly: true,
      };

      //create cookie
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "LoggenIn successfully ",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

//TODO--->
//changepassword
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        `passwordUpdated
          ${updatedUserDetails.email},
          Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}
