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
  CDSS_REQ_BTLL,
  EECS_REQ_BTLL,
  MECHE_REQ_BTLL,
  DATASCI_REQ_BTLL,
  COMPSCI_REQ_BTLL,
  DATASCI_DE_APPLIED_MATH_BTLL,
  DATASCI_DE_BIOINFORMATICS_BTLL,
  DATASCI_DE_BUSINESS_INDUSTRIAL_ANALYTICS_BTLL,
  DATASCI_DE_COGNITION_BTLL,
  DATASCI_DE_DATA_ARTS_HUMANITIES_BTLL,
  DATASCI_DE_ECOLOGY_ENVIRONMENT_BTLL,
  DATASCI_DE_ECONOMICS_BTLL,
  DATASCI_DE_EDUCATION_BTLL,
  DATASCI_DE_ENVIRONMENT_RESOURCE_SOCIETY_BTLL,
  DATASCI_DE_EVOLUTION_BIODIVERSITY_BTLL,
  DATASCI_DE_GEOSPATIAL_BTLL,
  DATASCI_DE_HUMAN_POPULATION_HEALTH_BTLL,
  DATASCI_DE_HUMAN_BEHAVIOR_PSYCHOLOGY_BTLL,
  DATASCI_DE_INEQUALITIES_IN_SOCIETY_BTLL,
  DATASCI_DE_LINGUISTIC_SCIENCES_BTLL,
  DATASCI_DE_NEUROSCIENCE_BTLL,
  DATASCI_DE_ORGANIZATIONS_ECONOMY_BTLL,
  DATASCI_DE_PHILOSOPHICAL_FOUNDATIONS_EVIDENCE_BTLL,
  DATASCI_DE_PHILOSOPHICAL_FOUNDATIONS_MINDS_BTLL,
  DATASCI_DE_PHYSICAL_SCIENCE_ANALYTICS_BTLL,
  DATASCI_DE_QUANTITATIVE_SOCIAL_SCIENCE_BTLL,
  DATASCI_DE_ROBOTICS_BTLL,
  DATASCI_DE_SCIENCE_TECHNOLOGY_SOCIETY_BTLL,
  DATASCI_DE_SOCIAL_WELFARE_HEALTH_POVERTY_BTLL,
  DATASCI_DE_SOCIAL_POLICY_LAW_BTLL,
  DATASCI_DE_SUSTAINABLE_DEVELOPMENT_ENGINEERING_BTLL,
  DATASCI_DE_URBAN_SCIENCE_BTLL,
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
    name: "College of Computing, Data Science, and Society Requirements",
    code: CDSS_REQ_BTLL,
    isUcReq: false,
    college: "CDSS",
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
  {
    name: "Computer Science (COMPSCI) Major Requirements",
    code: COMPSCI_REQ_BTLL,
    isUcReq: false,
    college: null,
    major: "Computer Science",
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science (DATASCI) Major Requirements",
    code: DATASCI_REQ_BTLL,
    isUcReq: false,
    college: null,
    major: "Data Science",
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Applied Math Domain Emphasis",
    code: DATASCI_DE_APPLIED_MATH_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Computational Methods in Molecular and Genomic Biology Domain Emphasis",
    code: DATASCI_DE_BIOINFORMATICS_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Business and Industrial Analytics Domain Emphasis",
    code: DATASCI_DE_BUSINESS_INDUSTRIAL_ANALYTICS_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Cognition Domain Emphasis",
    code: DATASCI_DE_COGNITION_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Data Arts and Humanities Domain Emphasis",
    code: DATASCI_DE_DATA_ARTS_HUMANITIES_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Ecology and Environment Domain Emphasis",
    code: DATASCI_DE_ECOLOGY_ENVIRONMENT_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Economics Domain Emphasis",
    code: DATASCI_DE_ECONOMICS_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Education Domain Emphasis",
    code: DATASCI_DE_EDUCATION_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Environment, Resource Management, and Society Domain Emphasis",
    code: DATASCI_DE_ENVIRONMENT_RESOURCE_SOCIETY_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Evolution and Biodiversity Domain Emphasis",
    code: DATASCI_DE_EVOLUTION_BIODIVERSITY_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Geospatial Information and Technology Domain Emphasis",
    code: DATASCI_DE_GEOSPATIAL_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Human and Population Health Domain Emphasis",
    code: DATASCI_DE_HUMAN_POPULATION_HEALTH_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Human Behavior and Psychology Domain Emphasis",
    code: DATASCI_DE_HUMAN_BEHAVIOR_PSYCHOLOGY_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Inequalities in Society Domain Emphasis",
    code: DATASCI_DE_INEQUALITIES_IN_SOCIETY_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Linguistic Sciences Domain Emphasis",
    code: DATASCI_DE_LINGUISTIC_SCIENCES_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Neuroscience Domain Emphasis",
    code: DATASCI_DE_NEUROSCIENCE_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Organizations and the Economy Domain Emphasis",
    code: DATASCI_DE_ORGANIZATIONS_ECONOMY_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Philosophical Foundations: Evidence and Inference Domain Emphasis",
    code: DATASCI_DE_PHILOSOPHICAL_FOUNDATIONS_EVIDENCE_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Philosophical Foundations: Minds, Morals, and Machines Domain Emphasis",
    code: DATASCI_DE_PHILOSOPHICAL_FOUNDATIONS_MINDS_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Physical Science Analytics Domain Emphasis",
    code: DATASCI_DE_PHYSICAL_SCIENCE_ANALYTICS_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Quantitative Social Science Domain Emphasis",
    code: DATASCI_DE_QUANTITATIVE_SOCIAL_SCIENCE_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Robotics Domain Emphasis",
    code: DATASCI_DE_ROBOTICS_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Science, Technology, and Society Domain Emphasis",
    code: DATASCI_DE_SCIENCE_TECHNOLOGY_SOCIETY_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Social Welfare, Health, and Poverty Domain Emphasis",
    code: DATASCI_DE_SOCIAL_WELFARE_HEALTH_POVERTY_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Social Policy and Law Domain Emphasis",
    code: DATASCI_DE_SOCIAL_POLICY_LAW_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Sustainable Development and Engineering Domain Emphasis",
    code: DATASCI_DE_SUSTAINABLE_DEVELOPMENT_ENGINEERING_BTLL,
    isUcReq: false,
    college: null,
    major: null,
    minor: null,
    createdBy: "system",
    isOfficial: true,
  },
  {
    name: "Data Science: Urban Science Domain Emphasis",
    code: DATASCI_DE_URBAN_SCIENCE_BTLL,
    isUcReq: false,
    college: null,
    major: null,
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
