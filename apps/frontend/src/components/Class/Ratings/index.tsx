import React, { useState, useContext, useEffect } from 'react';
import { NavArrowDown } from 'iconoir-react';
import * as Tooltip from "@radix-ui/react-tooltip";
import { Container, Button } from "@repo/theme";
import { UserFeedbackModal } from '@/components/UserFeedbackModal';
import ClassContext from "@/contexts/ClassContext";
import styles from './Ratings.module.scss';

interface TooltipContentProps {
  title: string;
  description: string;
}

const TooltipContent: React.FC<TooltipContentProps> = ({ title, description }) => (
  <div>
    <h4 className={styles.tooltipTitle}>{title}</h4>
    <p className={styles.tooltipDescription}>{description}</p>
  </div>
);

interface RatingDetailProps {
  title: string;
  tooltip: string;
  stats: {
    rating: number;
    percentage: number;
  }[];
  status: string;
  statusColor: string;
  reviewCount: number;
}

const RatingDetail: React.FC<RatingDetailProps> = ({ 
  title, 
  tooltip,
  stats, 
  status,
  statusColor,
  reviewCount
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExpanded) {
      setShouldAnimate(false);
      // Using requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        timer = setTimeout(() => {
          setShouldAnimate(true);
        }, 50);
      });
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isExpanded]);

  return (
    <div className={styles.ratingSection}>
      <div 
        className={styles.ratingHeader} 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span className={styles.info}>ⓘ</span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className={styles.tooltipContent}
                side="bottom"
                sideOffset={8}
                collisionPadding={8}
              >
                <Tooltip.Arrow className={styles.arrow} />
                <TooltipContent title={title} description={tooltip} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
        <div className={styles.statusSection}>
          <span className={styles[statusColor]}>{status}</span>
          <span className={styles.reviewCount}>
            ({reviewCount} reviews)
          </span>
          <NavArrowDown 
            className={`${styles.arrow} ${isExpanded ? styles.expanded : ''}`} 
          />
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles.ratingContent}>
          {stats.map((stat, index) => (
            <div 
              key={stat.rating} 
              className={styles.statRow} 
              style={{ '--delay': `${index * 60}ms` } as React.CSSProperties}
            >
              <span className={styles.rating}>{stat.rating}</span>
              <div className={styles.barContainer}>
                <div 
                  className={styles.bar}
                  style={{ 
                    width: shouldAnimate ? `${stat.percentage}%` : '0%',
                    transitionDelay: `${index * 60}ms`
                  }}
                />
              </div>
              <span className={styles.percentage}>
                {shouldAnimate ? `${stat.percentage}%` : '0%'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Ratings() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { class: currentClass } = useContext(ClassContext);

  const ratingsData = [
    {
      title: "Usefulness",
      tooltip: "This refers to how beneficial a course is in helping students achieve their academic, professional, or personal goals.",
      stats: [
        { rating: 5, percentage: 56 },
        { rating: 4, percentage: 16 },
        { rating: 3, percentage: 11 },
        { rating: 2, percentage: 6 },
        { rating: 1, percentage: 11 }
      ],
      status: "Very Useful",
      statusColor: "statusGreen",
      reviewCount: 218
    },
    {
      title: "Difficulty",
      tooltip: "This indicates the level of challenge students experience in understanding and completing course material.",
      stats: [
        { rating: 5, percentage: 30 },
        { rating: 4, percentage: 40 },
        { rating: 3, percentage: 20 },
        { rating: 2, percentage: 5 },
        { rating: 1, percentage: 5 }
      ],
      status: "Moderately Difficult",
      statusColor: "statusOrange",
      reviewCount: 218
    },
    {
      title: "Workload",
      tooltip: "This represents the time and effort required to complete course assignments, readings, and other activities.",
      stats: [
        { rating: 5, percentage: 25 },
        { rating: 4, percentage: 35 },
        { rating: 3, percentage: 25 },
        { rating: 2, percentage: 10 },
        { rating: 1, percentage: 5 }
      ],
      status: "Moderately Workload",
      statusColor: "statusOrange",
      reviewCount: 218
    }
  ];

  return (
    <div className={styles.root}>
      <Container size="sm">
        <div className={styles.header}>
          <Button onClick={() => setModalOpen(true)}>Add a review</Button>
        </div>
        <div className={styles.ratingsContainer}>
          {ratingsData.map((ratingData) => (
            <RatingDetail 
              key={ratingData.title}
              {...ratingData}
            />
          ))}
        </div>

        <UserFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Rate Course"
          subtitle={`${currentClass.subject} ${currentClass.courseNumber} • ${currentClass.semester} ${currentClass.year}`}
          currentClass={currentClass}
        />
      </Container>
    </div>
  );
}