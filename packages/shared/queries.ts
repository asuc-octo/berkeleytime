/**
 * Shared GraphQL queries used across frontend and backend.
 * Ensures parity between client requests and server-side cache warming.
 */

/**
 * Canonical catalog query for fetching class listings.
 *
 * IMPORTANT: This query is used for:
 * - Frontend: User-facing class catalog browsing
 * - Backend: Cache warming via Apollo executeOperation
 *
 * The operation name "GetCanonicalCatalog" is checked by backend's
 * generateCacheKey to enable deterministic caching.
 *
 * DO NOT:
 * - Change the operation name (breaks backend cache key generation)
 * - Add search/filter parameters here (use separate query for that)
 *
 * This query is cached with key: catalog:{year}-{semester}
 */
export const GET_CANONICAL_CATALOG_QUERY = `
  query GetCanonicalCatalog($year: Int!, $semester: Semester!) {
    catalog(year: $year, semester: $semester) {
      termId
      sessionId
      courseId
      subject
      courseNumber
      number
      title
      unitsMax
      unitsMin
      finalExam
      gradingBasis
      primarySection {
        component
        online
        instructionMode
        attendanceRequired
        lecturesRecorded
        sectionAttributes {
          attribute {
            code
            description
            formalDescription
          }
          value {
            code
            description
            formalDescription
          }
        }
        enrollment {
          latest {
            time
            status
            enrolledCount
            maxEnroll
            waitlistedCount
            maxWaitlist
          }
        }
        meetings {
          days
        }
      }
      course {
        subject
        number
        title
        gradeDistribution {
          average
          pnpPercentage
        }
        academicCareer
      }
      requirementDesignation {
        code
        description
        formalDescription
      }
    }
  }
`;
