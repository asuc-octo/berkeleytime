const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../../../packages/gql-typedefs');
const modulesDir = path.join(__dirname, '../src/modules');

// Get all .ts files from packages/gql-typedefs (excluding index.ts and package.json)
const typedefFiles = fs.readdirSync(sourceDir)
  .filter(file => file.endsWith('.ts') && file !== 'index.ts')
  .map(file => file.replace('.ts', ''))
  .sort();

// Get all module directories from backend/src/modules (excluding non-module directories)
const excludedDirs = ['cache', 'generated-types'];
const moduleDirs = fs.readdirSync(modulesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && !excludedDirs.includes(dirent.name))
  .map(dirent => dirent.name)
  .sort();

// Check for mismatches
const missingTypedefs = moduleDirs.filter(module => !typedefFiles.includes(module));
const missingModules = typedefFiles.filter(typedef => !moduleDirs.includes(typedef));

if (missingTypedefs.length > 0 || missingModules.length > 0) {
  console.error('Error: Mismatch between typedef files and module directories');
  if (missingTypedefs.length > 0) {
    console.error(`  Modules without typedef files: ${missingTypedefs.join(', ')}`);
  }
  if (missingModules.length > 0) {
    console.error(`  Typedef files without modules: ${missingModules.join(', ')}`);
  }
  process.exit(1);
}

// Copy each schema file to its corresponding module's typedefs directory
typedefFiles.forEach((module) => {
  const sourceFile = path.join(sourceDir, `${module}.ts`);
  const targetDir = path.join(modulesDir, module, 'generated-typedefs');
  const targetFile = path.join(targetDir, `${module}.ts`);

  // Create typedefs directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy the file
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
  } else {
    console.error(`Error: ${sourceFile} does not exist`);
    process.exit(1);
  }
});

console.log('Schema files copied successfully');

