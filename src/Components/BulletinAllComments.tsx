import { Wrapper, Comment } from "../assets/wrappers/BulletinAllComments";
import { IPostComment } from "../interfaces";

interface IBulletinAllComments {
  comments: [IPostComment];
}

function BulletinAllComments({ comments }: IBulletinAllComments) {
  return (
    <Wrapper>
      {comments.map((comment: IPostComment) => {
        return (
          <Comment>
            <h4>{comment.content}</h4>
            <h4>{comment.likes.length}</h4>
            <h4>{comment.createdBy}</h4>
            <h4>{comment.createdAt}</h4>
          </Comment>
        );
      })}
    </Wrapper>
  );
}
export default BulletinAllComments;
