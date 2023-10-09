#!/usr/bin/env bash
# The above line will use the first `bash` in the PATH of the system used to run this script.

# This script is used to update the <api>-schema.d.ts files in ./common/types/ directory

declare -A swaggerFilePaths # Create an associative array to store the schema file paths
swaggerFilePaths["classes"]=https://developers.api.berkeley.edu/api/18/interactive-docs/classes-latest
swaggerFilePaths["courses"]=https://developers.api.berkeley.edu/api/100/interactive-docs/courses-latest 

for targetFile in "${!swaggerFilePaths[@]}"
do
    echo "Updating $targetFile schema file..."
    echo "Fetching schema from ${swaggerFilePaths[$targetFile]}"
    npx openapi-typescript ${swaggerFilePaths[$targetFile]} -o ./common/types/api/$targetFile-schema.d.ts
    npx ts2typebox -i ./common/types/api/$targetFile-schema.d.ts -o ./common/types/typebox/$targetFile-validation-schema.d.ts
done
