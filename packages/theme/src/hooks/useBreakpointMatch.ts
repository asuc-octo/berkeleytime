import { useEffect, useState } from "react";

export enum Breakpoint {
  ExtraSmall = 520,
  Small = 768,
  Medium = 1024,
  Large = 1280,
  ExtraLarge = 1640,
}

const matchMedia = {
  [Breakpoint.ExtraSmall]: window.matchMedia(
    `(width > ${Breakpoint.ExtraSmall}px)`
  ),
  [Breakpoint.Small]: window.matchMedia(`(width > ${Breakpoint.Small}px)`),
  [Breakpoint.Medium]: window.matchMedia(`(width > ${Breakpoint.Medium}px)`),
  [Breakpoint.Large]: window.matchMedia(`(width > ${Breakpoint.Large}px)`),
  [Breakpoint.ExtraLarge]: window.matchMedia(
    `(width > ${Breakpoint.ExtraLarge}px)`
  ),
};

export const useBreakpointMatch = (breakpoint: Breakpoint) => {
  const [value, setValue] = useState(() => matchMedia[breakpoint].matches);

  useEffect(() => {
    // TODO: Proper breakpoint reactivity
    setValue(matchMedia[breakpoint].matches);

    const handleChange = (event: MediaQueryListEvent) =>
      setValue(event.matches);

    matchMedia[breakpoint].addEventListener("change", handleChange);

    return () =>
      matchMedia[breakpoint].removeEventListener("change", handleChange);
  }, [breakpoint]);

  return value;
};
