BtLL can help encode requirements, but we still need a way to visualize them so they user can understand how they are being met. To enable this, I propose creating a couple of extensions for the Requirement object in src/lib/requirement.ts

First, make the Requirement class have an result attribute that is a boolean. Also, add a description string attribute that is just a user-readable description of the requirement. Then, make a couple different kinds of Requirement:

Boolean Requirement 
 - Only attribute is a boolean. Result is equal to the boolean

CourseListRequirement:
 - Attributes are list of matching courses and a number N. Result is true if number of elements in list of courses is at least N

AndRequirement:
 - Attribute is a list of Requirements. Result is and of them

OrRequirement:
 - Similar to And

NumberRequirement:
 - Attributes are two numbers. Result is true if first number is greater than or equal to second


Make corresponding tests for each one.

Next, I will have to adapt testBtLL to use these, and also create appropriate visualizations for each one.
