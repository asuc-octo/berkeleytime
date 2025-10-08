import {
  Box,
  Button,
  Container,
  Flex,
  Spinner,
  Table,
  Link as ThemeLink,
} from "@radix-ui/themes";
import { Plus } from "iconoir-react";
import { Link } from "react-router-dom";

import { useReadCuratedClasses } from "@/hooks/api";
import { ICuratedClass } from "@/lib/api";

interface ContentProps {
  curatedClasses: ICuratedClass[];
}

function Content({ curatedClasses }: ContentProps) {
  return (
    <Box p="6">
      <Container>
        <Flex direction="column" gap="5">
          <Flex justify="between" align="center">
            <Link to="/curated-classes/new">
              <Button>
                <Plus />
                Add curated class
              </Button>
            </Link>
          </Flex>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Image</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Curated class</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Semester</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Excerpt</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {curatedClasses.map((curatedClass) => (
                <Table.Row key={curatedClass._id}>
                  <Table.Cell>
                    <ThemeLink
                      href={curatedClass.image}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {curatedClass.image}
                    </ThemeLink>
                  </Table.Cell>
                  <Table.RowHeaderCell>
                    <ThemeLink asChild>
                      <Link to={`/curated-classes/${curatedClass._id}`}>
                        {curatedClass.subject} {curatedClass.number}
                      </Link>
                    </ThemeLink>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    {curatedClass.semester} {curatedClass.year}
                  </Table.Cell>
                  <Table.Cell>{curatedClass.text}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Flex>
      </Container>
    </Box>
  );
}

export default function CuratedClasses() {
  const { data: curatedClasses, loading: curatedClassesLoading } =
    useReadCuratedClasses();

  if (curatedClassesLoading) {
    return (
      <Flex align="center" justify="center" flexGrow="1">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (curatedClasses) {
    return <Content curatedClasses={curatedClasses} />;
  }

  return <div>Error loading data.</div>;
}
