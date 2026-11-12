import { Course, coursesEqual } from "./course";
import { JointLeaf, runJointAssignment } from "./course_assignment";
import {
  AndRequirement,
  NCoursesRequirement,
  NumberRequirement,
  OrRequirement,
  Requirement,
} from "./requirement";

// ---------------------------------------------------------------------------
// Leaf extraction
//
// Walk a tree of Requirement objects (produced by BtLL program evaluation)
// and collect the "flexible" leaves — those where the joint matcher can
// decide which courses fill which slot:
//
//   NCoursesRequirement — needs ≥N courses from an eligible list
//   NumberRequirement with a `courses` field — needs ≥T units from a list
//
// Fixed-outcome nodes are skipped:
//   CourseListRequirement — fixed required courses; already met-or-not
//   BooleanRequirement    — no course list involved
//   NumberRequirement without courses — pure aggregate (e.g., total-unit
//     checks computed from sibling accumulators); we leave these stale and
//     flag them for a post-pass (see recomputeAggregates).
// ---------------------------------------------------------------------------

interface ExtractedLeaf {
  joint: JointLeaf; // input to the joint matcher
  // Called after matching to write the result back into the tree node.
  materialize: (assigned: Course[]) => void;
}

function extractLeaves(
  nodes: Requirement[],
  ownerIdx: 0 | 1,
  out: ExtractedLeaf[]
): void {
  for (const node of nodes) {
    const kind = (node as any).type?.data as string | undefined;

    if (kind === "AndRequirement" || kind === "OrRequirement") {
      const children: Requirement[] =
        (node as AndRequirement | OrRequirement).requirements?.data ?? [];
      extractLeaves(children, ownerIdx, out);
      continue;
    }

    if (kind === "NCoursesRequirement") {
      const req = node as NCoursesRequirement;
      const eligible: Course[] = req.courses?.data ?? [];
      const threshold = req.required_count?.data ?? 1;

      out.push({
        joint: { ownerIdx, constraint: { kind: "count", threshold }, eligible },
        materialize: (assigned) => {
          req.courses.data = assigned;
          if (req.actual_count) {
            req.actual_count.data = assigned.length;
          }
          req.result.data = assigned.length >= threshold;
        },
      });
      continue;
    }

    if (kind === "NumberRequirement") {
      const req = node as NumberRequirement;
      // Only flexible if a course list is attached. Without it the node is
      // a pure numeric aggregate (e.g., total_units_check) that recomputes
      // from peer accumulators — we skip it here and let recomputeAggregates
      // handle it as a TODO for a future pass.
      if (!req.courses?.data) continue;

      const eligible: Course[] = req.courses.data;
      const threshold = req.required?.data ?? 0;
      const sumUnits = (cs: Course[]) =>
        cs.reduce((acc, c) => acc + (c.units?.data ?? 0), 0);

      out.push({
        joint: { ownerIdx, constraint: { kind: "units", threshold }, eligible },
        materialize: (assigned) => {
          req.courses!.data = assigned;
          req.actual.data = sumUnits(assigned);
          req.result.data = req.actual.data >= threshold;
        },
      });
      continue;
    }

    // CourseListRequirement and BooleanRequirement: skip (not flexible).
  }
}

// ---------------------------------------------------------------------------
// Aggregate recomputation
//
// After leaf mutation, And/Or nodes whose result depends solely on their
// children's result fields need to be refreshed. Walk post-order so parents
// are updated after their children.
// ---------------------------------------------------------------------------

function recomputeAggregates(nodes: Requirement[]): void {
  for (const node of nodes) {
    const kind = (node as any).type?.data as string | undefined;

    if (kind === "AndRequirement") {
      const req = node as AndRequirement;
      const children: Requirement[] = req.requirements?.data ?? [];
      recomputeAggregates(children);
      req.result.data = children.every((c) => c.result.data);
      continue;
    }

    if (kind === "OrRequirement") {
      const req = node as OrRequirement;
      const children: Requirement[] = req.requirements?.data ?? [];
      recomputeAggregates(children);
      req.result.data = children.some((c) => c.result.data);
      continue;
    }
  }
}

// ---------------------------------------------------------------------------
// runJointReassignment — public entry point
//
// Takes one or two major RequirementResult trees (as produced by the BtLL
// interpreter), computes the jointly-optimal course assignment respecting the
// overlap budget, and mutates the trees in place.
//
// `perMajorTrees` has length 1 for a single major and length 2 for a double
// major. `overlapCap` should be 0 when there is only one major (the
// degenerate case), 2 for a default double major, or 5 for two CoE majors.
// See `computeOverlapCap` in the frontend for the policy.
//
// The function is a no-op when `perMajorTrees` is empty or contains no
// extractable leaves.
// ---------------------------------------------------------------------------

export function runJointReassignment(
  perMajorTrees: Requirement[][],
  overlapCap: number
): void {
  if (perMajorTrees.length === 0) return;

  // Collect all leaves from both trees, tagged by owner index.
  const extracted: ExtractedLeaf[] = [];
  perMajorTrees.forEach((tree, idx) => {
    if (idx > 1) return; // only major 0 and major 1 are modelled
    extractLeaves(tree, idx as 0 | 1, extracted);
  });

  if (extracted.length === 0) return;

  // Run joint optimal matching.
  const jointLeaves = extracted.map((e) => e.joint);
  const assignments = runJointAssignment(jointLeaves, overlapCap);

  // Materialize: write each assignment back into its tree node, then
  // recompute ancestor And/Or result fields.
  assignments.forEach((assigned, i) => {
    extracted[i].materialize(assigned);
  });

  perMajorTrees.forEach((tree) => recomputeAggregates(tree));
}

// ---------------------------------------------------------------------------
// computeOverlapCap — Berkeley double-major overlap policy
//
// Default: at most 2 upper-division (100–199) courses may count toward both
// majors. Applies to L&S, CDSS, Haas, College of Chemistry, CED, Rausser,
// and any cross-college (simultaneous degree) pairing.
//
// Exception: both majors in the College of Engineering → cap = 5.
//
// Lower-division (1–99) overlap is unconstrained (free, no budget cost).
//
// Known simplifications — intentionally not modelled:
//   - CoE's "≥5 distinct UD technical courses ≥3 units per major" check
//   - Joint majors (EECS, Math+CS, ChemE) — must be filtered upstream
//   - Administratively disallowed pairs
//   - Department-level rules tighter than college policy
//   - Major+minor and 3+ major cases (this function is major+major only)
// ---------------------------------------------------------------------------

export function computeOverlapCap(
  majors: string[],
  colleges: string[]
): number {
  if (majors.length !== 2) return 0;

  const coeCount = colleges.filter(
    (c) => c === "College of Engineering"
  ).length;
  if (coeCount >= 2) return 5;

  return 2;
}

// Re-export for consumers that import from this module.
export type { JointLeaf };
export { coursesEqual };
