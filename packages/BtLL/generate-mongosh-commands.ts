/**
 * Script to generate mongosh commands for inserting PlanRequirement documents
 *
 * Usage:
 *   npx ts-node generate-mongosh-commands.ts > seed-requirements.js
 *
 * Then run the generated commands in mongosh:
 *   mongosh <connection-string> --file seed-requirements.js
 */
import {
  COE_REQ_BTLL,
  EECS_REQ_BTLL,
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
  console.log(
    "// Clear existing official requirements (optional - uncomment if needed)"
  );
  console.log(
    '// db.planrequirements.deleteMany({ isOfficial: true, createdBy: "system" });'
  );
  console.log("");

  for (const req of requirements) {
    console.log(`// ${req.name}`);
    console.log("db.planrequirements.insertOne({");
    console.log(`  code: "${escapeForMongosh(req.code)}",`);
    console.log(`  isUcReq: ${req.isUcReq},`);
    console.log(`  college: ${req.college ? `"${req.college}"` : "null"},`);
    console.log(`  major: ${req.major ? `"${req.major}"` : "null"},`);
    console.log(`  minor: ${req.minor ? `"${req.minor}"` : "null"},`);
    console.log(`  createdBy: "${req.createdBy}",`);
    console.log(`  isOfficial: ${req.isOfficial},`);
    console.log("  createdAt: new Date(),");
    console.log("  updatedAt: new Date()");
    console.log("});");
    console.log("");
  }

  console.log("// Verify insertions");
  console.log("print('Inserted requirements:');");
  console.log(
    "db.planrequirements.find({ isOfficial: true }).forEach(doc => {"
  );
  console.log(
    "  print(`  - ${doc.major || doc.college || 'UC'}: ${doc._id}`);"
  );
  console.log("});");
}

generateMongoshCommands();
