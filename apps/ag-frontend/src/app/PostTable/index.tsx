import { Badge, Table } from "@radix-ui/themes";

import { usePosts } from "../Landing";
import styles from "./PostTable.module.scss";

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

export default function PostTable() {
  const { posts } = usePosts();
  return (
    <div className={styles.root}>
      <Table.Root className={styles.table}>
        <Table.Header>
          <Table.Row className={styles.header}>
            <Table.ColumnHeaderCell>
              <input type="checkbox" className={styles.check} />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Semester</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {posts.map((post) => (
            <Table.Row key={post.id}>
              <Table.Cell>
                <input type="checkbox" className={styles.check} />
              </Table.Cell>
              <Table.RowHeaderCell>{post.className}</Table.RowHeaderCell>
              <Table.Cell>{post.title}</Table.Cell>
              <Table.Cell>{post.semester}</Table.Cell>
              <Table.Cell>
                <Badge color={getStatusColor(post.status)}>{post.status}</Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
