import { createContext, useContext, useState, useEffect } from "react";

import { Button } from "@radix-ui/themes";
import { Plus } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import PostTable from "../PostTable";
import styles from "./Landing.module.scss";

export interface Post {
  id: string;
  className: string;
  title: string;
  semester: string;
  comment: string;
  imageUrl: string;
  status: string;
}

export const PostsContext = createContext<{
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}>({ posts: [], setPosts: () => {} });

export function usePosts() {
  return useContext(PostsContext);
}

export default function Landing() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      className: "CS101",
      semester: "Fall 2024",
      title: "Join CS101!",
      comment: "Excited!",
      imageUrl: "https://example.com/image.jpg",
      status: "Posted",
    },
    {
      id: "2",
      className: "EECS126",
      semester: "Spring 2025",
      title: "Join EECS126!",
      comment: "Tough but worth it!",
      imageUrl: "https://example.com/eecs126.jpg",
      status: "Scheduled",
    },
    {
      id: "3",
      className: "EECS127",
      semester: "Spring 2025",
      title:
        "Join EECS127!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
      comment: "Tough but worth it!",
      imageUrl: "https://example.com/eecs126.jpg",
      status: "Draft",
    },
  ]);

  const handleNewPostClick = () => {
    console.log("NEW POST");
    navigate("/add-post"); // Navigate to the Add Post page
  };

  useEffect(() => {
    console.log("Current posts:", posts);
  }, [posts]);

  return (
    <PostsContext.Provider value={{ posts, setPosts }}>
      <div className={styles.root}>
        <Button className={styles.add} onClick={() => handleNewPostClick()}>
          <Plus />
          New Post
        </Button>
        <PostTable />
      </div>
    </PostsContext.Provider>
  );
}
