import { useCallback, useEffect, useMemo, useState } from "react";

import { useMutation } from "@apollo/client/react";
import { Search } from "iconoir-react";
import _ from "lodash";

import { Grid } from "@repo/theme";

import {
  DeleteRatingPopup,
  ErrorDialog,
  SubmitRatingPopup,
} from "@/components/Class/Ratings/RatingDialog";
import UserFeedbackModal from "@/components/Class/Ratings/UserFeedbackModal";
import {
  MetricData,
  formatInstructorText,
} from "@/components/Class/Ratings/metricsUtil";
import {
  deleteRating as deleteRatingHelper,
  submitRating as submitRatingHelper,
} from "@/components/Class/Ratings/ratingMutations";
import { useReadCourseWithInstructor } from "@/hooks/api";
import { useUserRatings } from "@/hooks/api/ratings";
import { IUserRatingClass } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import {
  CreateRatingsDocument,
  DeleteRatingsDocument,
  GetClassDocument,
  GetCourseRatingsDocument,
  GetSemestersWithRatingsDocument,
  GetUserRatingsDocument,
  Semester,
} from "@/lib/generated/graphql";
import { getRatingErrorMessage } from "@/utils/ratingErrorMessages";

import { RatingCard } from "./RatingCard";
import styles from "./Ratings.module.scss";
import profileStyles from "../Profile.module.scss";

