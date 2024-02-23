import React, { useEffect, useState } from "react";
import { Link, matchPath } from "react-router-dom";
import logo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import ProfileDropdown from "../core/Auth/ProfileDropdown";
import { apiConnector } from "../../services/apiConnector";
import { categories } from "../../services/apis";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";


const Navbar = () => {
  //access date from store
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);

  const [subLinks, setSubLinks] = useState([])

  useEffect( () => {
    fetchSubLinks()
  },[])

  async function fetchSubLinks () {
    try{
      const result = await apiConnector("GET",categories.CATEGORIES_API)
      setSubLinks(result.data.data)
      // console.log("Printing Sublinks: ", result)
      console.log(result.data.data)
    }
    catch(error) {
      console.log("Could not fetch category list", error)
    }
  }


  //function to compare currentPath & route are the same or not?
  const location = useLocation();
  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };


  return (
    <div className="flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700">

      {/* container */}
      <div className="w-11/12 flex max-w-maxContent items-center justify-between ">

        {/* logo */}
        <Link to="/">
          <img src={logo} width={160} height={42} loading="lazy" alt="logo" />
        </Link>

        {/* NavLinks */}
        <nav>
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => {
              return (
                <li key={index}>
                  {link.title === "Catalog" ? (

                    <div className="relative flex items-center gap-2 group cursor-pointer">
                      <p>{link?.title}</p>
                      <MdOutlineKeyboardArrowDown />

                      {/* rectangle */}
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] w-[200px] flex flex-col rounded-md bg-richblack-800  text-richblack-50 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 lg:w-[250px] translate-x-[-50%] translate-y-[25%] group-hover:translate-y-[1.65em] py-2">

                        {/* triangle */}
                        <div className="absolute left-[56%] top-[-3px] h-8 w-8 rotate-45 rounded bg-richblack-800 z-[-1] select-none"></div>
                       {
                          subLinks.length ? (
                            
                              subLinks.map((subLink, index) => {
                                return (
                                  <Link className="rounded-lg bg-transparent py-2 pl-4 hover:bg-richblack-900 text-center" to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`} key={index}>
                                      <p>{subLink.name}</p>
                                  </Link>
                                )
                              })
                            
                          ) : (<div></div>) 
                        } 
                        
                        


                      </div>
                    </div>

                  ) : (
                    <Link to={link?.path}>
                      <p
                        className={`${
                          matchRoute(link?.path)
                            ? "text-yellow-25"
                            : "text-richblack-25"
                        }`}
                      >
                        {link.title}
                      </p>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* login/signup/dashboard */}
        <div className="flex gap-x-4 items-center">
          {user && user?.accountType != "Instructor" && (

            <Link to={"/dashboard/cart"} className="relative">
              <AiOutlineShoppingCart />
              {
                totalItems > 0 && 
                <span>{totalItems}</span>
              }
            </Link>

          )}

          {
            token === null && (
              <Link to={"/login"}>
                <button className="text-richblack-100 border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] rounded-md ">Login</button>
              </Link>
            )
          }

          {
            token === null && (
              <Link to={"/signup"}>
                <button className="text-richblack-100 border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] rounded-md ">Sign Up</button>
              </Link>
            )
          }

          {
            token !== null && (
              <ProfileDropdown/>
            )
          }
        </div>


      </div>
    </div>
  );
};

export default Navbar;
