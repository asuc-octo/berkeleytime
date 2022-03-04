import { Button, P, H3, H6 } from "bt/custom";
import BTInput from "components/Custom/Input";
import BTSelect from "components/Custom/Select";
import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
];

// Hour ranges for times
const FIRST_TIME = 8;
const LAST_TIME = 18;

const TIMES = new Array(LAST_TIME - FIRST_TIME)
  .fill(null)
  .map((_, i) => i + FIRST_TIME)
  .map((hour): [number, string, string] => [
    hour,
    `${((hour - 1) % 12) + 1}`,
    hour >= 12 ? "PM" : "AM",
  ])
  .flatMap(([hour, hourText, ampm]) => [
    { value: hour + 0.0, label: `${hourText}:00 ${ampm}` },
    { value: hour + 0.25, label: `${hourText}:15 ${ampm}` },
    { value: hour + 0.5, label: `${hourText}:30 ${ampm}` },
    { value: hour + 0.75, label: `${hourText}:45 ${ampm}` },
  ]);

type TimeBlock = {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  days: number[];
};

let blockIdCounter = 0;

type Props = {
  createSchedule: () => void;
};

const TimePreferences = ({ createSchedule }: Props) => {
  const [blockName, setBlockName] = useState("");
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  function createTimeBlock() {
    const newBlock = {
      id: `${blockIdCounter++}`,
      name: blockName,
      startTime: 0,
      endTime: 0,
      days: [],
    };
    setTimeBlocks([newBlock, ...timeBlocks]);
    setBlockName("");
  }

  return (
    <Container className="time-preferences">
      <Row noGutters>
        <Col xs={12} lg={{ span: 4, offset: 4 }}>
          <H3 bold className="mt-5 mb-2 text-center">
            2. Add Time Preferences (Optional)
          </H3>
          <P className="mb-2 text-center bt-light-text">
            Add blocks of time you’d prefer not to have classes.
          </P>
          <BTInput
            className="my-3"
            value={blockName}
            onChange={(e) => setBlockName(e.target.value)}
            placeholder="Add block name"
          />
          <div className="data-row">
            <span>Time</span>
            <span>
              <BTSelect
                className="inline-select"
                options={TIMES}
                placeholder="Start"
              />
              {" to "}
              <BTSelect
                className="inline-select"
                options={TIMES}
                placeholder="End"
              />
            </span>
          </div>
          <div className="data-row">
            <span>Day(s)</span>
            <span>
              <BTSelect
                className="select"
                isMulti
                options={DAYS}
                placeholder="Select Day(s)"
              />
            </span>
          </div>
          <div className="mt-3 text-right">
            <Button className="bt-btn-inverted bt-lg" onClick={createTimeBlock}>
              Create Time Block
            </Button>
          </div>
          <div className="blocks">
            <H6 className="small-caps">Blocks</H6>
            {timeBlocks.length === 0 ? (
              <div className="blocks__placeholder">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  fill="none"
                >
                  <path
                    fill="#8A8A8A"
                    fillRule="evenodd"
                    d="M5 8.333H1.667C1.667 6.5 3.167 5 5 5v3.333zM1.667 15H5v-3.333H1.667V15zm0 6.667H5v-3.334H1.667v3.334zM15 35h3.333v-3.333H15V35zM5 28.333H1.667V25H5v3.333zM5 35v-3.333H1.667C1.667 33.5 3.167 35 5 35zM21.667 5H35c1.833 0 3.333 1.5 3.333 3.333V15H21.667V5zM35 28.333h3.333V25H35v3.333zm-16.667-20H15V5h3.333v3.333zM8.333 35h3.334v-3.333H8.333V35zm3.334-26.667H8.333V5h3.334v3.333zM35 35c1.833 0 3.333-1.5 3.333-3.333H35V35zm3.333-13.333H35v-3.334h3.333v3.334zM21.667 35H25v-3.333h-3.333V35zm10 0h-3.334v-3.333h3.334V35z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <p>You have not created time blocks.</p>
              </div>
            ) : (
              <div className="blocks-grid">
                {timeBlocks.map((block) => (
                  <div className="block" key={block.id}>
                    <p className="block__title">{block.name}</p>
                    <p className="block__desc">9am - 11am M, T</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
        <Col>
          <Button className="continue" onClick={createSchedule}>
            Continue
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default TimePreferences;
