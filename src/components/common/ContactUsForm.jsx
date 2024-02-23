import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CountryCode from "../../data/countrycode.json";
import { apiConnector } from "../../services/apiConnector";
import { contactusEndpoint } from "../../services/apis";

const ContactUsForm = () => {
  const [loading, setloading] = useState(false);

  const submitContactForm = async (data) => {
    console.log("Logging Data", data);
    try {
      setloading(true);
      const response = await apiConnector(
        "POST",
        contactusEndpoint.CONTACT_US_API,
        data
      );
      console.log("Logging Response: ", response);
      setloading(false);
    } catch (error) {
      console.log("Error in ContactUsForm: ", error);
      setloading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        email: "",
        firstname: "",
        lastname: "",
        phoneNo: "",
      });
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <form
      onSubmit={handleSubmit(submitContactForm)}
      className="flex flex-col gap-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* firstname */}
        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="firstname" className="label-style">
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Enter first name"
            className="form-style"
            {...register("firstname", { required: true })}
          />
          {errors.firstname && (
            <span className="-mt-1 text-[12px] text-yellow-100">
              Please enter your first name
            </span>
          )}
        </div>

        {/* lastname */}
        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="lastname" className="label-style">
            Last Name
          </label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Enter last name"
            className="form-style"
            {...register("lastname", { required: true })}
          />
          {errors.firstname && (
            <span className="-mt-1 text-[12px] text-yellow-100">
              Please enter your last name
            </span>
          )}
        </div>
      </div>

      {/* phoneNo */}
      <div className="flex flex-col gap-2 ">
        <label htmlFor="phoneNumber" className="label-style">
          Phone Number
        </label>

        <div className="flex gap-5">

         {/* dropdown */}
          <div className="flex max-w-[10rem] flex-col gap-2 ">
            <select
              type="text"
              name="dropdown"
              id="dropdown"
              className="form-style"
              {...register("countrycode", { required: true })}
            >
              {CountryCode.map((element, index) => {
                return (
                  <option key={index} value={element.code}>
                    {element.code}-{element.country}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <input
                type="number"
                name="phonenumber"
                id="phonenumber"
                placeholder="12345 67890"
                className="form-style"
                {...register("phoneNo", {
                    required:{value:true, message:"Please enter phone number"},
                    maxLength: {value:10, message:"Invalid Phone Number"},
                    minLength: {value:8, message:"Invalid Phone Number"}
                })}
            />
          </div>
        </div>
        {
            errors.phoneNo && (
                <span className="-mt-1 text-[12px] text-yellow-100">{errors.phoneNo.message}</span>
            )
        }
      </div>

      {/* email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="lable-style">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter email address"
          className="form-style"
          {...register("email", { required: true })}
        />
        {errors.email && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            Please enter your Email address.
          </span>
        )}
      </div>

      {/* message */}
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="lable-style">
          Message
        </label>
        <textarea
          name="message"
          id="message"
          cols="30"
          rows="7"
          placeholder="Enter your message here"
          className="form-style resize-none"
          {...register("message", { required: true })}
        />
        {errors.message && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            Please enter your Message.
          </span>
        )}
      </div>

      {/* button */}
      <button
        disabled={loading}
        type="submit"
        className={`rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
         ${
           !loading &&
           "transition-all duration-200 hover:scale-95 hover:shadow-none"
         }  disabled:bg-richblack-500 sm:text-[16px] `}
      >
        Send Message
      </button>
    </form>
  );
};

export default ContactUsForm;
