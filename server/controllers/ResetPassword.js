const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto")

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    //fetch email from req.body
    const email = req.body.email;
    console.log("EMAIL: ", email)

    //validate email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "Your email is not registered with us",
      });
    }

    //create token
    const token = crypto.randomBytes(20).toString("hex")

    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    console.log("User after reset link sent and token generated", updatedDetails)

    //create url
    const url = `http://localhost:3000/update-password/${token}`;

    //send mail containing url
    const mailResponse = await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link: <a href=${url}>Cick here</a>`
    );

    console.log("This is mailresponse", mailResponse)

    //return response
    return res.json({
      success: true,
      message: "Password Reset email send successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while reseting password 1",
    });
  }
};



//resetPassword
exports.resetPassword = async (req, res) => {
  try {
    //fetch data
    const { password, confirmPassword, token } = req.body; //frontend puts token in request body

    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: true,
        message: "Password did not match",
      });
    }

    //get userDetails from db using token
    const userDetails = User.findOne({ token: token });
    console.log("Found User: ", userDetails)

    //if no entry found -> invalid token || token expires
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Invalid Token",
      });
    }

    //check if token expires
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token is expired please regenerate it",
      });
    }

    //password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    //update password in db
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    ).exec()
    console.log("Updated User:" ,User)

    //return response
    return res.json({
      success: true,
      message: "Password reset successfull",
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
        success:false,
        message: "Error in reseting password"
    })
  }
};
