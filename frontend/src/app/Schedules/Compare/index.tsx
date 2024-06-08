import { useEffect, useRef, useState } from "react";

import { ArrowLeft, DataTransferBoth, Xmark } from "iconoir-react";

import IconButton from "@/components/IconButton";
import Week from "@/components/Week";

import styles from "./Compare.module.scss";

const leftSelectedSections = JSON.parse(
  `[{"__typename":"Section","course":{"__typename":"Course","subject":"COMPSCI","number":"61B"},"reservations":[{"__typename":"Reservation","enrollCount":301,"enrollMax":1,"group":"Electrical Engineering & Computer Science, EECS/Materials Science & Engineering, and EECS/Nuclear Engineering Majors; and Undeclared Students in the College of Engineering"},{"__typename":"Reservation","enrollCount":32,"enrollMax":1,"group":"Non-EECS Declared Engineering Majors"},{"__typename":"Reservation","enrollCount":16,"enrollMax":1,"group":"Students declared in the Computer Science BA major"},{"__typename":"Reservation","enrollCount":0,"enrollMax":1,"group":"Intended L&S Computer Science Undergraduates with 1-2 Terms in Attendance"},{"__typename":"Reservation","enrollCount":617,"enrollMax":1,"group":"Undeclared Students in the College of Letters & Science"}],"ccn":15660,"enrollCount":1393,"enrollMax":1500,"meetings":[{"__typename":"Meeting","days":[false,true,false,true,false,true,false],"location":"Dwinelle 155","endTime":"13:59:00","startTime":"13:00:00","instructors":[{"__typename":"Instructor","familyName":"Yokota","givenName":"Justin"},{"__typename":"Instructor","familyName":"Kao","givenName":"Peyrin"}]}],"component":"LEC","primary":true,"waitlistCount":0,"waitlistMax":700,"number":"001","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}},{"__typename":"Section","course":{"__typename":"Course","subject":"COMPSCI","number":"61B"},"ccn":16493,"enrollCount":0,"enrollMax":1,"meetings":[{"__typename":"Meeting","days":[false,false,false,true,false,false,false],"endTime":"15:59:00","startTime":"14:00:00","location":"Soda 271","instructors":[]}],"primary":false,"component":"LAB","waitlistCount":0,"waitlistMax":0,"number":"101L","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}},{"__typename":"Section","course":{"__typename":"Course","subject":"COMPSCI","number":"61B"},"ccn":16492,"enrollCount":0,"enrollMax":1,"meetings":[{"__typename":"Meeting","days":[false,false,true,false,false,false,false],"endTime":"09:59:00","startTime":"09:00:00","location":"Soda 320","instructors":[]}],"primary":false,"component":"DIS","waitlistCount":0,"waitlistMax":0,"number":"101","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}},{"__typename":"Section","course":{"__typename":"Course","subject":"EPS","number":"C20"},"reservations":[],"ccn":20537,"enrollCount":455,"enrollMax":453,"meetings":[{"__typename":"Meeting","days":[false,false,true,false,true,false,false],"location":"Internet/Online","endTime":"15:29:00","startTime":"14:00:00","instructors":[{"__typename":"Instructor","familyName":"Burgmann","givenName":"Roland"}]}],"component":"LEC","primary":true,"waitlistCount":0,"waitlistMax":100,"number":"001","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}}]`
);

