const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");

//createRating
exports.createRating = async (req, res) => {
  try {
    //get userID
    const userId = req.user.id;

    //fetch data from req.body
    const { rating, review, courseId } = req.body;

    //check if user enrolled or not?
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      res.status(404).json({
        success: false,
        message: "Student is not enrolled in course",
      });
    }

    //check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    //if already reviewed
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "User already reviewed the course ",
      });
    }

    //if not reviewed already -> create new review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    //add this review in course model
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );

    console.log(updatedCourseDetails);

    //return response
    return res.status(200).json({
      success: true,
      message: "Rating and Review created successfully",
      ratingReview,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getAverageRating for a course
exports.getAverageRating = async (req, res) => {
  try {
    //get courseId
    const courseId = req.body.courseId;

    //calculate avgRating
    const result = await RatingAndReview.aggregate(
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId), //here courseId is string converted into objectId
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      }
    );

    //retrun rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    //if no rating exist
    return res.status(200).json({
      success: true,
      message: "Average rating is 0, no ratings found",
      averageRating: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getAllRatingReviews
exports.getAllRatingReview = async (req, res) => {
  try {
    const allReviwes = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName"
      })
      .exec();

    return res.status(20).json({
        success:true,
        message: "All reviews fetched successfully",
        data:allReviwes
    })

  } 
  catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
