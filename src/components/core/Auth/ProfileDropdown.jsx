import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { logout } from "../../../services/operations/authAPI";
import { Link } from "react-router-dom";
import useOnClickOutside from "../../../hooks/useOnClickOutside";

const ProfileDropdown = () => {
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setopen] = useState(false);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setopen(false))

  if (!user) return null;

  return (
    <button className="relative" onClick={() => setopen(true)}>

      <div className="flex items-center gap-x-1">
        <img
          src={user?.image}
          alt="profile"
          className="aspect-square w-[30px] rounded-full object-cover"
        />

        <AiOutlineCaretDown className="text-sm text-richblack-100" />
      </div>

      {/* dropdown */}
      {
        open && (
          <div onClick={(e) => e.stopPropagation()}
          className="absolute top-[118%] right-0 z-[1000] dividedivide-y-[1px] divide-richblack-700 overflow-hidden rounded-md border-[1px] border-richblack-700 bg-richblack-800"
          ref={ref}>

            <Link to="/dashboard/my-profile" onClick={() => {setopen(false)}}>

              <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25">
              <VscDashboard className="text-lg" />
              Dashboard
              </div>

            </Link>

            <div
            onClick={() => {
              dispatch(logout(navigate))
              setopen(false)
            }}
            className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25"
          >
            <VscSignOut className="text-lg" />
            Logout
          </div>

          </div>
        )
      }
    </button>
  );
};

export default ProfileDropdown;
