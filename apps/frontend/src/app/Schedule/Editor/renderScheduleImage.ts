import { componentMap } from "@/lib/api";
import { Component } from "@/lib/generated/graphql";
import {
  formatMinutes,
  toBusyIntervals,
  toIntervals,
} from "@/lib/scheduler/time";

import { findSelectedSections } from "../schedule";

interface ImageMeeting {
  days?: boolean[] | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
}

interface ImageSection {
  sectionId: string;
  subject: string;
  courseNumber: string;
  number: string;
  component: Component;
  meetings: ImageMeeting[];
}

export interface ImageSchedule {
  name: string;
  year: number;
  semester: string;
  classes: {
    class: {
      subject: string;
      courseNumber: string;
      primarySection?: ImageSection | null;
      sections: ImageSection[];
    };
    selectedSections: { sectionId?: string | null }[];
    color?: string | null;
    hidden?: boolean | null;
  }[];
  events: {
    _id: string;
    title: string;
    days: boolean[];
    startTime: string;
    endTime: string;
    color?: string | null;
    hidden?: boolean | null;
  }[];
}

interface Block {
  day: number;
  start: number;
  end: number;
  title: string;
  subtitle: string;
  detail: string;
  color: string;
  column: number;
  columns: number;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SCALE = 2;
const PADDING = 32;
const HEADER_HEIGHT = 72;
const DAY_HEADER_HEIGHT = 32;
const TIME_COLUMN_WIDTH = 56;
const DAY_WIDTH = 180;
const HOUR_HEIGHT = 64;
const FOOTER_LINE_HEIGHT = 20;

const resolveColor = (color: string | null | undefined) => {
  const value = color
    ? getComputedStyle(document.documentElement)
        .getPropertyValue(`--${color}-500`)
        .trim()
    : "";
  return value || "#3b82f6";
};

// Assign side-by-side columns to blocks that overlap within a day
const layoutDay = (blocks: Block[]) => {
  blocks.sort((a, b) => a.start - b.start || a.end - b.end);

  let cluster: Block[] = [];
  let clusterEnd = -1;
  const columnEnds: number[] = [];

  const flush = () => {
    const columns = Math.max(1, columnEnds.length);
    for (const block of cluster) block.columns = columns;
    cluster = [];
    columnEnds.length = 0;
  };

  for (const block of blocks) {
    if (block.start >= clusterEnd) flush();

    let column = columnEnds.findIndex((end) => end <= block.start);
    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(block.end);
    } else {
      columnEnds[column] = block.end;
    }

    block.column = column;
    cluster.push(block);
    clusterEnd = Math.max(clusterEnd, block.end);
  }

  flush();
};

// Draws text clipped to maxWidth with an ellipsis
const fillTextFit = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) => {
  if (maxWidth <= 0) return;
  if (context.measureText(text).width <= maxWidth) {
    context.fillText(text, x, y);
    return;
  }

  let truncated = text;
  while (
    truncated.length > 0 &&
    context.measureText(`${truncated}…`).width > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }
  context.fillText(`${truncated}…`, x, y);
};

