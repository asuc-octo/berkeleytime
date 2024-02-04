import { ArrowRight } from "iconoir-react";

import Container from "@/components/Container";
import Footer from "@/components/Footer";

import styles from "./Organization.module.scss";

export default function Organization() {
  return (
    <div className={styles.root}>
      <Container>
        <div className={styles.info}>
          <div className={styles.infoBlock}>
            <h2>What We Do</h2>
            <p>
              We're a small group of student volunteers at UC Berkeley who
              actively build, improve, and maintain Berkeleytime.
            </p>
            <p>
              <a href="/about">
                Read More <ArrowRight width={"1.15em"} height={"1.15em"} />
              </a>
            </p>
          </div>
          <div className={styles.infoBlock}>
            <h2>Get Involved</h2>
            <p>
              Berkeleytime is maintained by students just like you! If you're
              looking to make a difference - we're looking for you.
            </p>
            <p>
              <a>
                Learn More <ArrowRight width={"1.15em"} height={"1.15em"} />
              </a>
            </p>
          </div>
          <div className={styles.infoBlock}>
            <h2>Have Feedback?</h2>
            <p>
              We'd love to hear it! User feedback helps us continually improve
              Berkeleytime. We want to know what you think.
            </p>
            <p>
              <a>
                Reach Out <ArrowRight width={"1.15em"} height={"1.15em"} />
              </a>
            </p>
          </div>
        </div>
        <div className={styles.blurb}>
          <h4>In Memory Of Courtney Brousseau</h4>
          <p>
            Berkeley Alum, ASUC Student Union Board of Directors Chair, ASUC
            Chief Communications Officer, and Berkeley Mobile Product Manager
          </p>
        </div>
        <div className={styles.blurb}>
          <h4>Supported By</h4>
          {/*<div className={styles.sponsors}>
          <a href="https://techfund.berkeley.edu/home">
            <img className="landing-sponsors-img" src={stf_logo} alt="stf" />
          </a>
          <a href="https://asuc.org">
            <img className="landing-sponsors-img" src={asuc_logo} alt="asuc" />
          </a>
          <a href="https://www.ocf.berkeley.edu">
            <img
              className="landing-sponsors-img"
              src={ocf_logo}
              alt="Hosted by the OCF"
              style={{ border: 0 }}
            />
          </a>
        </div>*/}
        </div>
      </Container>
      <Footer invert />
    </div>
  );
}
