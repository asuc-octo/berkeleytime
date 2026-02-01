import { Types } from "mongoose";

import { PlanModel } from "@repo/common/models";

import { GradTrakAnalyticsDataPoint } from "../../../generated-types/graphql";
import { RequestContext } from "../../../types/request-context";
import { requireStaffAuth } from "../helpers/staff-auth";

export async function getGradTrakAnalyticsData(
  context: RequestContext
): Promise<GradTrakAnalyticsDataPoint[]> {
  await requireStaffAuth(context);

  // Get all plans with their data
  const plans = await PlanModel.find({}).lean();

  return plans.map((plan) => {
    // Calculate total courses across all plan terms
    const totalCourses = plan.planTerms.reduce(
      (sum, term) => sum + (term.courses?.length || 0),
      0
    );

    // Find the earliest year from plan terms (excluding misc which has year -1)
    const years = plan.planTerms
      .map((term) => term.year)
      .filter((year) => year > 0);
    const startYear = years.length > 0 ? Math.min(...years) : null;

    return {
      planId: (plan._id as Types.ObjectId).toString(),
      userEmail: plan.userEmail || "",
      majors: plan.majors || [],
      minors: plan.minors || [],
      colleges: plan.colleges || [],
      totalCourses,
      startYear,
      createdAt: plan.createdAt?.toISOString() || new Date().toISOString(),
    };
  });
}