// Renders a weekly view of the schedule to a canvas, independent of the DOM
// so the result doesn't depend on scroll position or the active tab
export const renderScheduleImage = (schedule: ImageSchedule) => {
  const blocks: Block[] = [];
  const unscheduled: string[] = [];

  for (const {
    class: _class,
    selectedSections,
    color,
    hidden,
  } of schedule.classes) {
    if (hidden) continue;

    let hasMeeting = false;

    for (const section of findSelectedSections(_class, selectedSections)) {
      for (const meeting of section.meetings) {
        // Skips meetings whose time isn't announced yet (a 00:00 start)
        for (const { day, start, end } of toIntervals([meeting])) {
          hasMeeting = true;
          blocks.push({
            day,
            start,
            end,
            title: `${section.subject} ${section.courseNumber}`,
            subtitle: `${componentMap[section.component] ?? section.component} ${section.number}`,
            detail: meeting.location ?? "",
            color: resolveColor(color),
            column: 0,
            columns: 1,
          });
        }
      }
    }

    if (!hasMeeting)
      unscheduled.push(`${_class.subject} ${_class.courseNumber}`);
  }

  for (const event of schedule.events) {
    if (event.hidden) continue;

    for (const { day, start, end } of toBusyIntervals([event])) {
      blocks.push({
        day,
        start,
        end,
        title: event.title,
        subtitle: "Custom event",
        detail: "",
        color: resolveColor(event.color),
        column: 0,
        columns: 1,
      });
    }
  }

  // Only show weekends when something is scheduled on them
  const dayCount = blocks.some((block) => block.day >= 5) ? 7 : 5;

  // Span from the hour of the first meeting to the hour the last one ends,
  // defaulting to a typical school day when nothing has a time
  const firstHour = blocks.length
    ? Math.floor(Math.min(...blocks.map((b) => b.start)) / 60)
    : 8;
  const lastHour = blocks.length
    ? Math.max(
        firstHour + 1,
        Math.ceil(Math.max(...blocks.map((b) => b.end)) / 60)
      )
    : 18;

  for (let day = 0; day < 7; day++) {
    layoutDay(blocks.filter((block) => block.day === day));
  }

  const gridTop = PADDING + HEADER_HEIGHT + DAY_HEADER_HEIGHT;
  const gridLeft = PADDING + TIME_COLUMN_WIDTH;
  const gridWidth = DAY_WIDTH * dayCount;
  const gridHeight = HOUR_HEIGHT * (lastHour - firstHour);
  const footerHeight = unscheduled.length ? FOOTER_LINE_HEIGHT + 16 : 0;

  const width = gridLeft + gridWidth + PADDING;
  const height = gridTop + gridHeight + footerHeight + PADDING;

  const canvas = document.createElement("canvas");
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;

  const context = canvas.getContext("2d")!;
  context.scale(SCALE, SCALE);

  const fontFamily =
    getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const font = (weight: number, size: number) =>
    `${weight} ${size}px ${fontFamily}`;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  // Header
  context.textBaseline = "alphabetic";
  context.fillStyle = "#111827";
  context.font = font(700, 24);
  fillTextFit(
    context,
    schedule.name,
    PADDING,
    PADDING + 28,
    width - PADDING * 2
  );
  context.fillStyle = "#6b7280";
  context.font = font(500, 14);
  context.fillText(
    `${schedule.semester} ${schedule.year}`,
    PADDING,
    PADDING + 52
  );

  // Day headers
  context.fillStyle = "#374151";
  context.font = font(600, 13);
  context.textAlign = "center";
  for (let day = 0; day < dayCount; day++) {
    context.fillText(
      DAY_NAMES[day],
      gridLeft + DAY_WIDTH * day + DAY_WIDTH / 2,
      gridTop - 12
    );
  }

  // Hour lines and labels
  context.textAlign = "right";
  context.font = font(500, 11);
  context.strokeStyle = "#e5e7eb";
  context.lineWidth = 1;
  for (let hour = firstHour; hour <= lastHour; hour++) {
    const y = gridTop + HOUR_HEIGHT * (hour - firstHour);
    context.beginPath();
    context.moveTo(gridLeft, y + 0.5);
    context.lineTo(gridLeft + gridWidth, y + 0.5);
    context.stroke();

    if (hour < lastHour) {
      context.fillStyle = "#9ca3af";
      context.fillText(formatMinutes(hour * 60), gridLeft - 8, y + 12);
    }
  }

  // Day separators
  for (let day = 0; day <= dayCount; day++) {
    const x = gridLeft + DAY_WIDTH * day;
    context.beginPath();
    context.moveTo(x + 0.5, gridTop);
    context.lineTo(x + 0.5, gridTop + gridHeight);
    context.stroke();
  }

  // Blocks
  context.textAlign = "left";
  const minuteHeight = HOUR_HEIGHT / 60;
  for (const block of blocks) {
    if (block.day >= dayCount) continue;

    const columnWidth = (DAY_WIDTH - 4) / block.columns;
    const x = gridLeft + DAY_WIDTH * block.day + 2 + columnWidth * block.column;
    const y = gridTop + (block.start - firstHour * 60) * minuteHeight + 1;
    const blockWidth = columnWidth - 2;
    const blockHeight = (block.end - block.start) * minuteHeight - 2;

    context.fillStyle = block.color;
    context.beginPath();
    context.roundRect(x, y, blockWidth, blockHeight, 6);
    context.fill();

    context.save();
    context.beginPath();
    context.rect(x, y, blockWidth, blockHeight);
    context.clip();

    const textWidth = blockWidth - 12;
    const lines: [string, string][] = [
      [font(700, 12), block.title],
      [font(500, 11), block.subtitle],
      [
        font(500, 11),
        `${formatMinutes(block.start)} – ${formatMinutes(block.end)}`,
      ],
      [font(500, 11), block.detail],
    ];

    context.fillStyle = "#ffffff";
    let lineY = y + 16;
    for (const [lineFont, text] of lines) {
      if (!text || lineY > y + blockHeight - 2) continue;
      context.font = lineFont;
      fillTextFit(context, text, x + 6, lineY, textWidth);
      lineY += 15;
    }

    context.restore();
  }

  if (unscheduled.length) {
    context.fillStyle = "#6b7280";
    context.font = font(500, 12);
    fillTextFit(
      context,
      `No scheduled meetings: ${unscheduled.join(", ")}`,
      PADDING,
      gridTop + gridHeight + 28,
      width - PADDING * 2
    );
  }

  return canvas;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
