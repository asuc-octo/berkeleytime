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
export const GET_CANONICAL_CATALOG_QUERY = /* GraphQL */ `
  query GetCanonicalCatalog($year: Int!, $semester: Semester!) {
    catalog(year: $year, semester: $semester) {
      courseId
      subject
      courseNumber
      number
      title
      unitsMax
      unitsMin
      gradingBasis
      primarySection {
        online
        sectionAttributes(attributeCode: "GE") {
          attribute {
            code
          }
          value {
            description
          }
        }
        enrollment {
          latest {
            endTime
            status
            enrolledCount
            maxEnroll
            reservedSeatingMaxCount
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
