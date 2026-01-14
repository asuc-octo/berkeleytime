import { useCallback, useEffect, useMemo, useState } from "react";

import { useMutation } from "@apollo/client/react";
import _ from "lodash";

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
  GetCourseRatingsDocument,
  GetSemestersWithRatingsDocument,
  GetUserRatingsDocument,
  Semester,
} from "@/lib/generated/graphql";
import { getRatingErrorMessage } from "@/utils/ratingErrorMessages";

// eslint-disable-next-line css-modules/no-unused-class
import profileStyles from "../Profile.module.scss";
import { AddRatingCard, RatingCard } from "./RatingCard";

export default function Ratings() {
  const [ratingForEdit, setRatingForEdit] = useState<IUserRatingClass | null>(
    null
  );
  const [ratingForDelete, setRatingForDelete] =
    useState<IUserRatingClass | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditThankYouOpen, setIsEditThankYouOpen] = useState(false);
  const [isAddThankYouOpen, setIsAddThankYouOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [courseQuery, setCourseQuery] = useState<{
    subject: string;
    courseNumber: string;
  } | null>(null);

  const { ratings, loading, error } = useUserRatings();
  const [createRatingsMutation] = useMutation(CreateRatingsDocument);
  const [deleteRatingsMutation] = useMutation(DeleteRatingsDocument);

  const [pendingEditRating, setPendingEditRating] =
    useState<IUserRatingClass | null>(null);

  const { data: selectedCourse, loading: courseLoading } =
    useReadCourseWithInstructor(
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
    setPendingEditRating(rating);
    setCourseQuery({
      subject: rating.subject,
      courseNumber: rating.courseNumber,
    });
  }, []);

  const handleDeleteClick = useCallback((rating: IUserRatingClass) => {
    setRatingForDelete(rating);
    setIsDeleteModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setRatingForDelete(null);
  }, []);

  const buildRefetchQueries = useCallback((rating: IUserRatingClass) => {
    return [
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

  const handleSubmitAdd = useCallback(
    async (
      metricValues: MetricData,
      termInfo: { semester: Semester; year: number },
      courseInfo: { subject: string; courseNumber: string; classNumber: string }
    ) => {
      const refetchTarget = {
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
    [createRatingsMutation, buildRefetchQueries]
  );

  // Open modal when course data is ready
  useEffect(() => {
    if (pendingEditRating && selectedCourse && !courseLoading) {
      setRatingForEdit(pendingEditRating);
      setIsEditModalOpen(true);
      setPendingEditRating(null);
    }
  }, [pendingEditRating, selectedCourse, courseLoading]);

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
        <div className={profileStyles.ratingsSection}>
          <div className={profileStyles.ratingsHeader}>
            <h2 className={profileStyles.sectionTitle}>Rated classes</h2>
            <button
              className={profileStyles.addRatingButton}
              onClick={openAddModal}
            >
              Add Rating
            </button>
          </div>
          {loading && <p>Loading your ratings...</p>}
          {error && <p>Error loading ratings: {error.message}</p>}
          {ratings.map((rating) => (
            <RatingCard
              key={`${rating.subject}-${rating.courseNumber}-${rating.semester}-${rating.year}-${rating.classNumber}`}
              rating={rating}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
          <AddRatingCard onClick={openAddModal} />
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
      <UserFeedbackModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Add Rating"
        subtitle=""
        showSelectedCourseSubtitle={false}
        onSubmit={handleSubmitAdd}
        onSubmitPopupChange={setIsAddThankYouOpen}
        userRatedClasses={userRatedClasses}
        disableRatedCourses={true}
        onError={(error) => {
          const message = getRatingErrorMessage(error);
          setErrorMessage(message);
          setIsErrorDialogOpen(true);
        }}
      />
      <SubmitRatingPopup
        isOpen={isAddThankYouOpen}
        onClose={() => setIsAddThankYouOpen(false)}
      />
    </div>
  );
}
