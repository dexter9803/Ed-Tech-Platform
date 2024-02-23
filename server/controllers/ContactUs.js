const { contactUsEmail } = require("../templates/contactFormRes");
const mailSender = require("../utils/mailSender");

exports.contactUsController = async (req, res) => {
  //get data
  const { email, firstname, lastname, message, phoneNo, countrycode } =
    req.body;

  try {
    //send mail to the user
    const emailRes = await mailSender(
      email,
      "Your data send successfully",
      contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
    );

    console.log("EmailResponse: ", emailRes);

    //send mail to yourself
    const emailToYou = mailSender(
      "prashantmahamuni18@gmail.com",
      `Message from user ${firstname} ${lastname}`,
      `<h1>User details: </h1>
        <p>${firstname} ${lastname}</p>
        <p>${email}</p>
        <p>${phoneNo}</p>
        <h2>Message: ${message}</h2>`
    );

    //return response
    return res.status(200).json({
      success: true,
      message: "Email sent succssfully",
    });
  } 
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while sending message",
    });
  }
};
