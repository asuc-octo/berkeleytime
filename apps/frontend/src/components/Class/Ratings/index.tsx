import React, { useState, useContext, useEffect } from 'react';
import { NavArrowDown } from 'iconoir-react';
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Dialog from "@radix-ui/react-dialog";
import { Container, Button } from "@repo/theme";
import styles from './Ratings.module.scss';
import ClassContext from "@/contexts/ClassContext";

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
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Start animation slightly after expansion
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 200); // Delay to match the slideDown animation
      return () => {
        clearTimeout(timer);
        setShouldAnimate(false);
      };
    }
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
                    transitionDelay: `${index * 100}ms`
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

function RatingModal() {
  const { class: currentClass } = useContext(ClassContext);
  const [ratings, setRatings] = useState({
    usefulness: 0,
    difficulty: 0,
    workload: 0
  });

  const handleRatingClick = (type: 'usefulness' | 'difficulty' | 'workload', value: number) => {
    setRatings(prev => ({
      ...prev,
      [type]: value,
      [type]: prev[type] === value ? 0 : value
    }));
  };

  const getRatingButtonClass = (type: 'usefulness' | 'difficulty' | 'workload', value: number) => {
    return `${styles.ratingButton} ${ratings[type] === value ? styles.selected : ''}`;
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content className={styles.modal}>
        <div className={styles.modalHeader}>
          <Dialog.Title className={styles.modalTitle}>
            Rate Course
          </Dialog.Title>
          <Dialog.Description className={styles.modalSubtitle}>
            {currentClass.subject} {currentClass.courseNumber} • {currentClass.semester} {currentClass.year}
          </Dialog.Description>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.ratingQuestion}>
            <h3>1. How would you rate the usefulness of this course?</h3>
            <div className={styles.ratingScale}>
              <span>Not useful</span>
              <div className={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    className={getRatingButtonClass('usefulness', value)}
                    onClick={() => handleRatingClick('usefulness', value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span>Very useful</span>
            </div>
          </div>

          <div className={styles.ratingQuestion}>
            <h3>2. How would you rate the difficulty of this course?</h3>
            <div className={styles.ratingScale}>
              <span>Very easy</span>
              <div className={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    className={getRatingButtonClass('difficulty', value)}
                    onClick={() => handleRatingClick('difficulty', value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span>Very difficult</span>
            </div>
          </div>

          <div className={styles.ratingQuestion}>
            <h3>3. How would you rate the workload of this course?</h3>
            <div className={styles.ratingScale}>
              <span>Very light</span>
              <div className={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    className={getRatingButtonClass('workload', value)}
                    onClick={() => handleRatingClick('workload', value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span>Very heavy</span>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Dialog.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Button>Submit Rating</Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export default function Ratings() {
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
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button>Add a review</Button>
            </Dialog.Trigger>
            <RatingModal />
          </Dialog.Root>
        </div>
        <div className={styles.ratingsContainer}>
          {ratingsData.map((ratingData) => (
            <RatingDetail 
              key={ratingData.title}
              {...ratingData}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}