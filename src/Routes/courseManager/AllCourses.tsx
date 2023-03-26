import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { authFetch } from "../../api";
import {
  Wrapper,
  Main,
  MainContent,
  SubContent,
  FilterRow,
  TitleRow,
  Title,
  Courses,
  Course,
  Container,
} from "../../assets/wrappers/AllCourses";
import { courseSearchState, globalCurrentState } from "../../atoms";
import { CourseSearch, CoursePagination } from "../../Components";
import { Loading } from "../../Components";
import { removeUserFromLocalStorage } from "../../utils";

interface ICourseReview {
  course: string;
  semester: string;
  homeworkQuantity: string;
  teamProjectPresence: boolean;
  difficulty: string;
  testQuantity: number;
  quizPresence: boolean;
  overallGrade: number;
  overallEvaluation: string;
  createdBy: string;
  createdByUsername: string;
  anonymity: boolean;
  likes: [string];
}

interface ICourse {
  _id: string;
  semester: [string];
  classNbr: number;
  subj: string;
  crs: number;
  courseTitle: string;
  sbc: string;
  cmp: string;
  sctn: string;
  credits: number;
  day: string;
  startTime: Date;
  endTime: Date;
  room: string;
  instructor: string;
  likes: [string];
  reviews: [ICourseReview];
}

const AllCourses = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [globalState, setGlobalCurrentState] =
    useRecoilState(globalCurrentState);
  const { courseNumOfPages } = useRecoilValue(globalCurrentState);
  const { courseSubjFilter, searchKeyword } = useRecoilValue(courseSearchState);

  const logoutUser = useCallback(() => {
    setGlobalCurrentState((currentState) => {
      return {
        ...currentState,
        user: null,
        token: null,
      };
    });
    removeUserFromLocalStorage();
    window.location.reload();
  }, [setGlobalCurrentState]);

  //getting the posts
  const getCourse = useCallback(async () => {
    let url = `course?page=${globalState.coursePage}&subj=${courseSubjFilter}`;

    if (searchKeyword) {
      url = url + `&search=${searchKeyword}`;
    }

    setIsLoading(true);
    try {
      const { data } = await authFetch(url);
      const { allCourses, totalCourses, courseNumOfPages } = data;
      setGlobalCurrentState((currentState) => {
        return {
          ...currentState,
          allCourses,
          totalCourses,
          courseNumOfPages,
        };
      });
      console.log(data);

      setIsLoading(false);
    } catch (error: any) {
      console.log(error.response);
      // log user out
      logoutUser();
    }
  }, [
    globalState.coursePage,
    courseSubjFilter,
    logoutUser,
    searchKeyword,
    setGlobalCurrentState,
  ]);

  useEffect(() => {
    getCourse();
  }, [getCourse, courseSubjFilter, searchKeyword, globalState.coursePage]);

  return (
    <Wrapper>
      <Main>
        <MainContent>
          <FilterRow>
            <CourseSearch />
          </FilterRow>
          <TitleRow>
            <Title>
              {courseSubjFilter === "SHCourse"
                ? "Faculty of Sciences and Humanities Courses"
                : courseSubjFilter}{" "}
              Courses
            </Title>
          </TitleRow>
          {isLoading && <Loading center />}
          <Courses>
            {globalState.allCourses.map((course: ICourse) => {
              return (
                <Course key={course._id}>
                  <Link
                    to={`/course-manager/${course._id}`}
                    state={{ id: course._id }}
                  >
                    <Container>
                      <h4>{course.courseTitle}</h4>
                    </Container>
                  </Link>
                </Course>
              );
            })}
          </Courses>
          {courseNumOfPages > 1 && <CoursePagination />}
        </MainContent>
        <SubContent></SubContent>
      </Main>
    </Wrapper>
  );
};
export default AllCourses;
