const express = require("express");
const Category = require("../models/Category");

//create category handler
exports.createCategory = async (req, res) => {
  try {
    //fetch data
    const { name, description } = req.body;
    console.log(name, description)

    //validate data
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //make entry in db
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetails);

    //return response
    return res.status(200).json({
      success: true,
      message: "category created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//fetch all Categories handler
exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({}, { name: true, description: true });

    console.log("allCategories", allCategories)

    res.status(200).json({
      success: true,
      message: "All Categories returned successfully",
      data: allCategories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    //get category id
    const categoryId = req.body;

    //get courses for specified category id
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    //validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    //get courses for different categories
    const differentCategories = await Category.findById({
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();

    //TODO: get top 10 selling courses

    //return response
    return res.status(200).json({
        success:true,
        data: {
            selectedCategory,
            differentCategories
        }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
        success:false,
        error: error.message
    })
  }
};
