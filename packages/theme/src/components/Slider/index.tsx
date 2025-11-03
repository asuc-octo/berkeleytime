import { Slider as Primitive } from "radix-ui";

import styles from "./Slider.module.scss";

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  disabled?: boolean;
  labels?: string[];
}

export function Slider({
  min = 0,
  max = 5,
  step = 1,
  value,
  defaultValue = [0, 5],
  onValueChange,
  disabled = false,
  labels,
}: SliderProps) {
  return (
    <div className={styles.container}>
      <Primitive.Root
        className={styles.root}
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange as (value: number[]) => void}
        disabled={disabled}
      >
        <Primitive.Track className={styles.track}>
          <Primitive.Range className={styles.range} />
        </Primitive.Track>
        <Primitive.Thumb className={styles.thumb} />
        <Primitive.Thumb className={styles.thumb} />
      </Primitive.Root>
      {labels && labels.length > 0 && (
        <div className={styles.labels}>
          {labels.map((label, index) => (
            <span key={index} className={styles.label}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
