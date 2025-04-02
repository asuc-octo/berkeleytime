import { JSDOM } from "jsdom";

interface Section {
  title: string | null;
  facilitators: string | null;
  size: string | null;
  location: string | null;
  time: string | null;
  starts: string | null;
  status: string | null;
  ccn: string | null;
}

export interface Decal {
  id: string;
  category: string | null;
  units: string | null;
  date: string | null;
  title?: string;
  description?: string;
  website?: string;
  application?: string;
  sections?: Section[];
  enroll?: string;
  contact?: string;
  course?: string;
  semester: string;
}

const getSections = (document: Document) => {
  const children = getElementFromXPath<HTMLTableSectionElement>(
    document,
    "/html/body/div[1]/div[5]/div/table/tbody"
  )?.children;

  if (!children) return [];

  const rows = Array.from(children).slice(1);

  return rows.map((row) => {
    const cells = Array.from(row.children);

    return {
      title: cells[0].textContent,
      // Parse facilitators as array
      facilitators: cells[1].textContent,
      size: cells[2].textContent,
      location: cells[3].textContent,
      // Parse time as array of days and times
      time: cells[4].textContent,
      starts: cells[5].textContent,
      status: cells[6].textContent,
      // Parse CCN from title if not found
      ccn: cells[8].textContent,
    };
  });
};

const getPartialDecals = (document: Document) => {
  const children = getElementFromXPath<HTMLUListElement>(
    document,
    "/html/body/div[1]/div/div[2]/table/tbody"
  )?.children;

  if (!children) return [];

  const rows = Array.from(children);

  return rows.map((row) => {
    const cells = Array.from(row.children);

    const id = (cells[0].firstChild as HTMLAnchorElement).href.slice(
      "/courses/".length
    );

    return {
      id,
      category: cells[1].textContent,
      units: cells[2].textContent,
      date: cells[5].textContent,
    };
  });
};

const getElementFromXPath = <T = Node>(document: Document, path: string) => {
  const element = document.evaluate(
    path,
    document,
    null,
    9,
    null
  ).singleNodeValue;

  return element as T | null;
};

const getTextContentFromXPath = (document: Document, path: string) => {
  const element = getElementFromXPath(document, path);

  return element?.textContent?.trim();
};

const getDecal = async (id: string) => {
  try {
    const response = await fetch(
      `https://decal.studentorg.berkeley.edu/courses/${id}`
    );

    if (!response.ok || response.redirected) return;

    const text = await response.text();

    const {
      window: { document },
    } = new JSDOM(text);

    const title = getTextContentFromXPath(
      document,
      "/html/body/div[1]/div[1]/div[1]/h3"
    );

    const description = getTextContentFromXPath(
      document,
      "/html/body/div[1]/div[3]/div/div"
    );

    const website = getTextContentFromXPath(
      document,
      "/html/body/div[1]/div[1]/div[3]/a"
    );

    const application = getElementFromXPath<HTMLFormElement>(
      document,
      "/html/body/div[1]/div[4]/form"
    )?.action;

    const enroll = getTextContentFromXPath(
      document,
      "/html/body/div[1]/div[4]/div/div"
    );

    const contact = getTextContentFromXPath(
      document,
      "/html/body/div[1]/div[1]/div[2]/text()[5]"
    );

    const course = getTextContentFromXPath(
      document,
      "/html/body/div[1]/div[1]/div[2]/text()[2]"
    );

    const sections = getSections(document);

    return {
      title,
      description,
      website,
      // Parse from enroll if not found
      application,
      sections,
      enroll,
      contact,
      course,
    };
  } catch {
    return;
  }
};

export const getDecals = async (semester: string) => {
  try {
    const response = await fetch(
      `https://decal.studentorg.berkeley.edu/courses?utf8=✓&semester=${semester}&start_time=&end_time=&sort=&button=`
    );

    const text = await response.text();

    const {
      window: { document },
    } = new JSDOM(text);

    const partialDecals = getPartialDecals(document);
    if (partialDecals.length === 0) return [];

    const requests = partialDecals.map(async (partialDecal) => {
      const decal = await getDecal(partialDecal.id);
      if (!decal) return;

      return {
        ...partialDecal,
        ...decal,
        semester,
      };
    });

    const decals = await Promise.all(requests);

    return decals.filter((decal) => !!decal);
  } catch {
    return [];
  }
};

export const getDecalSemesters = async () => {
  try {
    const response = await fetch(
      "https://decal.studentorg.berkeley.edu/courses"
    );

    const text = await response.text();

    const {
      window: { document },
    } = new JSDOM(text);

    const children = getElementFromXPath<HTMLSelectElement>(
      document,
      `/html/body/div[1]/div/div[1]/form/div/div[1]/div[1]/select`
    )?.children;

    if (!children) return [];

    const options = Array.from(children) as HTMLOptionElement[];

    return options.map((option) => option.value);
  } catch {
    return [];
  }
};