const rightSelectedSections = JSON.parse(
  `[{"__typename":"Section","course":{"__typename":"Course","subject":"COMPSCI","number":"61B"},"reservations":[{"__typename":"Reservation","enrollCount":301,"enrollMax":1,"group":"Electrical Engineering & Computer Science, EECS/Materials Science & Engineering, and EECS/Nuclear Engineering Majors; and Undeclared Students in the College of Engineering"},{"__typename":"Reservation","enrollCount":32,"enrollMax":1,"group":"Non-EECS Declared Engineering Majors"},{"__typename":"Reservation","enrollCount":16,"enrollMax":1,"group":"Students declared in the Computer Science BA major"},{"__typename":"Reservation","enrollCount":0,"enrollMax":1,"group":"Intended L&S Computer Science Undergraduates with 1-2 Terms in Attendance"},{"__typename":"Reservation","enrollCount":617,"enrollMax":1,"group":"Undeclared Students in the College of Letters & Science"}],"ccn":15660,"enrollCount":1393,"enrollMax":1500,"meetings":[{"__typename":"Meeting","days":[false,true,false,true,false,true,false],"location":"Dwinelle 155","endTime":"13:59:00","startTime":"13:00:00","instructors":[{"__typename":"Instructor","familyName":"Yokota","givenName":"Justin"},{"__typename":"Instructor","familyName":"Kao","givenName":"Peyrin"}]}],"component":"LEC","primary":true,"waitlistCount":0,"waitlistMax":700,"number":"001","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}},{"__typename":"Section","course":{"__typename":"Course","subject":"COMPSCI","number":"61B"},"ccn":16493,"enrollCount":0,"enrollMax":1,"meetings":[{"__typename":"Meeting","days":[false,false,false,true,false,false,false],"endTime":"15:59:00","startTime":"14:00:00","location":"Soda 271","instructors":[]}],"primary":false,"component":"LAB","waitlistCount":0,"waitlistMax":0,"number":"101L","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}},{"__typename":"Section","course":{"__typename":"Course","subject":"COMPSCI","number":"61B"},"ccn":16492,"enrollCount":0,"enrollMax":1,"meetings":[{"__typename":"Meeting","days":[false,false,true,false,false,false,false],"endTime":"09:59:00","startTime":"09:00:00","location":"Soda 320","instructors":[]}],"primary":false,"component":"DIS","waitlistCount":0,"waitlistMax":0,"number":"101","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}},{"__typename":"Section","course":{"__typename":"Course","subject":"EPS","number":"C20"},"reservations":[],"ccn":20537,"enrollCount":455,"enrollMax":453,"meetings":[{"__typename":"Meeting","days":[false,false,true,false,true,false,false],"location":"Internet/Online","endTime":"15:29:00","startTime":"14:00:00","instructors":[{"__typename":"Instructor","familyName":"Burgmann","givenName":"Roland"}]}],"component":"LEC","primary":true,"waitlistCount":0,"waitlistMax":100,"number":"001","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}},{"__typename":"Section","course":{"__typename":"Course","subject":"PHILOS","number":"100"},"reservations":[{"__typename":"Reservation","enrollCount":49,"enrollMax":50,"group":"Philosophy Majors"}],"ccn":21697,"enrollCount":50,"enrollMax":50,"meetings":[{"__typename":"Meeting","days":[false,false,false,true,false,false,false],"location":"Dwinelle 88","endTime":"17:59:00","startTime":"16:00:00","instructors":[{"__typename":"Instructor","familyName":"Dasgupta","givenName":"Shamik"},{"__typename":"Instructor","familyName":"DeBrine","givenName":"Hannah"},{"__typename":"Instructor","familyName":"Huang","givenName":"Anhui"},{"__typename":"Instructor","familyName":"McIntosh","givenName":"Russell"},{"__typename":"Instructor","familyName":"Strelau","givenName":"Klaus"},{"__typename":"Instructor","familyName":"von Gotz","givenName":"Aglaia"}]}],"component":"LEC","primary":true,"waitlistCount":0,"waitlistMax":0,"number":"001","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}},{"__typename":"Section","course":{"__typename":"Course","subject":"PHILOS","number":"100"},"ccn":21698,"enrollCount":50,"enrollMax":50,"meetings":[{"__typename":"Meeting","days":[false,false,false,false,false,false,false],"endTime":"00:00:00","startTime":"00:00:00","location":null,"instructors":[]}],"primary":false,"component":"TUT","waitlistCount":0,"waitlistMax":2,"number":"101","startDate":"2024-01-16T00:00:00.000Z","endDate":"2024-05-03T00:00:00.000Z","class":{"number":"001"}}]`
);

export default function Compare() {
  const [y, setY] = useState<number | null>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;

    const left = leftRef.current;
    const right = rightRef.current;

    const handleScroll = (left?: boolean) => {
      if (!leftRef.current || !rightRef.current) return;

      if (left) {
        if (current === 1) return;

        rightRef.current.scrollTo({
          top: leftRef.current.scrollTop,
          left: leftRef.current.scrollLeft,
        });

        return;
      }

      if (current === 0) return;

      leftRef.current.scrollTo({
        top: rightRef.current.scrollTop,
        left: rightRef.current.scrollLeft,
      });
    };

    const handleLeftScroll = () => handleScroll(true);
    left.addEventListener("scroll", handleLeftScroll);

    const handleRightScroll = () => handleScroll();
    right.addEventListener("scroll", handleRightScroll);

    return () => {
      right.removeEventListener("scroll", handleLeftScroll);
      left.removeEventListener("scroll", handleRightScroll);
    };
  }, [current]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.group}>
          <IconButton>
            <ArrowLeft />
          </IconButton>
          <p className={styles.heading}>Untitled Spring 2024 schedule</p>
          <p className={styles.paragraph}>Spring 2024</p>
          <IconButton>
            <DataTransferBoth />
          </IconButton>
          <IconButton>
            <Xmark />
          </IconButton>
        </div>
        <div className={styles.group}>
          <p className={styles.heading}>No schedule selected</p>
          <IconButton>
            <DataTransferBoth />
          </IconButton>
          <IconButton>
            <Xmark />
          </IconButton>
        </div>
      </div>
      <div className={styles.body}>
        <div
          className={styles.view}
          ref={leftRef}
          onMouseEnter={() => setCurrent(0)}
          onMouseLeave={() =>
            setCurrent((previous) => (previous === 0 ? null : previous))
          }
        >
          <Week selectedSections={leftSelectedSections} y={y} updateY={setY} />
        </div>
        <div
          className={styles.view}
          ref={rightRef}
          onMouseEnter={() => setCurrent(1)}
          onMouseLeave={() =>
            setCurrent((previous) => (previous === 1 ? null : previous))
          }
        >
          <Week selectedSections={rightSelectedSections} y={y} updateY={setY} />
        </div>
      </div>
    </div>
  );
}
