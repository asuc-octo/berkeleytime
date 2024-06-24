import { useEffect, useRef, useState } from "react";

import classNames from "classnames";

import styles from "./Placeholder.module.scss";

const values = [
  "Explore courses...",
  "Computational methods for science and engineering",
  "Environmental policy and resource management",
  "Bioinformatics and computational biology",
  "Quantum mechanics and mathematical physics",
  "Public health epidemiology and data analysis",
];

interface PlaceholderProps {
  className?: string;
}

export default function Placeholder({ className }: PlaceholderProps) {
  const [text, setText] = useState(values[0]);
  const positionRef = useRef(values[0].length - 1);
  const indexRef = useRef(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const update = () => {
      let position = positionRef.current + 1;

      if (position === values[indexRef.current].length * 2) {
        indexRef.current = (indexRef.current + 1) % values.length;

        position = 0;
      }

      positionRef.current = position;

      const value = values[indexRef.current];

      const end =
        position > value.length ? -(position % value.length) : position;

      const _text = values[indexRef.current].slice(0, end);

      setText(_text);

      timeoutId = setTimeout(update, _text.length === value.length ? 1000 : 75);
    };

    timeoutId = setTimeout(update, 100);

    return () => clearInterval(timeoutId);
  }, []);

  return <p className={classNames(styles.root, className)}>{text}</p>;
}
