import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "iconoir-react";
import { Badge, Color } from "@repo/theme";
import styles from "./MajorSearch.module.scss";
import { initialize } from "./browser";

interface DegreeOption {
  label: string;
  value: string;
}

interface MajorSearchProps {
  onSelect?: (degree: DegreeOption) => void;
  onClear?: () => void;
  selectedDegree: DegreeOption | null;
  degrees: string[];
  placeholder?: string;
  inputStyle?: React.CSSProperties;
}

export default function MajorSearch({
  onSelect,
  onClear,
  selectedDegree,
  degrees,
  placeholder = "Choose a major...",
  inputStyle,
}: MajorSearchProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const degreeOptions = useMemo(() => {
    return degrees.map((degree) => ({
      label: degree,
      value: degree,
    }));
  }, [degrees]);

  const index = useMemo(() => {
    const list = degreeOptions.map((degree) => ({
      name: degree.label,
      value: degree.value,
    }));

    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: ["name"],
    };

    return initialize(list, options);
  }, [degreeOptions]);

  const currentDegrees = useMemo(() => {
    return searchQuery
      ? index
          .search(searchQuery.slice(0, 50))
          .map(({ refIndex }) => degreeOptions[refIndex])
      : degreeOptions;
  }, [degreeOptions, index, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef}>
      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={searchQuery || (selectedDegree ? selectedDegree.label : "")}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (onClear) onClear();
          }}
          style={inputStyle}
        />
      </div>

      {isOpen && (
        <div className={styles.dropdownPanel}>
          <section className={styles.section}>
            <div className={styles.catalogList}>
              {currentDegrees.length > 0 ? (
                currentDegrees.map((degree) => (
                  <button
                    key={degree.value}
                    className={styles.catalogItem}
                    onClick={() => {
                      onSelect?.(degree);
                      setSearchQuery("");
                      setIsOpen(false);
                    }}
                  >
                    <span>{degree.label}</span>
                  </button>
                ))
              ) : (
                <p className={styles.noResults}>No results found</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}