import { Link } from "react-router-dom";

import { Flex, Text } from "@repo/theme";

import Carousel from "@/components/Carousel";
import ClassCard from "@/components/ClassCard";
import ClassDrawer from "@/components/ClassDrawer";
import useUser from "@/hooks/useUser";

import accountStyles from "../Account/Account.module.scss";
import styles from "../Profile.module.scss";

export default function Bookmarks() {
  const { user } = useUser();

  return (
    <div className={styles.contentInner}>
      <h1 className={styles.pageTitle}>Bookmarks</h1>
      <div className={styles.pageContent}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Bookmarked Classes</h2>
          {user && (
            <Carousel.CarouselNoTitle>
              {user.bookmarkedClasses.length === 0 ? (
                <Carousel.Item>
                  <Flex
                    align="center"
                    justify="center"
                    className={accountStyles.classesPlaceholder}
                  >
                    <Text>No bookmarked classes</Text>
                  </Flex>
                </Carousel.Item>
              ) : (
                user.bookmarkedClasses.map((bookmarkedClass, index) => (
                  <Carousel.Item key={index}>
                    <ClassDrawer {...bookmarkedClass}>
                      <ClassCard class={bookmarkedClass} />
                    </ClassDrawer>
                  </Carousel.Item>
                ))
              )}
            </Carousel.CarouselNoTitle>
          )}
          <Link to={"/catalog"} className={accountStyles.afterCarouselLink}>
            View Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
