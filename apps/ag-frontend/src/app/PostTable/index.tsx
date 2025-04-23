import { Badge, Table } from "@radix-ui/themes";

import { Post } from "../Landing";
import styles from "./PostTable.module.scss";

// adjust if type is moved

const getStatusColor = (status: string) => {
  switch (status) {
    case "Posted":
      return "green";
    case "Scheduled":
      return "blue";
    case "In progress":
      return "gray";
    default:
      return "gray";
  }
};

interface PostTableProps {
  posts: Post[];
  onPostClick: (postId: string) => void;
}

export default function PostTable({ posts, onPostClick }: PostTableProps) {
  return (
    <div className={styles.root}>
      <Table.Root className={styles.table}>
        <Table.Header>
          <Table.Row className={styles.header}>
            <Table.ColumnHeaderCell>
              <input type="checkbox" className={styles.check} />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Image</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Semester</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Post Date</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {posts.map((post) => (
            <Table.Row
              key={post.id}
              className={styles.row}
              onClick={() => onPostClick(post.id)}
              style={{ cursor: "pointer" }}
            >
              <Table.Cell>
                <input type="checkbox" className={styles.check} />
              </Table.Cell>
              <Table.RowHeaderCell>{post.className}</Table.RowHeaderCell>
              <Table.Cell>{post.imageUrl}</Table.Cell>
              <Table.Cell>{post.title}</Table.Cell>
              <Table.Cell>{post.semester}</Table.Cell>
              <Table.Cell>
                <Badge color={getStatusColor(post.status)}>{post.status}</Badge>
              </Table.Cell>
              <Table.Cell>{post.postDate}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
