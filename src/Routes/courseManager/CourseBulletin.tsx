import { Popover, PopoverTrigger } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { globalCurrentState } from "../../atoms";
import { BsPencilSquare } from "react-icons/bs";
import {
  CourseBulletinAllPosts,
  CourseBulletinPopOver,
  CourseBulletinPagination,
} from "../../Components";
import {
  Wrapper,
  BulletinPostBtn,
  PostButton,
} from "../../assets/wrappers/CourseBulletin";

interface ICourseBulletin {
  id: any;
}

const CourseBulletin = ({ id }: ICourseBulletin) => {
  const { bulletinNumOfPages } = useRecoilValue(globalCurrentState);

  return (
    <Wrapper>
      <PostButton>
        <Popover closeOnBlur={false} closeOnEsc={false}>
          <PopoverTrigger>
            <BulletinPostBtn type="button" className="btn">
              <BsPencilSquare />
            </BulletinPostBtn>
          </PopoverTrigger>
          <CourseBulletinPopOver id={id} />
        </Popover>
      </PostButton>
      <CourseBulletinAllPosts id={id} />
      {bulletinNumOfPages > 1 && <CourseBulletinPagination />}
    </Wrapper>
  );
};

export default CourseBulletin;
