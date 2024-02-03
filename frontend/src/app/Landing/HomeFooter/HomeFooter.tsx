import {
  ArrowRight,
  Discord,
  Facebook,
  Github,
  Instagram,
} from "iconoir-react";

import styles from "./HomeFooter.module.scss";

export default function HomeFooter() {
  return (
    <div className={styles.root}>
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
            looking to make a difference – we're looking for you.
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
          Berkeley Alum, ASUC Student Union Board of Directors Chair, ASUC Chief
          Communications Officer, and Berkeley Mobile Product Manager
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

      <div className={styles.footer}>
        <div className={styles.footerColumn}>
          <h6>GET STARTED</h6>
          <ul>
            <li>
              <a href="/catalog">Catalog</a>
            </li>
            <li>
              <a href="/grades">Grades</a>
            </li>
            <li>
              <a href="/enrollment">Enrollment</a>
            </li>
            <li>
              <a href="/scheduler">Scheduler</a>
            </li>
          </ul>
        </div>
        <div className={styles.footerColumn}>
          <h6>SUPPORT</h6>
          <ul>
            <li>
              <a>Report a Bug</a>
            </li>
            <li>
              <a href="mailto:octo.berkeleytime@asuc.org">Contact Us</a>
            </li>
            <li>
              <a href="/releases">Releases</a>
            </li>
            <li>
              <a href="/faq">FAQ</a>
            </li>
          </ul>
        </div>
        <div className={styles.footerColumn}>
          <h6>ABOUT US</h6>
          <ul>
            <li>
              <a href="/about">Our Team</a>
            </li>
            <li>
              <a href="https://octo.asuc.org">ASUC OCTO</a>
            </li>
            <li>
              <a href="/legal/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/legal/terms">Terms of Service</a>
            </li>
          </ul>
        </div>{" "}
        <div className={styles.footerColumn}>
          <h6>SOCIAL</h6>
          <ul>
            <li>
              <a href="https://www.instagram.com/" target="_blank">
                <Instagram />
              </a>
            </li>
            <li>
              <a href="https://discord.gg/uP2bTPh99U">
                <Discord />
              </a>
            </li>
            <li>
              <a href="https://facebook.com/berkeleytime">
                <Facebook />
              </a>
            </li>
            <li>
              <a href="https://github.com/asuc-octo/berkeleytime">
                <Github />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
