import { useParams } from "react-router-dom";

export default function Post() {
  const { postId } = useParams();

  return (
    <>
      <h1>Post {postId}</h1>
    </>
  );
}
