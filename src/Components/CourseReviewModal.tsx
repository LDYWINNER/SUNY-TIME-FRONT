import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Checkbox,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { Alert } from "../Components";
import {
  Wrapper,
  Button,
  FormRow,
  Row,
  Footer,
  StarRating,
} from "../assets/wrappers/CourseReviewModal";
// import logo from "../assets/images/navbar_logo.svg";
import { useForm, SubmitHandler } from "react-hook-form";
import { authFetch } from "../api";
import { BsQuestionCircleFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  courseReviewInstructorState,
  currentCourseState,
  globalCurrentState,
  isDarkAtom,
} from "../atoms";
import { useNavigate } from "react-router-dom";
import {
  addUserToLocalStorage,
  amsInstructors,
  accbusInstructors,
  cseInstructors,
  eseInstructors,
  estempInstructors,
  mecInstructors,
} from "../utils";

interface ICourseReviewModal {
  id: any;
  isOpen: boolean;
  onClose: () => void;
}

interface IForm {
  semester: string;
  instructor: string;
  myLetterGrade: string;
  overallGrade: number;
  difficulty: string;
  homeworkQuantity: string;
  testQuantity: number;
  teamProjectPresence: boolean;
  quizPresence: boolean;
  overallEvaluation: string;
  anonymity: boolean;
}

interface IRegisterState {
  formSuccess: Boolean | null;
  errorMessage: string;
}

const registerState: IRegisterState = {
  formSuccess: null,
  errorMessage: "",
};

