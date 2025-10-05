import { useState } from "react";

import { Button, Select } from "@radix-ui/themes";
import { Plus } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { useReadTerms } from "@/hooks/api";

import PostTable from "../Posts/PostTable";
import styles from "./Landing.module.scss";

export default function Posts() {
  const navigate = useNavigate();

  const { data: allTerms, loading, error } = useReadTerms(); // tried to query from hooks but querying from 8081 instead of 8080

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
