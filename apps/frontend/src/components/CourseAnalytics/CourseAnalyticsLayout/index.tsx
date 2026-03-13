import { ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { NavArrowRight } from "iconoir-react";

import styles from "./CourseAnalyticsLayout.module.scss";

interface CourseAnalyticsLayoutProps {
  isDesktop: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  sidebar: ReactNode;
  children: ReactNode;
}

export function CourseAnalyticsLayout({
  isDesktop,
  drawerOpen,
  onDrawerOpenChange,
  sidebar,
  children,
}: CourseAnalyticsLayoutProps) {
  return (
    <div className={styles.root}>
      {isDesktop ? (
        <div className={styles.panel}>{sidebar}</div>
      ) : (
        <>
          <AnimatePresence>
            {drawerOpen && (
              <motion.div
                className={styles.overlay}
                onClick={() => onDrawerOpenChange(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          <motion.div
            className={styles.drawer}
            animate={{ x: drawerOpen ? 0 : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {sidebar}
          </motion.div>
        </>
      )}

      {!isDesktop && (
        <button
          type="button"
          className={styles.drawerTrigger}
          onClick={() => onDrawerOpenChange(true)}
          aria-label="Open sidebar"
        >
          {!drawerOpen && <NavArrowRight />}
        </button>
      )}

      <div className={styles.view}>
        <div className={styles.viewContent}>{children}</div>
      </div>
    </div>
  );
}

interface CourseAnalyticsSidebarProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function CourseAnalyticsSidebar({
  title,
  children,
  footer,
}: CourseAnalyticsSidebarProps) {
  return (
    <div className={styles.sidebarPanel}>
      <div className={styles.sidebarHeader}>
        <p className={styles.sidebarTitle}>{title}</p>
      </div>
      <div className={styles.sidebarBody}>{children}</div>
      {footer && <div className={styles.sidebarFooter}>{footer}</div>}
    </div>
  );
}

interface CourseAnalyticsFieldProps {
  label: string;
  children: ReactNode;
}

export function CourseAnalyticsField({
  label,
  children,
}: CourseAnalyticsFieldProps) {
  return (
    <div className={styles.formControl}>
      <p className={styles.label}>{label}</p>
      {children}
    </div>
  );
}

interface CourseAnalyticsCardGridProps {
  children: ReactNode;
}

export function CourseAnalyticsCardGrid({
  children,
}: CourseAnalyticsCardGridProps) {
  return <div className={styles.cardGrid}>{children}</div>;
}

interface CourseAnalyticsGraphBoxProps {
  children: ReactNode;
}

export function CourseAnalyticsGraphBox({
  children,
}: CourseAnalyticsGraphBoxProps) {
  return <div className={styles.graphBox}>{children}</div>;
}