export default function Ratings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingForEdit, setRatingForEdit] = useState<IUserRatingClass | null>(
    null
  );
  const [ratingForDelete, setRatingForDelete] =
    useState<IUserRatingClass | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditThankYouOpen, setIsEditThankYouOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [courseQuery, setCourseQuery] = useState<{
    subject: string;
    courseNumber: string;
  } | null>(null);

  const { ratings, loading, error } = useUserRatings();
  const [createRatingsMutation] = useMutation(CreateRatingsDocument);
  const [deleteRatingsMutation] = useMutation(DeleteRatingsDocument);

  const { data: selectedCourse } = useReadCourseWithInstructor(
    courseQuery?.subject ?? "",
    courseQuery?.courseNumber ?? "",
    {
      skip: !courseQuery,
    }
  );

  // Preload rating links when ratings are available
  useEffect(() => {
    if (!ratings?.length) return;

    ratings.forEach((rating) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = `/catalog/${rating.year}/${rating.semester}/${rating.subject}/${rating.courseNumber}/${rating.classNumber}/ratings`;
      document.head.appendChild(link);
    });

    // Cleanup function to remove prefetch links
    return () => {
      const links = document.head.querySelectorAll('link[rel="prefetch"]');
      links.forEach((link) => link.remove());
    };
  }, [ratings]);

  const filteredRatings = useMemo(() => {
    if (!ratings) return [];
    if (!searchQuery.trim()) return ratings;

    const query = searchQuery.toLowerCase().trim();
    return ratings.filter((rating) => {
      const searchableText =
        `${rating.subject} ${rating.courseNumber} ${rating.semester} ${rating.year}`.toLowerCase();
      return searchableText.includes(query);
    });
  }, [ratings, searchQuery]);

  const userRatedClasses = useMemo(() => {
    const seen = new Set<string>();
    return ratings
      .map((rating) => ({
        subject: rating.subject,
        courseNumber: rating.courseNumber,
      }))
      .filter((cls) => {
        const key = `${cls.subject}-${cls.courseNumber}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [ratings]);

  const availableTerms = useMemo(() => {
    if (!selectedCourse?.classes) return [];

    const courseTerms = selectedCourse.classes
      .toSorted(sortByTermDescending)
      .filter((c) => c.anyPrintInScheduleOfClasses !== false)
      .filter((c) => {
        if (c.primarySection?.startDate) {
          const startDate = new Date(c.primarySection.startDate);
          return startDate <= new Date();
        }
        return true;
      })
      .map((c) => {
        const value = `${c.semester} ${c.year} ${c.number}`;
        return {
          value,
          label: `${c.semester} ${c.year} ${formatInstructorText(c.primarySection)}`,
          semester: c.semester as Semester,
          year: c.year,
          classNumber: c.number,
        };
      });

    return _.uniqBy(courseTerms, (term) => term.value);
  }, [selectedCourse]);

  const currentClassForModal = useMemo(() => {
    if (!ratingForEdit) return null;
    return {
      subject: ratingForEdit.subject,
      courseNumber: ratingForEdit.courseNumber,
      number: ratingForEdit.classNumber,
      semester: ratingForEdit.semester,
      year: ratingForEdit.year,
    };
  }, [ratingForEdit]);

  const handleEditClick = useCallback((rating: IUserRatingClass) => {
    setRatingForEdit(rating);
    setCourseQuery({
      subject: rating.subject,
      courseNumber: rating.courseNumber,
    });
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((rating: IUserRatingClass) => {
    setRatingForDelete(rating);
    setIsDeleteModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setRatingForDelete(null);
  }, []);

  const buildRefetchQueries = useCallback((rating: IUserRatingClass) => {
    return [
      {
        query: GetClassDocument,
        variables: {
          year: rating.year,
          semester: rating.semester,
          subject: rating.subject,
          courseNumber: rating.courseNumber,
          number: rating.classNumber,
          sessionId: null,
        },
      },
      {
        query: GetCourseRatingsDocument,
        variables: {
          subject: rating.subject,
          number: rating.courseNumber,
        },
      },
      {
        query: GetSemestersWithRatingsDocument,
        variables: {
          subject: rating.subject,
          courseNumber: rating.courseNumber,
        },
      },
      { query: GetUserRatingsDocument },
    ];
  }, []);

  const handleSubmitEdit = useCallback(
    async (
      metricValues: MetricData,
      termInfo: { semester: Semester; year: number },
      courseInfo: { subject: string; courseNumber: string; classNumber: string }
    ) => {
      if (!ratingForEdit) return;

      const refetchTarget = {
        ...ratingForEdit,
        subject: courseInfo.subject,
        courseNumber: courseInfo.courseNumber,
        classNumber: courseInfo.classNumber,
        semester: termInfo.semester,
        year: termInfo.year,
      } as IUserRatingClass;

      await submitRatingHelper({
        metricValues,
        termInfo,
        createRatingsMutation,
        classIdentifiers: {
          subject: courseInfo.subject,
          courseNumber: courseInfo.courseNumber,
          number: courseInfo.classNumber,
        },
        refetchQueries: buildRefetchQueries(refetchTarget),
      });
    },
    [ratingForEdit, createRatingsMutation, buildRefetchQueries]
  );

  useEffect(() => {
    if (!isEditModalOpen && !isEditThankYouOpen) {
      setRatingForEdit(null);
      setCourseQuery(null);
    }
  }, [isEditModalOpen, isEditThankYouOpen]);

  const handleConfirmDelete = useCallback(async () => {
    if (!ratingForDelete) return;
    try {
      await deleteRatingHelper({
        deleteRatingsMutation,
        classIdentifiers: {
          subject: ratingForDelete.subject,
          courseNumber: ratingForDelete.courseNumber,
          number: ratingForDelete.classNumber,
        },
        refetchQueries: buildRefetchQueries(ratingForDelete),
      });
      closeDeleteModal();
    } catch (err) {
      const message = getRatingErrorMessage(err);
      setErrorMessage(message);
      setIsErrorDialogOpen(true);
    }
  }, [
    ratingForDelete,
    deleteRatingsMutation,
    buildRefetchQueries,
    closeDeleteModal,
  ]);

  return (
    <div className={profileStyles.contentInner}>
      <h1 className={profileStyles.pageTitle}>Ratings</h1>
      <div className={profileStyles.pageContent}>
        <div className={styles.root}>
          <div className={styles.searchGroup}>
            <label htmlFor="ratingsSearch" className={styles.searchIcon}>
              <Search />
            </label>
            <input
              id="ratingsSearch"
              className={styles.searchInput}
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search Ratings..."
              autoComplete="off"
            />
          </div>

          {loading && <p>Loading your ratings...</p>}
          {error && <p>Error loading ratings: {error.message}</p>}
          {filteredRatings.length === 0 && searchQuery && !loading && (
            <p>No ratings found matching "{searchQuery}"</p>
          )}
          {filteredRatings.length > 0 && (
            <Grid
              gap="17px"
              width="100%"
              columns="repeat(auto-fit, 345px)"
              style={{ marginBottom: 40 }}
            >
              {filteredRatings.map((rating) => (
                <RatingCard
                  key={`${rating.subject}-${rating.courseNumber}-${rating.semester}-${rating.year}-${rating.classNumber}`}
                  rating={rating}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </Grid>
          )}
        </div>
      </div>
      {ratingForEdit && currentClassForModal && (
        <UserFeedbackModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          title="Edit Rating"
          subtitle=""
          showSelectedCourseSubtitle={false}
          initialCourse={
            currentClassForModal
              ? {
                  subject: currentClassForModal.subject,
                  number: currentClassForModal.courseNumber,
                  courseId: "",
                }
              : null
          }
          availableTerms={availableTerms}
          onSubmit={async (metricValues, termInfo, courseInfo) => {
            await handleSubmitEdit(metricValues, termInfo, courseInfo);
          }}
          initialUserClass={ratingForEdit}
          onSubmitPopupChange={setIsEditThankYouOpen}
          userRatedClasses={userRatedClasses}
          disableRatedCourses={false}
          lockedCourse={{
            subject: currentClassForModal.subject,
            number: currentClassForModal.courseNumber,
            courseId: "",
          }}
          onError={(error) => {
            const message = getRatingErrorMessage(error);
            setErrorMessage(message);
            setIsErrorDialogOpen(true);
          }}
        />
      )}
      <DeleteRatingPopup
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirmDelete={handleConfirmDelete}
      />
      <ErrorDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        errorMessage={errorMessage}
      />
      <SubmitRatingPopup
        isOpen={isEditThankYouOpen}
        onClose={() => setIsEditThankYouOpen(false)}
      />
    </div>
  );
}