function CourseReviewModal({ id, isOpen, onClose }: ICourseReviewModal) {
  const toast = useToast();
  const navigate = useNavigate();
  const [globalState, setGlobalCurrentState] =
    useRecoilState(globalCurrentState);
  const [values, setValues] = useState(registerState);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [difficultyItems, setdifficultyItems] = useState([false, false, false]);
  const [hwQuantityItems, sethwQuantityItems] = useState([false, false, false]);
  const [testQuantityItems, setTestQuantityItems] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [teamProjectPresence, setTeamProjectPresence] = useState([
    false,
    false,
  ]);
  const [quizPresence, setQuizPresence] = useState([false, false]);
  const { register, handleSubmit, reset } = useForm<IForm>({
    defaultValues: {
      anonymity: true,
      semester: "-1",
      instructor: "-2",
      myLetterGrade: "-1",
      overallGrade: undefined,
      difficulty: "",
      homeworkQuantity: "",
      testQuantity: undefined,
      teamProjectPresence: undefined,
      quizPresence: undefined,
      overallEvaluation: "",
    },
  });
  const isDark = useRecoilValue(isDarkAtom);
  const instructor = useRecoilValue(courseReviewInstructorState);
  const { subj } = useRecoilValue(currentCourseState);
  const courseSubjSearchFilter = localStorage.getItem("courseSubjSearchFilter");

  const onValid: SubmitHandler<IForm> = async (data) => {
    const newCourseReview = {
      semester: data.semester,
      instructor: data.instructor,
      overallGrade: rating,
      difficulty: difficultyItems[0]
        ? "difficult"
        : difficultyItems[1]
        ? "soso"
        : difficultyItems[2]
        ? "easy"
        : undefined,
      homeworkQuantity: hwQuantityItems[0]
        ? "many"
        : hwQuantityItems[1]
        ? "soso"
        : hwQuantityItems[2]
        ? "few"
        : undefined,
      testQuantity: testQuantityItems[0]
        ? 0
        : testQuantityItems[1]
        ? 1
        : testQuantityItems[2]
        ? 2
        : testQuantityItems[3]
        ? 3
        : testQuantityItems[4]
        ? 4
        : undefined,
      teamProjectPresence: teamProjectPresence[0]
        ? true
        : teamProjectPresence[1]
        ? false
        : undefined,
      quizPresence: quizPresence[0]
        ? true
        : quizPresence[1]
        ? false
        : undefined,
      overallEvaluation: data.overallEvaluation,
      anonymity: data.anonymity,
      myLetterGrade: data.myLetterGrade,
    };
    // console.log(newCourseReview);

    try {
      const { data } = await authFetch.post(`course/${id}`, newCourseReview);
      // console.log(data);

      setValues({ ...values, formSuccess: true });
      setTimeout(async () => {
        //clear alert
        setValues({
          ...values,
          formSuccess: null,
          errorMessage: "",
        });
        //close modal & refresh page
        onClose();
        const { data } = await authFetch.patch("course/updateUserCourseNum");
        // console.log(data);

        if (globalState.user.courseReviewNum > 2) {
          window.location.reload();
        }

        const { user, token } = data;
        setGlobalCurrentState((currentState) => {
          return {
            ...currentState,
            token,
            user,
          };
        });
        //adding user to local storage
        addUserToLocalStorage({ user, token });

        if (globalState.user.courseReviewNum < 2) {
          localStorage.setItem("coursemanger-access", "false");
          navigate("/course-review");
        } else if (Number(globalState.user.courseReviewNum) === 2) {
          localStorage.setItem("coursemanger-access", "null");
          navigate("/");
          toast({
            title: "Register Process Successfully Done!",
            description: "Thank you. Enjoy SUNYTIME :)",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
        }
      }, 3000);
    } catch (error: any) {
      // console.log(error);
      if (error.response.status !== 401) {
        setValues({
          ...values,
          formSuccess: false,
          errorMessage: error.response.data.msg,
        });
      }
      //clear alert
      setTimeout(() => {
        setValues({
          ...values,
          formSuccess: null,
          errorMessage: "",
        });
      }, 3000);
    }
  };

  useEffect(() => {
    if (values.formSuccess) {
      reset({
        semester: "-1",
        instructor: "-2",
        overallEvaluation: "",
      });
      setRating(0);
      setHover(0);
      setdifficultyItems([false, false, false]);
      sethwQuantityItems([false, false, false]);
      setTestQuantityItems([false, false, false, false, false]);
      setTeamProjectPresence([false, false]);
      setQuizPresence([false, false]);
    }
  }, [reset, values.formSuccess]);

  return (
    <>
      <Modal
        blockScrollOnMount={false}
        scrollBehavior="outside"
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <Wrapper>
            <form onSubmit={handleSubmit(onValid)}>
              <ModalCloseButton color={isDark ? "white" : "black"} />
              <ModalBody>
                {/* <Logo src={logo} alt="sunytime" className="logo" /> */}

                {values.formSuccess === true && (
                  <Alert message="Course Review Registered!" ifSuccess={true} />
                )}

                {values.formSuccess === false && (
                  <Alert message={values.errorMessage} />
                )}

                <label htmlFor="semester" className="form-label">
                  수강학기 & 교수님
                </label>
                <select
                  {...register("semester", { required: true })}
                  defaultValue="-1"
                  style={{ width: "50%" }}
                >
                  <option value="-1" disabled>
                    수강학기
                  </option>
                  <option value="2023-spring">2023 Spring</option>
                  <option value="2022-fall">2022 Fall</option>
                  <option value="2022-spring">2022 Spring</option>
                  <option value="2021-fall">2021 Fall</option>
                  <option value="2021-spring">2021 Spring</option>
                  <option value="2020-fall">2020 Fall</option>
                  <option value="2020-spring">2020 Spring</option>
                </select>
                <select
                  {...register("instructor", { required: true })}
                  defaultValue="-2"
                  style={{ width: "50%" }}
                >
                  <>
                    <option value="-2" disabled>
                      교수님
                    </option>
                    {courseSubjSearchFilter === "AMS" || subj === "MAT" ? (
                      amsInstructors.map((instructor) => (
                        <option key={instructor} value={instructor}>
                          {instructor}
                        </option>
                      ))
                    ) : courseSubjSearchFilter === "ACC/BUS" ? (
                      accbusInstructors.map((instructor) => (
                        <option key={instructor} value={instructor}>
                          {instructor}
                        </option>
                      ))
                    ) : courseSubjSearchFilter === "CSE" ? (
                      cseInstructors.map((instructor) => (
                        <option key={instructor} value={instructor}>
                          {instructor}
                        </option>
                      ))
                    ) : courseSubjSearchFilter === "ESE" ? (
                      eseInstructors.map((instructor) => (
                        <option key={instructor} value={instructor}>
                          {instructor}
                        </option>
                      ))
                    ) : courseSubjSearchFilter === "EST/EMP" ? (
                      estempInstructors.map((instructor) => (
                        <option key={instructor} value={instructor}>
                          {instructor}
                        </option>
                      ))
                    ) : courseSubjSearchFilter === "MEC" ? (
                      mecInstructors.map((instructor) => (
                        <option key={instructor} value={instructor}>
                          {instructor}
                        </option>
                      ))
                    ) : instructor.instructorNum === 1 ? (
                      <>
                        <option
                          key={instructor.instructorName[0]}
                          value={instructor.instructorName[0]}
                        >
                          {instructor.instructorName[0]}
                        </option>
                      </>
                    ) : (
                      <>
                        <option
                          key={instructor.instructorName[0]}
                          value={instructor.instructorName[0]}
                        >
                          {instructor.instructorName[0]}
                        </option>
                        <option
                          key={instructor.instructorName[1]}
                          value={instructor.instructorName[1]}
                        >
                          {instructor.instructorName[1]}
                        </option>{" "}
                      </>
                    )}
                  </>
                </select>

                <FormRow>
                  <div>
                    <label htmlFor="myLetterGrade" className="form-label">
                      받은 Letter grade (선택)
                    </label>
                    <select {...register("myLetterGrade")} defaultValue="-1">
                      <option value="-1" disabled>
                        받은 Letter grade
                      </option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="B-">B-</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="C-">C-</option>
                      <option value="D+">D+</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                      <option value="I">I</option>
                      <option value="W">W</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">총 별점</label>
                    <StarRating>
                      {[...Array(5)].map((star, index) => {
                        index += 1;
                        return (
                          <button
                            type="button"
                            key={index}
                            className={
                              isDark
                                ? index <= (hover || rating)
                                  ? "dark-on"
                                  : "off"
                                : index <= (hover || rating)
                                ? "on"
                                : "off"
                            }
                            onClick={() => setRating(index)}
                            onMouseEnter={() => setHover(index)}
                            onMouseLeave={() => setHover(rating)}
                          >
                            <span className="star">&#9733;</span>
                          </button>
                        );
                      })}
                    </StarRating>
                  </div>
                </FormRow>

                <label className="form-label">난이도</label>
                <Row>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={difficultyItems[0]}
                    fontWeight={400}
                    onChange={(e) =>
                      setdifficultyItems([e.target.checked, false, false])
                    }
                  >
                    어려움
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={difficultyItems[1]}
                    fontWeight={400}
                    onChange={(e) =>
                      setdifficultyItems([false, e.target.checked, false])
                    }
                  >
                    중간
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={difficultyItems[2]}
                    fontWeight={400}
                    onChange={(e) =>
                      setdifficultyItems([false, false, e.target.checked])
                    }
                  >
                    쉬움
                  </Checkbox>
                </Row>

                <label className="form-label">시험 개수(미드텀 & 파이널)</label>
                <Row>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={testQuantityItems[0]}
                    onChange={(e) =>
                      setTestQuantityItems([
                        e.target.checked,
                        false,
                        false,
                        false,
                        false,
                      ])
                    }
                  >
                    0
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={testQuantityItems[1]}
                    onChange={(e) =>
                      setTestQuantityItems([
                        false,
                        e.target.checked,
                        false,
                        false,
                        false,
                      ])
                    }
                  >
                    1
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={testQuantityItems[2]}
                    onChange={(e) =>
                      setTestQuantityItems([
                        false,
                        false,
                        e.target.checked,
                        false,
                        false,
                      ])
                    }
                  >
                    2
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={testQuantityItems[3]}
                    onChange={(e) =>
                      setTestQuantityItems([
                        false,
                        false,
                        false,
                        e.target.checked,
                        false,
                      ])
                    }
                  >
                    3
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={testQuantityItems[4]}
                    onChange={(e) =>
                      setTestQuantityItems([
                        false,
                        false,
                        false,
                        false,
                        e.target.checked,
                      ])
                    }
                  >
                    4
                  </Checkbox>
                </Row>

                <label className="form-label">과제량</label>
                <Row>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={hwQuantityItems[0]}
                    fontWeight={400}
                    onChange={(e) =>
                      sethwQuantityItems([e.target.checked, false, false])
                    }
                  >
                    많음
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={hwQuantityItems[1]}
                    fontWeight={400}
                    onChange={(e) =>
                      sethwQuantityItems([false, e.target.checked, false])
                    }
                  >
                    보통
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={hwQuantityItems[2]}
                    fontWeight={400}
                    onChange={(e) =>
                      sethwQuantityItems([false, false, e.target.checked])
                    }
                  >
                    적음
                  </Checkbox>
                </Row>

                <label className="form-label">팀플 유무</label>
                <Row>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={teamProjectPresence[0]}
                    fontWeight={400}
                    onChange={(e) =>
                      setTeamProjectPresence([e.target.checked, false])
                    }
                  >
                    있음
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={teamProjectPresence[1]}
                    fontWeight={400}
                    onChange={(e) =>
                      setTeamProjectPresence([false, e.target.checked])
                    }
                  >
                    없음
                  </Checkbox>
                </Row>

                <label className="form-label">퀴즈 유무</label>
                <Row>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={quizPresence[0]}
                    fontWeight={400}
                    onChange={(e) => setQuizPresence([e.target.checked, false])}
                  >
                    있음
                  </Checkbox>
                  <Checkbox
                    borderColor={isDark ? "white" : "black"}
                    isChecked={quizPresence[1]}
                    fontWeight={400}
                    onChange={(e) => setQuizPresence([false, e.target.checked])}
                  >
                    없음
                  </Checkbox>
                </Row>

                <div className="form-row">
                  <Row>
                    <label htmlFor="overallEvaluation" className="form-label">
                      총평
                    </label>
                    <Tooltip
                      hasArrow
                      label={
                        <>
                          <p>
                            수강학기, 교수명, 별점, 난이도, 시험 횟수, 과제량,
                            조별과제 유무, 퀴즈 유무는 필수 사항입니다.
                          </p>
                          <br />
                          <p>
                            총평에는 과목에 대한 총평을 남겨주시면
                            감사하겠습니다 (점수를 잘 받기 위한 꿀팁, 무엇을
                            배우는지, 교수님에 대한 코멘트, 출석체크 방법 등).
                          </p>
                        </>
                      }
                    >
                      <span className="tooltip-icon">
                        <BsQuestionCircleFill />
                      </span>
                    </Tooltip>
                  </Row>
                  <textarea
                    cols={30}
                    className="form-input"
                    {...register("overallEvaluation")}
                    placeholder="코스 총평"
                  ></textarea>
                </div>
              </ModalBody>
              <ModalFooter>
                <Footer>
                  <div className="checkbox-div">
                    <input
                      type="checkbox"
                      {...register("anonymity")}
                      id="anonymity"
                      className="anonymity-checkbox"
                    />
                    <label htmlFor="anonymity">익명</label>
                  </div>
                  <Button type="submit">저장</Button>
                </Footer>
              </ModalFooter>
            </form>
          </Wrapper>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CourseReviewModal;
