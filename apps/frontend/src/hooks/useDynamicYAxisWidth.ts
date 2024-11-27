import { useCallback, useState } from "react";

const RECHART_CERTESIAN_AXIS_TICK_VALUE_SELECTOR = `.recharts-cartesian-axis-tick-value[orientation="left"],
.recharts-cartesian-axis-tick-value[orientation="right"]`;

const useDynamicYAxisWidth = (tickMargin = 12) => {
  const [width, setWidth] = useState<number>();

  const handleRef = useCallback(
    (ref: unknown | null) => {
      // @ts-expect-error - LineChart cannot be typed
      if (!ref?.container) return;

      // @ts-expect-error - LineChart cannot be typed
      const tickValueElements = ref.container.querySelectorAll(
        RECHART_CERTESIAN_AXIS_TICK_VALUE_SELECTOR
      );

      const highestWidth = [...tickValueElements]
        .map((el) => {
          const boundingRect = el.getBoundingClientRect();

          if (!boundingRect?.width) return 0;

          return boundingRect.width;
        })
        .reduce((accumulator, value) => {
          if (accumulator < value) {
            return value;
          }

          return accumulator;
        }, 0);

      setWidth(highestWidth + tickMargin);
    },
    [tickMargin]
  );

  return {
    width,
    handleRef,
  };
};

export default useDynamicYAxisWidth;
