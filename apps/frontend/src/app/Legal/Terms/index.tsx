import { Container } from "@repo/theme";

import styles from "./Terms.module.scss";

export default function Terms() {
  return (
    <div className={styles.root}>
      <Container className={styles.container}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lastUpdated}>
          Last updated: {new Date("2025-12-24").toLocaleDateString()}
        </p>

        <p className={styles.content}>
          By accessing this web site, you are agreeing to be bound by these
          Terms of Service, all applicable laws and regulations, and agree that
          you are responsible for compliance with any applicable local laws. If
          you do not agree with any of these terms, you are prohibited from
          using or accessing this site. The materials contained in this web site
          are protected by applicable copyright and trade mark law.
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>Use</h2>
          <p className={styles.content}>
            Permission is granted to temporarily download one copy of the
            materials (information or software) on Berkeleytime's web site for
            personal, non-commercial transitory viewing only. This is the grant
            of a license, not a transfer of title, and under this license you
            may not: a) modify or copy the materials; b) use the materials for
            any commercial purpose, or for any public display (commercial or
            non-commercial); c) attempt to decompile or reverse engineer any
            software contained on Berkeleytime's web site; d) remove any
            copyright or other proprietary notations from the materials; or e)
            transfer the materials to another person or "mirror" the materials
            on any other server. This license shall automatically terminate if
            you violate any of these restrictions and may be terminated by
            Berkeleytime at any time. Upon terminating your viewing of these
            materials or upon the termination of this license, you must destroy
            any downloaded materials in your possession whether in electronic or
            printed format.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Disclaimer</h2>
          <p className={styles.content}>
            The materials on Berkeleytime's web site are provided "as is".
            Berkeleytime makes no warranties, expressed or implied, and hereby
            disclaims and negates all other warranties, including without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights. Further,
            Berkeleytime does not warrant or make any representations concerning
            the accuracy, likely results, or reliability of the use of the
            materials on its Internet web site or otherwise relating to such
            materials or on any sites linked to this site.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Limitations</h2>
          <p className={styles.content}>
            In no event shall Berkeleytime or its suppliers be liable for any
            damages (including, without limitation, damages for loss of data or
            profit, or due to business interruption) arising out of the use or
            inability to use the materials on Berkeleytime's Internet site, even
            if Berkeleytime or a Berkeleytime authorized representative has been
            notified orally or in writing of the possibility of such damage.
            Because some jurisdictions do not allow limitations on implied
            warranties, or limitations of liability for consequential or
            incidental damages, these limitations may not apply to you.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Revisions and Errata</h2>
          <p className={styles.content}>
            The materials appearing on Berkeleytime's web site could include
            technical, typographical, or photographic errors. Berkeleytime does
            not warrant that any of the materials on its web site are accurate,
            complete, or current. Berkeleytime may make changes to the materials
            contained on its web site at any time without notice. Berkeleytime
            does not, however, make any commitment to update the materials.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Site Terms of Use Modifications</h2>
          <p className={styles.content}>
            Berkeleytime may revise these terms of use for its web site at any
            time without notice. By using this web site you are agreeing to be
            bound by the then current version of these Terms of Service.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Governing Law</h2>
          <p className={styles.content}>
            Any claim relating to Berkeleytime's web site shall be governed by
            the laws of the State of California without regard to its conflict
            of law provisions.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Contact</h2>
          <p className={styles.content}>
            If you have any questions about these Terms of Service, please
            contact us at{" "}
            <a href="mailto:octo.berkeleytime@asuc.org">
              octo.berkeleytime@asuc.org
            </a>
            .
          </p>
        </section>
      </Container>
    </div>
  );
}
