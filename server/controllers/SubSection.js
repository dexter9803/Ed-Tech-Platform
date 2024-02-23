const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
  try {
    //fetch data
    const { title, timeDuration, description, sectionId } = req.body;

    //fetch video from req.files
    const video = req.files.videoFile;
    console.log("Printing Video", video)

    //validate data
    if (!title || !timeDuration || !description || !sectionId || !video) {
      return res.status(400).json({
        success: false,
        message: "All field are required",
      });
    }

    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    //create Subsection entry in db
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    //update section with subsection objectId
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: SubSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection");

    //return response
    return res.status(200).json({
      success: true,
      message: "Sub Section Created Successfully",
      updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//updateSubSection handler
exports.updateSubSection = async (req, res) => {
  try {
    //fetch data
    const { sectionId, subSectionId, title, description, timeDuration } =
      req.body;

    //fetch video
    const video = req.files.video;

    //check if subSection of given id is present in db or not?
    const subSection = await SubSection.findById(subSectionId);

    //validate data
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (!title || !description || !timeDuration || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    //update subsection in db
    const updatedSubSection = await SubSection.findByIdAndUpdate(
      subSectionId,
      {
        title: title,
        description: description,
        timeDuration: timeDuration,
        videoUrl: uploadDetails.secure_url,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "SubSection updated successfully",
      data: updatedSubSection
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};

//deleteSubSection handler
exports.deleteSubSection = async (req, res) => {
  try {
    //fetch data
    const { subSectionId, sectionId } = req.body;

    //delete subsection
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId });

    //if subsection not found
    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    //if subsection exists -> update section also
    const updatedSection = await Section.findByIdAndUpdate(
        {
            _id: sectionId
        },
        {
            $pull: {
                subSection: subSectionId
            }
        },
        {new: true}
    ).populate("subSection")

    //return response
    return res.json({
        success: true,
        message: "SubSection deleted successfully",
        data: updatedSection,
    })

  } catch(error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
};
