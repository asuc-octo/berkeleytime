Create DB model for PlanRequirement. Fields in model are string for code, bool for whether it is for UC reqs, (optional) string for what college, (optional) string for what major, (optional) string for what minor, createdAt and createdBy (foreign key to user), bool for if it is official.

Edit the plan model to include array of SelectedPlanRequirement (foreign key, and each has a list of bools to indicate whether each requirement is met or not. Length should be equal to length of returned Requirement list by evaluating the PlanRequirement)

Make a backend query that takes in major and minor list as input, and returns all the corresponding DB documents. On creating new gradtrak, call this and populated SelectedPlanRequirements.

Make a state for when the major/minor doesn't have requirements (coming soon).

Allow users to manually check off a requirement (hover, show with low opacity, on click show as white instead of green). Store this in the DB by editing the SelectedPlanRequirement. 

Put a disclaimer that the requirements may not be 100% accurate and to check with an advisor.

Take the existing testBtLL file and store it in package/BtLL as reference_gradtrak_reqs.ts. These can be manually loaded into the DB.

