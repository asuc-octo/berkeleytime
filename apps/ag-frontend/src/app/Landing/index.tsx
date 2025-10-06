import { useState } from "react";

import { Button, Select } from "@radix-ui/themes";
import { Plus } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { useReadTerms } from "@/hooks/api";

import PostTable from "../CuratedClasses/PostTable";
import styles from "./Landing.module.scss";

export interface Post {
  id: string;
  className: string;
  title: string;
  semester: string;
  comment: string;
  imageUrl: string;
  status: string;
  postDate: string;
}

export default function Landing() {
  const navigate = useNavigate();
  const { data: allTerms, loading, error } = useReadTerms(); // tried to query from hooks but querying from 8081 instead of 8080

  // temp posts lists
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      className: "CS101",
      semester: "Fall 2024",
      title: "Join CS101!",
      comment: "Excited!",
      imageUrl: "https://example.com/image.jpg",
      status: "Posted",
      postDate: "10/16/2024",
    },
    {
      id: "2",
      className: "EECS126",
      semester: "Spring 2025",
      title: "Join EECS126!",
      comment: "Tough but worth it!",
      imageUrl: "https://example.com/eecs126.jpg",
      status: "Scheduled",
      postDate: "01/16/2025",
    },
    {
      id: "3",
      className: "EECS127",
      semester: "Spring 2025",
      title: "Join EECS127!",
      comment: "Tough but worth it!",
      imageUrl: "https://example.com/eecs126.jpg",
      status: "Draft",
      postDate: "-",
    },
  ]);

  const [classFilter, setClassFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const handleNewPostClick = () => {
    navigate("/add-post");
  };

  const handlePostClick = (postId: string) => {
    // handle post clicks to new page
    navigate(`/posts/${postId}`);
  };

  // will adjust filtering once I know criteria, for dateFilter will need to order by sorting
  const filteredPosts = posts.filter(
    (post) =>
      (classFilter === "" || post.className === classFilter) &&
      (dateFilter === "" || post.postDate === dateFilter) &&
      (semesterFilter === "" || post.semester === semesterFilter) &&
      (statusFilter === "" || post.status === statusFilter)
  );

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <Button className={styles.add} onClick={handleNewPostClick}>
          <Plus />
          New Post
        </Button>

        <div className={styles.filters}>
          <Select.Root onValueChange={setClassFilter}>
            <Select.Trigger placeholder="Class" />
            <Select.Content>
              <Select.Item value="CS101">CS101</Select.Item>
              <Select.Item value="EECS126">EECS126</Select.Item>
              <Select.Item value="EECS127">EECS127</Select.Item>
            </Select.Content>
          </Select.Root>

          <Select.Root onValueChange={setDateFilter}>
            <Select.Trigger placeholder="Posted Date" />
            <Select.Content>
              <Select.Item value="most recent">Most Recent</Select.Item>
              <Select.Item value="least recent">Least Recent</Select.Item>
            </Select.Content>
          </Select.Root>

          <Select.Root onValueChange={setSemesterFilter}>
            <Select.Trigger placeholder="Select Term" />
            <Select.Content>
              {allTerms?.map((term) => (
                // did not implement fully yet since could not preview data
                <Select.Item key={term} value={term.semester}>
                  {term.semester}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Select.Root onValueChange={setStatusFilter}>
            <Select.Trigger placeholder="Status" />
            <Select.Content>
              <Select.Item value="Posted">Posted</Select.Item>
              <Select.Item value="Scheduled">Scheduled</Select.Item>
              <Select.Item value="Draft">Draft</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <PostTable posts={filteredPosts} onPostClick={handlePostClick} />
    </div>
  );
}
