#!/opt/homebrew/bin/bash

# This script is used to update the <api>-schema.d.ts files in ./common/types/ directory

declare -A swaggerFilePaths # Create an associative array to store the schema file paths
swaggerFilePaths["classes"]=https://developers.api.berkeley.edu/api/18/interactive-docs/classes-latest
swaggerFilePaths["courses"]=https://developers.api.berkeley.edu/api/100/interactive-docs/courses-latest 

for targetFile in "${!swaggerFilePaths[@]}"
do
    echo "Updating $targetFile schema file..."
    echo "Fetching schema from ${swaggerFilePaths[$targetFile]}"
    npx openapi-typescript ${swaggerFilePaths[$targetFile]} -o ./common/types/api/$targetFile-schema.d.ts
done