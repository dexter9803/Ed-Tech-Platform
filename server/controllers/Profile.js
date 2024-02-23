const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


//update profile handler
exports.updateProfile = async (req, res) => {
  try {
    //fetch data
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body

    //get userId
    const id = req.user.id;

    //validation
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //find profile
    const userDetails = await User.findById(id);
    const profileId = await userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    //update main user
    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    })

    //update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.gender = gender;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;

    //already object created -> use save() method to make entry in db
    await profileDetails.save();

    const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec()

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile updation failed",
      error: error.message,
    });
  }
};


//update display picture (DP)
exports.updateDisplayPicture = async(req,res) => {
  try{
    // fetch data
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    console.log(displayPicture)

    //upload image to cloudinary 
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log("ProfilePic: ", image)

    //update image in db
    const updatedProfile = await User.findByIdAndUpdate(
      {_id: userId},
      {image: image.secure_url},
      {new:true}
    )

    //return response
     return res.status(200).json({
      success: true,
      message: "Profile Picture upadted successfully",
      data: updatedProfile
    })
   
    
  }
  catch(error) {
    return res.status(500).json({
      success: false,
      msg: "this is from catch",
      message: error.message,
    })
  }
}


//delete profile handler
exports.deleteAccount = async(req,res) => {
    try{
        //fetch profileId
        const id = req.user.id

        //validation
        const userDetails = await User.findById(id)

        if(!userDetails) {
            return res.status(400).json({
                success:falsee,
                message: "User not found"
            })
        }

        //delete profile (additionalDetails)
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})

        //delete user
        await User.findByIdAndDelete({_id:id})

        //TODO: unenroll user from all enroller courses

        //return response
        return res.status(200).json({
            success:true,
            message: "User deleted successfully"
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message: "Account deletion failed",
            error: error.message
        })
    }
}


//get user details 
exports.getAllUserDetails = async(req,res) => {
    try{
        //fetch id
        const id = req.user.id

        //fetch data
        const userDetails = await User.findById(id).populate("additionalDetails").exec()

        //return response
        return res.status(200).json({
            success:true,
            message: "User details fetched successfully",
            data: userDetails
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message: "User details fetching failed",
            error: error.message
        })
    }
}

//get enrolled courses details
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}