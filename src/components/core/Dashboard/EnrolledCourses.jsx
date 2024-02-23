import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getUserEnrolledCourses } from '../../../services/operations/profileAPI'
import ProgressBar from '@ramonak/react-progress-bar'

const EnrolledCourses = () => {

    const {token} = useSelector(state => state.auth)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [enrolledCourses, setEnrolledCourses] = useState(null)

    const getEnrolledCourses = async() => {
      try {
        const response = await getUserEnrolledCourses(token)
        setEnrolledCourses(response)
      }
      catch(error) {
        console.log("Unable to fetch enrolled courses")
      }
    }

    useEffect(() => {
      getEnrolledCourses()
    },[])


  return (
    <div className='text-white '>
        <div>Enrolled Courses</div>
        {
          !enrolledCourses 
          ? (
            <div className='spinner'></div>
          )
          :(
            !enrolledCourses.length ? (
              <p>You have not enrolled in any course</p>
            ) 
            : (
              <div>

                <div>
                  <p>Course Name</p>
                  <p>Duration</p>
                  <p>Progress</p>
                </div>

                {/* cards */}
                {
                  enrolledCourses.map((course, index) => {
                    <div>

                      {/* left */}
                      <div>
                        <img src={course.thumbnail}/>
                        <div>
                          <p>{course.courseName}</p>
                          <p>{course.description}</p>
                        </div>
                      </div>

                      <div>
                        {course?.totalDuration}
                      </div>

                      <div>
                        <p>Progress: {course.percentageProgress || 0}%</p>
                        <ProgressBar
                          completed={course.progressPercentage || 0}
                          height="8px"
                          isLabelVisible = {false}
                        />
                      </div>
                    </div>
                  })
                }
              </div>
            )
          )
        }
    </div>
  )
}

export default EnrolledCourses