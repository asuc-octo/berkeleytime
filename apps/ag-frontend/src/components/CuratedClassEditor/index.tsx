import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client/react";
import {
  Card,
  Flex,
  Grid,
  Heading,
  IconButton,
  Popover,
  Select,
  Spinner,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { Search, Trash } from "iconoir-react";

import { useReadTerms } from "@/hooks/api";
import { GET_CATALOG, ICuratedClassInput, Semester } from "@/lib/api";
import { GetCatalogResponse } from "@/lib/api/classes";

interface CuratedClassEditorProps {
  value: Partial<ICuratedClassInput>;
  onChange: (value: Partial<ICuratedClassInput>) => void;
}

export default function CuratedClassEditor({
  value,
  onChange,
}: CuratedClassEditorProps) {
  const [query, setQuery] = useState("");
  const [localValue, setLocalValue] = useState(value);
  const [open, setOpen] = useState(false);

  const { data: terms, loading: termsLoading } = useReadTerms();

  const { data: classes, loading: classesLoading } =
    useQuery<GetCatalogResponse>(GET_CATALOG, {
      variables: {
        semester: localValue.semester,
        year: localValue.year,
      },
      skip: !(localValue.semester && localValue.year),
    });

  const handleChange = (updatedState: Partial<ICuratedClassInput>) => {
    const updatedValue = { ...localValue, ...updatedState };
    setLocalValue(updatedValue);
    onChange(updatedValue);
  };

  const filteredTerms = useMemo(
    () =>
      terms
        ?.filter(
          (term, index) =>
            terms.findIndex(
              (t) => t.semester === term.semester && t.year === term.year
            ) === index
        )
        .toSorted((a, b) => {
          if (a.year !== b.year) return b.year - a.year;

          const semesterOrder = [
            Semester.Winter,
            Semester.Fall,
            Semester.Summer,
            Semester.Spring,
          ];

          return (
            semesterOrder.indexOf(a.semester) -
            semesterOrder.indexOf(b.semester)
          );
        }),
    [terms]
  );

  const filteredClasses = useMemo(
    () =>
      classes?.catalog
        .filter((cls) => {
          const search = query.toLowerCase();

          return (
            `${cls.course.subject} ${cls.course.number} ${cls.number}`
              .toLowerCase()
              .includes(search) ||
            cls.title?.toLowerCase().includes(search) ||
            cls.course.title?.toLowerCase().includes(search)
          );
        })
        .slice(0, 5),
    [classes, query]
  );

  const selectedClass = useMemo(
    () =>
      classes?.catalog.find(
        (cls) =>
          cls.course.subject === localValue.subject &&
          cls.course.number === localValue.courseNumber &&
          cls.number === localValue.number &&
          cls.sessionId === localValue.sessionId
      ),
    [classes, localValue]
  );

  // TODO: Virtualized list for terms
  return (
    <Grid columns="2" gap="5">
      <Flex direction="column" gap="5">
        <Card>
          <Flex direction="column" p="2" gap="4">
            <Flex direction="column" gap="1">
              <Heading size="3">Select a class</Heading>
              <Text color="gray" size="2">
                Curated classes will be displayed in chronological order from
                when they are published, grouped by their term
              </Text>
            </Flex>
            <Select.Root
              disabled={!terms || termsLoading}
              onValueChange={(value) => {
                const [year, semester] = value.split("-");

                handleChange({
                  year: parseInt(year),
                  semester: semester as Semester,
                });
              }}
              value={
                value.year && value.semester
                  ? `${value.year}-${value.semester}`
                  : ""
              }
            >
              <Select.Trigger placeholder="Select a term" />
              <Select.Content>
                {filteredTerms?.map((term) => (
                  <Select.Item
                    key={`${term.year}-${term.semester}`}
                    value={`${term.year}-${term.semester}`}
                  >
                    {term.semester} {term.year}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {selectedClass && (
              <Card>
                <Flex p="1" gap="3">
                  <Flex direction="column" flexGrow="1">
                    <Heading size="2">
                      {selectedClass.course.subject}{" "}
                      {selectedClass.course.number} #{selectedClass.number}
                    </Heading>
                    <Text size="2" color="gray">
                      {selectedClass.title || selectedClass.course.title}
                    </Text>
                  </Flex>
                  <IconButton
                    variant="outline"
                    color="red"
                    onClick={() =>
                      handleChange({
                        subject: "",
                        courseNumber: "",
                        number: "",
                        sessionId: "",
                      })
                    }
                  >
                    <Trash />
                  </IconButton>
                </Flex>
              </Card>
            )}
            <Popover.Root
              open={open && filteredClasses && filteredClasses.length > 0}
            >
              <Popover.Trigger>
                <TextField.Root
                  onFocus={() => setOpen(true)}
                  onBlur={() => setOpen(false)}
                  value={query}
                  placeholder="Find a class"
                  type="url"
                  onChange={(event) => setQuery(event.target.value)}
                >
                  <TextField.Slot>
                    {classesLoading ? <Spinner /> : <Search />}
                  </TextField.Slot>
                </TextField.Root>
              </Popover.Trigger>
              <Popover.Content
                collisionPadding={16}
                onOpenAutoFocus={(event) => event.preventDefault()}
              >
                <Flex direction="column" gap="2">
                  {filteredClasses?.map((cls) => (
                    <Card
                      key={`${cls.course.subject}-${cls.course.number}-${cls.number}-${cls.sessionId}`}
                      onClick={() =>
                        handleChange({
                          subject: cls.course.subject,
                          number: cls.number,
                          courseNumber: cls.course.number,
                          sessionId: cls.sessionId,
                        })
                      }
                    >
                      <Flex p="1" gap="3">
                        <Flex direction="column" flexGrow="1">
                          <Heading size="2">
                            {cls.course.subject} {cls.course.number} #
                            {cls.number}
                          </Heading>
                          <Text size="2" color="gray">
                            {cls.title || cls.course.title}
                          </Text>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" p="2" gap="4">
            <Flex direction="column" gap="1">
              <Heading size="3">Curate a post</Heading>
              <Text color="gray" size="2">
                This class will be displayed alongside an image and a short
                excerpt
              </Text>
            </Flex>
            <TextField.Root
              value={localValue.image}
              placeholder="Enter the URL of an image"
              type="url"
              onChange={(event) => handleChange({ image: event.target.value })}
            />
            <TextArea
              rows={3}
              value={localValue.text}
              placeholder="Enter a short excerpt"
              onChange={(event) => handleChange({ text: event.target.value })}
            />
          </Flex>
        </Card>
      </Flex>
      <Flex direction="column"></Flex>
    </Grid>
  );
}
