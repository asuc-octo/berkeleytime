import { useMemo, useState } from "react";

import {
  Box,
  Button,
  Container,
  Flex,
  Spinner,
  Table,
  TextField,
  Link as ThemeLink,
} from "@radix-ui/themes";
import { Plus, Search } from "iconoir-react";
import { Link } from "react-router-dom";

import { FuzzySearch } from "@repo/common";

import { useReadCuratedClasses } from "@/hooks/api";
import { ICuratedClass } from "@/lib/api";

interface ContentProps {
  curatedClasses: ICuratedClass[];
}

function Content({ curatedClasses }: ContentProps) {
  const [query, setQuery] = useState("");

  const fuzzySearch = useMemo(() => {
    const list = curatedClasses.map((c) => ({
      name: `${c.subject} ${c.number}`,
      text: c.text,
      _id: c._id,
    }));
    return new FuzzySearch(list, {
      threshold: 0.3,
      keys: ["name", "text"],
    });
  }, [curatedClasses]);

  const filteredClasses = useMemo(() => {
    if (!query.trim()) return curatedClasses;

    const results = fuzzySearch.search(query);
    const matchedIds = new Set(results.map((r) => r.item._id));
    return curatedClasses.filter((c) => matchedIds.has(c._id));
  }, [curatedClasses, query, fuzzySearch]);

  return (
    <Box p="6">
      <Container>
        <Flex direction="column" gap="5">
          <Flex justify="between" align="center" gap="4">
            <TextField.Root
              placeholder="Search curated classes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flexGrow: 1, maxWidth: 300 }}
            >
              <TextField.Slot>
                <Search width={16} height={16} />
              </TextField.Slot>
            </TextField.Root>
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
              {filteredClasses.map((curatedClass) => (
                <Table.Row key={curatedClass._id}>
                  <Table.Cell>
                    <ThemeLink
                      href={curatedClass.image}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Link
                    </ThemeLink>
                  </Table.Cell>
                  <Table.RowHeaderCell>
                    <ThemeLink asChild>
                      <Link to={`/curated-classes/${curatedClass._id}`}>
                        {curatedClass.subject} {curatedClass.courseNumber}
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
    const sortedClasses = curatedClasses.toSorted(
      (a, b) => parseInt(b.createdAt) - parseInt(a.createdAt)
    );
    return <Content curatedClasses={sortedClasses} />;
  }

  return <div>Error loading data.</div>;
}
