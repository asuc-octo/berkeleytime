import { ArrowRight } from "iconoir-react";
import { Link } from "react-router-dom";

import Container from "@/components/Container";

import styles from "./Release.module.scss";

interface ReleaseProps {
  date: string;
  updates: Array<string>;
  fixes: Array<string>;
}

export default function Release(props: { release?: ReleaseProps }) {
  console.log(release);
  return (
    <div className={styles.root}>
        <h3 className={styles.heading}>{release.date}</h3>
        <h4 className={styles.heading}>🤩 What's New</h4>
        <ul>
          {release.updates.map(item => {
            return <li>{item}</li>
          })}
        </ul>
        <h4 className={styles.heading}>🐛 Bug Fixes</h4>
        <ul>
          {release.fixes.map(item => {
            return <li>{item}</li>
          })}
        </ul>
    </div>
  );
}
