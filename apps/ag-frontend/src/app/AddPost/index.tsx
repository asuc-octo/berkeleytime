import { useEffect, useState } from "react";
// import { useReadTerms } from "@hooks/api";
// Adjust the import path

import {
  Box,
  Button,
  DataList,
  DropdownMenu,
  Flex,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useLocation, useNavigate } from "react-router-dom";

import { usePosts } from "../Landing";
import { Post } from "../Landing";
import styles from "./AddPost.module.scss";

// Placeholder types for terms and classes (replace with actual queries)
interface Term {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

export default function AddPost() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setPosts } = usePosts();
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [comment, setComment] = useState("");
  //   const { data: terms, loading: termsLoading } = useReadTerms();

  // Fetch terms (replace with actual query)
  useEffect(() => {
    setTerms([
      { id: "1", name: "Fall 2024" },
      { id: "2", name: "Spring 2025" },
    ]);
  }, []);

  // Fetch classes based on the selected term (replace with actual query)
  useEffect(() => {
    if (selectedTerm) {
      setClasses([
        { id: "1", name: "CS101" },
        { id: "2", name: "EECS126" },
      ]);
    }
  }, [selectedTerm]);

  const handleCancelPost = () => {
    const newPost = {
      id: Date.now().toString(),
      className: selectedClass || "",
      semester: selectedTerm || "",
      title: postTitle || "Untitled",
      imageUrl: imageUrl || "",
      comment: comment || "",
      status: "Draft",
    };

    setPosts((prevPosts: Post[]) => [...prevPosts, newPost]);
    console.log("New Post:", newPost);
    navigate("/");
  };

  const handleAddPost = () => {
    const newPost = {
      id: Date.now().toString(),
      className: selectedClass || "",
      semester: selectedTerm || "",
      title: postTitle || "Untitled",
      imageUrl: imageUrl || "",
      comment: comment || "",
      status: "Posted",
    };

    setPosts((prevPosts: Post[]) => [...prevPosts, newPost]);
    console.log("New Post:", newPost);
    navigate("/");
  };

  return (
    <div className={styles.root}>
      <Flex direction="column" gap="3">
        <h2>Add a New Post</h2>
        <DataList.Root>
          <DataList.Item>
            <Flex align="start">
              <DataList.Label minWidth="150px">Post Title</DataList.Label>
              <DataList.Value>
                <Box width="500px">
                  <TextField.Root
                    id="postTitle"
                    size="1"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Enter post title"
                  />
                </Box>
              </DataList.Value>
            </Flex>
          </DataList.Item>

          <DataList.Item>
            <Flex align="center">
              <DataList.Label minWidth="150px">Select Semester</DataList.Label>
              <DataList.Value>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="soft" size="1">
                      Select Semester
                      <DropdownMenu.TriggerIcon />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item>Spring 2025</DropdownMenu.Item>
                    <DropdownMenu.Item>Fall 2025</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </DataList.Value>
            </Flex>
          </DataList.Item>
          <DataList.Item>
            <Flex align="center">
              <DataList.Label minWidth="150px">Select Class</DataList.Label>
              <DataList.Value>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="soft" size="1">
                      Select Class
                      <DropdownMenu.TriggerIcon />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item>CS 101</DropdownMenu.Item>
                    <DropdownMenu.Item>CS 260</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </DataList.Value>
            </Flex>
          </DataList.Item>

          <DataList.Item>
            <Flex align="start">
              <DataList.Label minWidth="150px">Image URL</DataList.Label>
              <DataList.Value>
                <Box width="500px">
                  <TextField.Root
                    id="imageUrl"
                    size="1"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                  />
                </Box>
              </DataList.Value>
            </Flex>
          </DataList.Item>

          <DataList.Item>
            <Flex align="start">
              <DataList.Label minWidth="150px">Post Comment</DataList.Label>
              <DataList.Value>
                <Box width="500px">
                  <TextArea
                    size="1"
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter post comment..."
                    style={{ height: "100px" }}
                  />
                </Box>
              </DataList.Value>
            </Flex>
          </DataList.Item>
        </DataList.Root>
        <Flex gap={"8px"} justify="end">
          <Button onClick={handleCancelPost} color="gray" variant="soft">
            Cancel
          </Button>
          <Button onClick={handleAddPost}>Post</Button>
        </Flex>
      </Flex>
    </div>
  );
}
