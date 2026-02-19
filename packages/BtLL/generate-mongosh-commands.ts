/**
 * Script to generate mongosh commands for inserting PlanRequirement documents
 *
 * Usage:
 *   npx tsx generate-mongosh-commands.ts > seed-requirements.js
 *
 * Then run the generated commands in mongosh:
 *   mongosh <connection-string> --file seed-requirements.js
 */
import {
  COE_REQ_BTLL,
  EECS_REQ_BTLL,
  MECHE_REQ_BTLL,
  UC_REQ_BTLL,
} from "./reference_gradtrak_reqs";

interface PlanRequirementSeed {
  code: string;
  isUcReq: boolean;
  college: string | null;
  major: string | null;
  minor: string | null;
  createdBy: string;
  isOfficial: boolean;
  name: string; // For documentation purposes
}

const requirements: PlanRequirementSeed[] = [
  {
    name: "UC Requirements",
    code: UC_REQ_BTLL,
    isUcReq: true,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "College of Engineering Requirements",
    code: COE_REQ_BTLL,
    isUcReq: false,
    college: "CoE",
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "EECS Major Requirements",
    code: EECS_REQ_BTLL,
    isUcReq: false,
    college: null,
    major: "Electrical Engineering & Computer Sciences (EECS)",
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Mechanical Engineering (MECHE) Major Requirements",
    code: MECHE_REQ_BTLL,
    isUcReq: false,
    college: null,
    major: "Mechanical Engineering",
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
];

function escapeForMongosh(str: string): string {
  // Escape backslashes, quotes, and handle newlines for mongosh
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function generateMongoshCommands(): void {
  console.log(
    "// Auto-generated mongosh commands for seeding PlanRequirement documents"
  );
  console.log("// Generated at:", new Date().toISOString());
  console.log("");
  console.log("// Switch to the correct database (update if needed)");
  console.log('use("bt");');
  console.log("");
  for (const req of requirements) {
    console.log(`// ${req.name}`);
    console.log("db.planrequirements.updateOne(");
    console.log(
      `  { name: "${escapeForMongosh(req.name)}", isOfficial: ${req.isOfficial}, createdBy: "${req.createdBy}" },`
    );
    console.log("  {");
    console.log("    $set: {");
    console.log(`      code: "${escapeForMongosh(req.code)}",`);
    console.log(`      isUcReq: ${req.isUcReq},`);
    console.log(`      college: ${req.college ? `"${req.college}"` : "null"},`);
    console.log(`      major: ${req.major ? `"${req.major}"` : "null"},`);
    console.log(`      minor: ${req.minor ? `"${req.minor}"` : "null"},`);
    console.log("      updatedAt: new Date()");
    console.log("    },");
    console.log("    $setOnInsert: { createdAt: new Date() }");
    console.log("  },");
    console.log("  { upsert: true }");
    console.log(");");
    console.log("");
  }

  console.log("// Verify upserts");
  console.log("print('Current official requirements:');");
  console.log(
    "db.planrequirements.find({ isOfficial: true }).forEach(doc => {"
  );
  console.log(
    "  print(`  - ${doc.major || doc.college || 'UC'}: ${doc._id}`);"
  );
  console.log("});");
}

generateMongoshCommands();
