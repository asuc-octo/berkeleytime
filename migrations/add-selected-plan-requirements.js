/**
 * Migration: Add selectedPlanRequirements to existing plans.
 *
 * Populates selectedPlanRequirements for each plan based on their majors, minors, and colleges:
 * - UC requirements (isUcReq = true)
 * - College requirements for each college in plan.colleges
 * - Major/minor requirements for plan.majors and plan.minors
 *
 * Run with mongosh (connect to your MongoDB, then load this file or paste its contents):
 *
 *   mongosh "<connection-string>" migrations/add-selected-plan-requirements.js
 *
 * Or from mongosh:
 *   load("migrations/add-selected-plan-requirements.js")
 */

use("bt");

const plans = db.plans.find({});
let updated = 0;

console.log("Updating " + plans.count() + " plans...");

while (plans.hasNext()) {
  const plan = plans.next();
  const majors = plan.majors || [];
  const minors = plan.minors || [];
  const colleges = plan.colleges || [];

  const reqIds = new Set();

  // UC requirements
  const ucReq = db.planrequirements.findOne({ isUcReq: true, isOfficial: true });
  if (ucReq) {
    reqIds.add(ucReq._id.toString());
  }

  // College requirements
  for (const college of colleges) {
    const collegeReq = db.planrequirements.findOne({ college, isOfficial: true });
    if (collegeReq) {
      reqIds.add(collegeReq._id.toString());
    }
  }

  // Major/minor requirements
  db.planrequirements
    .find({
      $or: [
        { major: { $in: majors } },
        { minor: { $in: minors } },
      ],
      isOfficial: true,
    })
    .forEach((r) => {
      reqIds.add(r._id.toString());
    });

  const selectedPlanRequirements = Array.from(reqIds).map((id) => ({
    planRequirementId: ObjectId(id),
    manualOverrides: [],
  }));

  db.plans.updateOne(
    { _id: plan._id },
    { $set: { selectedPlanRequirements } }
  );
  updated++;
  print("Updated plan " + plan.userEmail + " with " + selectedPlanRequirements.length + " selected requirement(s).");
}

print("Done. Updated " + updated + " plan(s).");
