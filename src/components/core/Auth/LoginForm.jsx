import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import { login } from "../../../services/operations/authAPI"

function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    dispatch(login(email, password, navigate))
  }

  return (
    <form
      onSubmit={handleOnSubmit}
      className="mt-6 flex w-full flex-col gap-y-4"
    >
             <label className='w-full '>
            <p className='text-[0.875rem] text-richblack-5 leading-[1.375rem] mb-1
            '>Email Address<sup className='text-pink-200'>*</sup></p>
            
            <input
            required
            type='email'
            name='email'
            value={formData.email}
            onChange={handleOnChange}
            placeholder='Enter email address'
            className='bg-richblack-800 rounded-[0.5rem] text-richblack-5 w-full p-[12px]   border-richblack-700 border-b-[2px]'
            />
        </label>

        <label className='relative'>
            <p className='text-[0.875rem] text-richblack-5 leading-[1.375rem] mb-1
            '>Password<sup className='text-pink-200'>*</sup></p>
            <input
            required
            type={showPassword ? ("text") : ("password")}
            name='password'
            value={formData.password}
            onChange={handleOnChange}
            placeholder='Enter Password'
            className='bg-richblack-800 rounded-[0.5rem] text-richblack-5 w-full p-[12px]   border-richblack-700 border-b-[2px]'
            />
            <span 
            className='absolute right-3 top-[38px] cursor-pointer '
            onClick={() => {
                setShowPassword((prev) => {
                    return (!prev)
                })
                }}>
                {showPassword ? (<AiOutlineEyeInvisible fontSize={24} fill='#AFB2BF'/>) : (<AiOutlineEye fontSize={24} fill='#AFB2BF'/>)}
            </span>

            <Link to="/forgot-password">
                <p className='text-xs mt-1 max-w-max text-blue-100 ml-auto'>Forgot Password</p>
            </Link>

        </label>

        <button className='bg-yellow-50 rounded-[8px] font-medium text-richblack-900 px-[12px] py-[8px] mt-6'>Sign In</button>
    </form>
  )
}

export default LoginForm