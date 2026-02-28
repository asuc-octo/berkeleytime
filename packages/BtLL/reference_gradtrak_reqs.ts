/**
 * Reference GradTrak Requirements
 *
 * This file contains example BtLL requirement code for different degree programs.
 * These can be manually loaded into the database as PlanRequirement documents.
 *
 * To load into DB:
 * 1. Create a PlanRequirement document with the code field set to one of these constants
 * 2. Set appropriate fields: isUcReq, college, major, minor, isOfficial
 */

export const UC_REQ_BTLL = `
Function<boolean>(Course) elw_finder (course){
  string university_requirement get_attr(course, "universityRequirement")
  boolean return equal([university_requirement, "ELRC"])
}
Function<boolean>(Course) ah_finder (course){
  string university_requirement get_attr(course, "universityRequirement")
  boolean return or([equal([university_requirement, "ACAH"]), equal([university_requirement, "AHIC"])])
}
  Function<boolean>(Course) ac_finder (course){
  string university_requirement get_attr(course, "universityRequirement")
  boolean return or([equal([university_requirement, "ACAH"]), equal([university_requirement, "AC"])])
}
Function<boolean>(Column) spring_fall_column (column){
  string semester get_attr(column, "semester")
  boolean return or([equal([semester, "Spring"]), equal([semester, "Fall"])])
}
Function<boolean>(Column) find_divider_column (column){
  boolean return equal([get_attr(column, "name"), get_attr(divider_column, "name")])
}
Function<number>(number, Column) add_units (acc, column){
  number units get_attr(column, "units")
  number return add([acc, units])
}
Function<boolean>(Course) cs61a_finder (course){
  string number get_attr(course, "number")
  boolean return equal([number, "61A"])
}
Function<boolean>() main (){
  List<Course> courses get_attr(this, "allCourses")
  List<Course> elw_matches filter(courses, elw_finder)
  NCoursesRequirement elw {elw_matches, 1, "Entry Level Writing"}
  List<Course> ah_matches filter(courses, ah_finder)
  NCoursesRequirement ah {ah_matches, 1, "American History or American Institutions"}
  List<Course> ac_matches filter(courses, ac_finder)
  NCoursesRequirement ac {ac_matches, 1, "American Cultures"}
  number total_units get_attr(this, "units")
  NumberRequirement total_units_req {total_units, 120, "Minimum Total Units"}

  // Senior residence
  List<Column> columns get_attr(this, "columns")
  List<Column> only_spring_fall filter(columns, spring_fall_column)
  Column divider_column get_element(only_spring_fall, add([length(only_spring_fall), -3]))
  number index findIndex(columns, find_divider_column)
  List<Column> pre_senior_columns slice(columns, 0, add([index, 1]))
  number pre_senior_units reduce(pre_senior_columns, add_units, 0)
  number senior_units reduce(slice(columns, add([index, 1]), length(columns)), add_units, 0)
  NumberRequirement pre_senior_units_req {pre_senior_units, 90, "Minimum 17 units in pre-senior columns"}
  NumberRequirement senior_units_req {senior_units, 24, "Minimum 24 units in senior columns"}
  AndRequirement senior_residence {[pre_senior_units_req, senior_units_req], "Senior Residence"}

  List<Requirement> return [elw, ah, ac, total_units_req, senior_residence]
}
`;

export const COE_REQ_BTLL = `
Function<boolean>(Course) hss_finder (course){
  List<string> breadth_requirements get_attr(course, "breadthRequirements")
  // physical and biological sciences are not included in H/SS
  boolean arts_and_lit contains(breadth_requirements, "Arts & Literature")
  boolean historical_studies contains(breadth_requirements, "Historical Studies")
  boolean international_studies contains(breadth_requirements, "International Studies")
  boolean philosophy_and_values contains(breadth_requirements, "Philosophy & Values")
  boolean social_and_behavioral_sciences contains(breadth_requirements, "Social & Behavioral Sciences")
  boolean rca_requirement contains(breadth_requirements, "Reading and Composition A")
  boolean rcb_requirement contains(breadth_requirements, "Reading and Composition B")
  boolean return or([arts_and_lit, historical_studies, international_studies, philosophy_and_values, social_and_behavioral_sciences, rca_requirement, rcb_requirement])
}

Function<List<Requirement>>() main (){
  // H/SS matcher
  List<Course> courses get_attr(this, "allCourses")

  // 6 H/SS
  List<Course> hss_courses filter(courses, hss_finder)
  NCoursesRequirement hss {hss_courses, 6, "Minimum 6 H/SS Courses"}

  // 2 H/SS Upper div
  List<Course> hss_upper_div_courses filter(courses, (c) {
    boolean is_hss_course hss_finder(c)
    boolean is_upper_div regex_match(get_attr(c, "number"), "\\d\\d\\d")
    boolean return and([is_hss_course, is_upper_div])
  })
  NCoursesRequirement hss_upper_div {hss_upper_div_courses, 2, "Minimum 2 H/SS Upper Div Courses"}

  // R&C A
  List<Course> rca_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Reading and Composition A")
  })
  NCoursesRequirement rca {rca_courses, 1, "Reading and Composition A"}

  // R&C B
  List<Course> rcb_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Reading and Composition B")
  })
  NCoursesRequirement rcb {rcb_courses, 1, "Reading and Composition B"}

  List<Requirement> return [hss, hss_upper_div, rca, rcb]
}
`;

export const CDSS_REQ_BTLL = `
Function<List<Requirement>>() main (){
  // 7 course breadth & essential skills matcher
  List<Course> courses get_attr(this, "allCourses")

  // 1 Arts & Literature
  List<Course> arts_and_lit_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Arts & Literature")
  })
  NCoursesRequirement arts_and_lit {arts_and_lit_courses, 1, "Minimum 1 Arts & Literature Course"}

  // 1 Biological Sciences
  List<Course> biological_sciences_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Biological Sciences")
  })
  NCoursesRequirement biological_sciences {biological_sciences_courses, 1, "Minimum 1 Biological Sciences Course"}

  // 1 Historical Studies
  List<Course> historical_studies_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Historical Studies")
  })
  NCoursesRequirement historical_studies {historical_studies_courses, 1, "Minimum 1 Historical Studies Course"}

  // 1 International Studies
  List<Course> international_studies_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "International Studies")
  })
  NCoursesRequirement international_studies {international_studies_courses, 1, "Minimum 1 International Studies Course"}

  // 1 Philosophy & Values
  List<Course> philosophy_and_values_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Philosophy & Values")
  })
  NCoursesRequirement philosophy_and_values {philosophy_and_values_courses, 1, "Minimum 1 Philosophy & Values Course"}

  // 1 Physical Sciences
  List<Course> physical_sciences_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Physical Sciences")
  })
  NCoursesRequirement physical_sciences {physical_sciences_courses, 1, "Minimum 1 Physical Sciences Course"}

  // 1 Social & Behavioral Sciences
  List<Course> social_and_behavioral_sciences_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Social & Behavioral Sciences")
  })
  NCoursesRequirement social_and_behavioral_sciences {social_and_behavioral_sciences_courses, 1, "Minimum 1 Social & Behavioral Sciences Course"}


  // R&C A
  List<Course> rca_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Reading and Composition A")
  })
  NCoursesRequirement rca {rca_courses, 1, "Reading and Composition A"}

  // R&C B
  List<Course> computational_reasoning_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Reading and Composition B")
  })
  NCoursesRequirement rcb {rcb_courses, 1, "Reading and Composition B"}

  // the below essential skills were manually pulled from https://cdss.berkeley.edu/academics/college-degree-requirements-and-policies#section-el-degree-requirements-1:~:text=see%20approved%20courses

  // Statistical Reasoning
  List<Course> statistical_reasoning_courses filter(courses, (c) {
    List<Course> statistical_req [
      {"COMPSCI C8"},
      {"DATA C8"},
      {"STAT C8"},
      {"STAT 2"},
      {"STAT 20"},
      {"STAT 21"},
      {"STAT W21"}
    ]
    boolean return one_common_course([c], statistical_req)
  })
  NCoursesRequirement statistical_reasoning {statistical_reasoning_courses, 1, "Statistical Reasoning"}


  // Computational Reasoning
  List<Course> computational_reasoning_courses filter(courses, (c) {
    List<Course> computational_req [
      {"COMPSCI C8"},
      {"DATA C8"},
      {"STAT C8"},
      {"COMPSCI 10"},
      {"COMPSCI W10"},
      {"COMPSCI 61A"},
      {"COMPSCI 61B"},
      {"COMPSCI 61C"}
    ]
    boolean return one_common_course([c], computational_req)
  })
  NCoursesRequirement computational_reasoning {computational_reasoning_courses, 1, "Computational Reasoning"}


  List<Course> hsddt_courses filter(courses, (c) {
    List<Course> hsddt_req [
      {"AMERSTD C134"},
      {"AFRICAM C134"},
      {"ANTHRO 168"},
      {"BIO ENG 100"},
      {"CDSS 60"},
      {"CDSS 94"},
      {"CYPLAN 101"},
      {"DATA 94"},
      {"DATA C4AC"},
      {"DATA C104"},
      {"HISTORY C184D"},
      {"STS C104"},
      {"DIGHUM 100"},
      {"ESPM C167"},
      {"PBHLTH C160"},
      {"HISTORY 30"},
      {"HISTORY 133D"},
      {"HISTORY 183B"},
      {"INFO 101"},
      {"INFO 103"},
      {"INFO 134"},
      {"INFO 188"},
      {"ISF 60"},
      {"ISF 100D"},
      {"ISF 100J"},
      {"LEGALST 190"},
      {"LS 22"},
      {"LS 25"},
      {"NWMEDIA 133"},
      {"NWMEDIA 151AC"},
      {"PHILOS 5"},
      {"PHILOS 121"},
      {"POLECON 156"},
      {"POLSCI 132C"},
      {"PUBPOL 138A"},
      {"PUBPOL 145"},
      {"PUBPOL 147"},
      {"PUBPOL C151"},
      {"RHETOR 173"},
      {"STS C100"},
      {"HISTORY C182C"},
      {"ISF C100G"},
      {"COMPSCI C8"},
      {"DATA C8"},
      {"STAT C8"},
      {"COMPSCI 10"},
      {"COMPSCI W10"},
      {"COMPSCI 61A"},
      {"COMPSCI 61B"},
      {"COMPSCI 61C"}
    ]
    boolean return one_common_course([c], hsddt_req)
  })
  NCoursesRequirement hsddt {hsddt_courses, 1, "Human and Social Dynamics of Data and Technology"}


  List<Requirement> return [arts_and_lit, biological_sciences, historical_studies, international_studies, philosophy_and_values, physical_sciences, social_and_behavioral_sciences, rca, rcb, computational_reasoning, statistical_reasoning, hsddt]
}
`;

export const EECS_REQ_BTLL = `
Function<boolean>(Course) eecs_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  // EECS courses numbered 100-C191B
  boolean is_eecs and([equal([subject, "EECS"]), or([regex_match(number, "^1[0-8][0-9]"), regex_match(number, "^19[0-1]"), equal([number, "C191B"])])])

  // ELENG courses numbered 100-194
  boolean is_eleng and([equal([subject, "ELENG"]), or([regex_match(number, "^1[0-8][0-9]"), regex_match(number, "^19[0-4]")])])

  // COMPSCI courses numbered 100-194
  boolean is_compsci_194_valid and([equal([subject, "COMPSCI"]), or([regex_match(number, "^1[0-8][0-9]"), regex_match(number, "^19[0-4]")])])

  // COMPSCI 270, C280, 285, 288
  boolean is_compsci_270 and([equal([subject, "COMPSCI"]), equal([number, "270"])])
  boolean is_compsci_c280 and([equal([subject, "COMPSCI"]), equal([number, "C280"])])
  boolean is_compsci_285 and([equal([subject, "COMPSCI"]), equal([number, "285"])])
  boolean is_compsci_288 and([equal([subject, "COMPSCI"]), equal([number, "288"])])
  boolean is_compsci_special or([is_compsci_270, is_compsci_c280, is_compsci_285, is_compsci_288])

  // COMPSCI 294
  boolean is_compsci_294_valid and([equal([subject, "COMPSCI"]), equal([number, "294"])])

  // ELENG 229A
  boolean is_eleng_229a and([equal([subject, "ELENG"]), equal([number, "229A"])])

  // INFO 153A, 159, 213
  boolean is_info_153a and([equal([subject, "INFO"]), equal([number, "153A"])])
  boolean is_info_159 and([equal([subject, "INFO"]), equal([number, "159"])])
  boolean is_info_213 and([equal([subject, "INFO"]), equal([number, "213"])])
  boolean is_info_valid or([is_info_153a, is_info_159, is_info_213])

  boolean return or([is_eecs, is_eleng, is_compsci_194_valid, is_compsci_special, is_compsci_294_valid, is_eleng_229a, is_info_valid])
}


Function<boolean>(Course) eecs_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")
  boolean is_eecs and([equal([subject, "EECS"]), or([equal([number, "16A"]), equal([number, "16B"])])])
  boolean is_compsci and([equal([subject, "COMPSCI"]), or([equal([number, "61A"]), equal([number, "61B"]), equal([number, "61BL"]), equal([number, "61C"])])])
  boolean return or([is_eecs, is_compsci])
}

Function<number>(number, Course) add_course_units (acc, course){
  number units get_attr(course, "units")
  number return add([acc, units])
}

Function<boolean>(Course) natural_science_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")
  number units get_attr(course, "units")

  // Must be 3 units or more and upper division (100+)
  boolean is_upper_div or([regex_match(number, "^1[0-9][0-9]"), regex_match(number, "^2[0-9][0-9]"), regex_match(number, "^C[0-9]")])
  boolean has_enough_units or([greater_than(units, 3), equal([units, 3])])
  boolean is_valid_units and([is_upper_div, has_enough_units])

  // ASTRON (all upper div)
  boolean is_astron and([equal([subject, "ASTRON"]), is_valid_units])

  // CHEM, excluding 100, 149, 192
  boolean is_chem_100 and([equal([subject, "CHEM"]), equal([number, "100"])])
  boolean is_chem_149 and([equal([subject, "CHEM"]), equal([number, "149"])])
  boolean is_chem_192 and([equal([subject, "CHEM"]), equal([number, "192"])])
  boolean is_chem_excluded or([is_chem_100, is_chem_149, is_chem_192])
  boolean is_chem and([equal([subject, "CHEM"]), is_valid_units, not(is_chem_excluded)])

  // EPS, excluding C100
  boolean is_eps_c100 and([equal([subject, "EPS"]), equal([number, "C100"])])
  boolean is_eps and([equal([subject, "EPS"]), is_valid_units, not(is_eps_c100)])

  // INTEGBI, excluding 101, C105, 191
  boolean is_integbi_101 and([equal([subject, "INTEGBI"]), equal([number, "101"])])
  boolean is_integbi_c105 and([equal([subject, "INTEGBI"]), equal([number, "C105"])])
  boolean is_integbi_191 and([equal([subject, "INTEGBI"]), equal([number, "191"])])
  boolean is_integbi_excluded or([is_integbi_101, is_integbi_c105, is_integbi_191])
  boolean is_integbi and([equal([subject, "INTEGBI"]), is_valid_units, not(is_integbi_excluded)])

  // MCELLBI (all upper div)
  boolean is_mcellbi and([equal([subject, "MCELLBI"]), is_valid_units])

  // PHYSICS, excluding 100
  boolean is_physics_100 and([equal([subject, "PHYSICS"]), equal([number, "100"])])
  boolean is_physics and([equal([subject, "PHYSICS"]), is_valid_units, not(is_physics_100)])

  // PLANTBI (all upper div)
  boolean is_plantbi and([equal([subject, "PLANTBI"]), is_valid_units])

  boolean return or([is_astron, is_chem, is_eps, is_integbi, is_mcellbi, is_physics, is_plantbi])
}

Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  // Lower Division Mathematics: MATH 51, 52, 53, 54, COMPSCI 70
  List<Course> math_lower_div_req [{"MATH 53"}, {"COMPSCI 70"}]
  List<boolean> math_lower_div_status common_course_matches(math_lower_div_req, courses)
  CourseListRequirement math_lower_div {math_lower_div_req, math_lower_div_status, "Lower Division Mathematics"}

  // Lower Division Physics: (PHYSICS 7A OR 5A) AND (PHYSICS 7B OR 5B) OR (PHYSICS 5A AND 5B AND 5BL)
  List<Course> physics7 [{"PHYSICS 7A"}, {"PHYSICS 7B"}]
  List<Course> physics5 [{"PHYSICS 5A"}, {"PHYSICS 5B"}, {"PHYSICS 5BL"}]
  List<boolean> physics7_status common_course_matches(physics7, courses)
  List<boolean> physics5_status common_course_matches(physics5, courses)
  CourseListRequirement physics7_req {physics7, physics7_status, "Physics 7A and 7B"}
  CourseListRequirement physics5_req {physics5, physics5_status, "Physics 5A, 5B, and 5BL"}
  OrRequirement physics_lower_div {[physics7_req, physics5_req], "Lower Division Physics"}

  // Lower Division Computer Science: COMPSCI 61A, (61B OR 61BL), 61C
  List<Course> cs61b [{"COMPSCI 61A"}, {"COMPSCI 61B"}, {"COMPSCI 61C"}]
  List<Course> cs61bl [{"COMPSCI 61A"}, {"COMPSCI 61BL"}, {"COMPSCI 61C"}]
  List<boolean> cs61b_status common_course_matches(cs61b, courses)
  List<boolean> cs61bl_status common_course_matches(cs61bl, courses)
  CourseListRequirement cs61b_req {cs61b, cs61b_status, "COMPSCI 61A, 61B, 61C"}
  CourseListRequirement cs61bl_req {cs61bl, cs61bl_status, "COMPSCI 61A, 61BL, 61C"}
  OrRequirement cs_lower_div {[cs61b_req, cs61bl_req], "Lower Division Computer Science"}

  // Lower Division EECS: EECS 16A, 16B
  List<Course> eecs16 [{"EECS 16A"}, {"EECS 16B"}]
  List<boolean> eecs16_status common_course_matches(eecs16, courses)
  CourseListRequirement eecs_lower_div {eecs16, eecs16_status, "Lower Division EECS"}

  // Upper Division Technical Electives: 20 units from eligible courses
  List<Course> eecs_upper_div_matches filter(courses, eecs_upper_div_finder)
  number eecs_upper_div_units reduce(eecs_upper_div_matches, add_course_units, 0)
  NumberRequirement eecs_upper_div {eecs_upper_div_units, 20, "Upper Division Technical Electives"}

  // Upper Division Design Requirement: At least one design course
  List<Course> design_courses [{"ELENG C128"}, {"ELENG 130"}, {"ELENG 140"}, {"ELENG 143"}, {"ELENG 192"}, {"COMPSCI 160"}, {"COMPSCI 161"}, {"COMPSCI 162"}, {"COMPSCI 164"}, {"COMPSCI 169"}, {"COMPSCI 169A"}, {"COMPSCI 169L"}, {"COMPSCI W169A"}, {"COMPSCI 180"}, {"COMPSCI 182"}, {"COMPSCI L182"}, {"COMPSCI W182"}, {"COMPSCI 184"}, {"COMPSCI 186"}, {"COMPSCI W186"}, {"COMPSCI 285"}, {"EECS C106A"}, {"EECS C106B"}, {"EECS 149"}]
  List<Course> design_matches filter(courses, (c) {
    boolean return one_common_course([c], design_courses)
  })
  NCoursesRequirement design_ncourses {design_matches, 1, "Design Course"}

  List<Course> eecs151_la_req [{"EECS 151"}, {"EECS 151LA"}]
  List<Course> eecs151_lb_req [{"EECS 151"}, {"EECS 151LB"}]
  List<boolean> eecs151_la_status common_course_matches(eecs151_la_req, courses)
  List<boolean> eecs151_lb_status common_course_matches(eecs151_lb_req, courses)
  CourseListRequirement eecs151_la_req_obj {eecs151_la_req, eecs151_la_status, "EECS 151 and 151LA"}
  CourseListRequirement eecs151_lb_req_obj {eecs151_lb_req, eecs151_lb_status, "EECS 151 and 151LB"}

  OrRequirement design {[design_ncourses, eecs151_la_req_obj, eecs151_lb_req_obj], "Upper Division Design Requirement"}

  // Engineering Units: 40 units (EECS lower div except COMPSCI 70 + 20 units upper div)
  List<Course> eecs_lower_div_matches filter(courses, eecs_lower_div_finder)
  number eecs_lower_div_units reduce(eecs_lower_div_matches, add_course_units, 0)
  number total_engineering_units add([eecs_lower_div_units, eecs_upper_div_units])
  NumberRequirement engineering_units {total_engineering_units, 40, "Engineering Units"}

  // Natural Science Elective: Various options with "must take both" requirements
  List<Course> astron7a_req [{"ASTRON 7A"}, {"PHYSICS 7A"}, {"PHYSICS 7B"}]
  List<Course> astron7b_req [{"ASTRON 7B"}, {"PHYSICS 7A"}, {"PHYSICS 7B"}]
  List<Course> astron7ab_req [{"ASTRON 7AB"}, {"PHYSICS 7A"}, {"PHYSICS 7B"}]
  List<boolean> astron7a_status common_course_matches(astron7a_req, courses)
  List<boolean> astron7b_status common_course_matches(astron7b_req, courses)
  List<boolean> astron7ab_status common_course_matches(astron7ab_req, courses)
  CourseListRequirement astron7a_req_obj {astron7a_req, astron7a_status, "ASTRON 7A and PHYSICS 7A, 7B"}
  CourseListRequirement astron7b_req_obj {astron7b_req, astron7b_status, "ASTRON 7B and PHYSICS 7A, 7B"}
  CourseListRequirement astron7ab_req_obj {astron7ab_req, astron7ab_status, "ASTRON 7AB and PHYSICS 7A, 7B"}
  OrRequirement astron_req {[astron7a_req_obj, astron7b_req_obj, astron7ab_req_obj], "Astronomy Option"}

  List<Course> biology1a_req [{"BIOLOGY 1A"}, {"BIOLOGY 1AL"}]
  List<Course> biology1b_req [{"BIOLOGY 1B"}]
  List<boolean> biology1a_status common_course_matches(biology1a_req, courses)
  List<boolean> biology1b_status common_course_matches(biology1b_req, courses)
  CourseListRequirement biology1a_req_obj {biology1a_req, biology1a_status, "BIOLOGY 1A and 1AL"}
  CourseListRequirement biology1b_req_obj {biology1b_req, biology1b_status, "BIOLOGY 1B"}
  OrRequirement biology_req {[biology1a_req_obj, biology1b_req_obj], "Biology Option"}

  List<Course> chem1a_req [{"CHEM 1A"}, {"CHEM 1AL"}]
  List<Course> chem1b_req [{"CHEM 1B"}]
  List<Course> chem3a_req [{"CHEM 3A"}, {"CHEM 3AL"}]
  List<Course> chem3b_req [{"CHEM 3B"}, {"CHEM 3BL"}]
  List<Course> chem4a_req [{"CHEM 4A"}]
  List<Course> chem4b_req [{"CHEM 4B"}]
  List<boolean> chem1a_status common_course_matches(chem1a_req, courses)
  List<boolean> chem1b_status common_course_matches(chem1b_req, courses)
  List<boolean> chem3a_status common_course_matches(chem3a_req, courses)
  List<boolean> chem3b_status common_course_matches(chem3b_req, courses)
  List<boolean> chem4a_status common_course_matches(chem4a_req, courses)
  List<boolean> chem4b_status common_course_matches(chem4b_req, courses)
  CourseListRequirement chem1a_req_obj {chem1a_req, chem1a_status, "CHEM 1A and 1AL"}
  CourseListRequirement chem1b_req_obj {chem1b_req, chem1b_status, "CHEM 1B"}
  CourseListRequirement chem3a_req_obj {chem3a_req, chem3a_status, "CHEM 3A and 3AL"}
  CourseListRequirement chem3b_req_obj {chem3b_req, chem3b_status, "CHEM 3B and 3BL"}
  CourseListRequirement chem4a_req_obj {chem4a_req, chem4a_status, "CHEM 4A"}
  CourseListRequirement chem4b_req_obj {chem4b_req, chem4b_status, "CHEM 4B"}
  OrRequirement chem_req {[chem1a_req_obj, chem1b_req_obj, chem3a_req_obj, chem3b_req_obj, chem4a_req_obj, chem4b_req_obj], "Chemistry Option"}

  List<Course> mcellbi32_req [{"MCELLBI 32"}, {"MCELLBI 32L"}]
  List<boolean> mcellbi32_status common_course_matches(mcellbi32_req, courses)
  CourseListRequirement mcellbi32_req_obj {mcellbi32_req, mcellbi32_status, "MCELLBI 32 and 32L"}

  List<Course> physics7c_req [{"PHYSICS 7C"}]
  List<Course> physics5c_req [{"PHYSICS 5C"}, {"PHYSICS 5CL"}]
  List<boolean> physics7c_status common_course_matches(physics7c_req, courses)
  List<boolean> physics5c_status common_course_matches(physics5c_req, courses)
  CourseListRequirement physics7c_req_obj {physics7c_req, physics7c_status, "PHYSICS 7C"}
  CourseListRequirement physics5c_req_obj {physics5c_req, physics5c_status, "PHYSICS 5C and 5CL"}
  OrRequirement physics_req {[physics7c_req_obj, physics5c_req_obj], "Physics Option"}

  List<Course> natural_science_upper_div_matches filter(courses, natural_science_upper_div_finder)
  NCoursesRequirement natural_science_upper_div_req {natural_science_upper_div_matches, 1, "Upper Division Natural Science"}

  OrRequirement natural_science {[astron_req, biology_req, chem_req, mcellbi32_req_obj, physics_req, natural_science_upper_div_req], "Natural Science Elective"}

  // Ethics Requirement: At least one from the list
  List<Course> ethics_courses filter(courses, (c) {
    List<Course> ethics_req [{"BIOENG 100"}, {"COMPSCI H195"}, {"COMPSCI 195"}, {"DATA C104"}, {"ENERES C100"}, {"ENERES W100"}, {"ENGIN 125"}, {"ENGIN 157AC"}, {"ENGIN 185"}, {"HISTORY C184D"}, {"IAS 157AC"}, {"INFO 88A"}, {"ISF 100D"}, {"ISF 100G"}, {"MEDIAST 104D"}, {"NWMEDIA 151AC"}, {"PHILOS 121"}, {"PUBPOL C184"}, {"PUBPOL W184"}, {"STS C104D"}, {"UGBA 107"}]
    boolean return one_common_course([c], ethics_req)
  })
  NCoursesRequirement ethics {ethics_courses, 1, "Ethics Requirement"}

  List<Requirement> return [math_lower_div, physics_lower_div, cs_lower_div, eecs_lower_div, eecs_upper_div, design, engineering_units, natural_science, ethics]
}
`;

export const MECHE_REQ_BTLL = `
Function<boolean>(Course) meceng_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")
  boolean is_meceng equal([subject, "MECENG"])
  boolean is_upper_div or([regex_match(number, "^\\d\\d\\d"), regex_match(number, "^C\\d")])
  boolean return and([is_meceng, is_upper_div])
}

Function<boolean>(Course) meche_tech_elective_upper_div_finder (course){
  // TODO: update from me.berkeley.edu for the full department-approved list
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")
  boolean is_upper_div or([regex_match(number, "^\\d\\d\\d"), regex_match(number, "^C\\d")])
  boolean is_meceng and([equal([subject, "MECENG"]), is_upper_div])
  boolean is_engin and([equal([subject, "ENGIN"]), is_upper_div])
  boolean return or([is_meceng, is_engin])
}

Function<boolean>(Course) meche_tech_elective_lower_div_finder (course){
  // TODO: update from me.berkeley.edu for the full approved list; lower-div capped at 3 units per policy
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")
  boolean is_meceng equal([subject, "MECENG"])
  boolean is_upper_div or([regex_match(number, "^\\d\\d\\d"), regex_match(number, "^C\\d")])
  boolean return and([is_meceng, not(is_upper_div)])
}

Function<number>(number, Course) add_course_units (acc, course){
  number units get_attr(course, "units")
  number return add([acc, units])
}

Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  // Lower Division Mathematics
  List<Course> math_1a_51_list [{"MATH 1A"}, {"MATH 51"}]
  List<Course> math_1a_51_matches filter(courses, (c) {
    boolean return one_common_course([c], math_1a_51_list)
  })
  NCoursesRequirement math_1a {math_1a_51_matches, 1, "Calculus I (MATH 1A or 51)"}

  List<Course> math_1b_52_list [{"MATH 1B"}, {"MATH 52"}]
  List<Course> math_1b_52_matches filter(courses, (c) {
    boolean return one_common_course([c], math_1b_52_list)
  })
  NCoursesRequirement math_1b {math_1b_52_matches, 1, "Calculus II (MATH 1B or 52)"}

  List<Course> math_53_54_list [{"MATH 53"}, {"MATH 54"}]
  List<boolean> math_53_54_status common_course_matches(math_53_54_list, courses)
  CourseListRequirement math_53_54 {math_53_54_list, math_53_54_status, "MATH 53 and 54"}

  // Lower Division Mathematics
  AndRequirement math_lower_div {[math_1a, math_1b, math_53_54], "Lower Division Mathematics"}

  // Lower Division Physics
  List<Course> physics_list [{"PHYSICS 7A"}, {"PHYSICS 7B"}]
  List<boolean> physics_status common_course_matches(physics_list, courses)
  CourseListRequirement physics_lower_div {physics_list, physics_status, "Lower Division Physics"}

  // Chemistry (CHEM 1A or CHEM 4A)
  List<Course> chem_list [{"CHEM 1A"}, {"CHEM 4A"}]
  List<Course> chem_matches filter(courses, (c) {
    boolean return one_common_course([c], chem_list)
  })
  NCoursesRequirement chem {chem_matches, 1, "Chemistry (CHEM 1A or 4A)"}

  // Engineering Core
  // Note: ENGIN 26 is exempt for junior transfers per worksheet, but included here as required
  List<Course> engin_core_list [{"ENGIN 7"}, {"ENGIN 26"}, {"ENGIN 29"}, {"MECENG 40"}, {"MECENG C85"}, {"CIVENG C30"}]
  List<boolean> engin_core_status common_course_matches(engin_core_list, courses)
  CourseListRequirement engin_core_courses {engin_core_list, engin_core_status, "Engineering Core Courses"}

  AndRequirement engin_core {[engin_core_courses], "Engineering Core"}

  // Upper-Division Required Courses
  List<Course> upper_div_required_list [{"ENGIN 178"}, {"MECENG 100"}, {"MECENG 102B"}, {"MECENG 103"}, {"MECENG 104"}, {"MECENG 106"}, {"MECENG 108"}, {"MECENG 109"}, {"MECENG 132"}]
  List<boolean> upper_div_required_status common_course_matches(upper_div_required_list, courses)
  CourseListRequirement upper_div_required {upper_div_required_list, upper_div_required_status, "Upper-Division Required Courses"}

  // Technical Electives
  // Upper-div electives: MECENG + ENGIN upper-div (TODO: update from me.berkeley.edu for full approved list)
  List<Course> upper_div_electives filter(courses, meche_tech_elective_upper_div_finder)
  number upper_div_elective_units reduce(upper_div_electives, add_course_units, 0)
  NumberRequirement upper_div_units_req {upper_div_elective_units, 12, "12 Upper-Div Elective Units"}

  // ME-sponsored electives: MECENG upper-div only (must be at least 9 of the 12 upper-div units)
  List<Course> meceng_upper_div filter(courses, meceng_upper_div_finder)
  number meceng_upper_div_units reduce(meceng_upper_div, add_course_units, 0)
  NumberRequirement meceng_units_req {meceng_upper_div_units, 9, "9 ME-Sponsored Upper-Div Units"}

  // Total elective units: upper-div + lower-div (lower-div capped at 3 per policy, not enforced here)
  List<Course> lower_div_electives filter(courses, meche_tech_elective_lower_div_finder)
  number lower_div_elective_units reduce(lower_div_electives, add_course_units, 0)
  number total_elective_units add([upper_div_elective_units, lower_div_elective_units])
  NumberRequirement total_units_req {total_elective_units, 15, "15 Total Technical Elective Units"}

  // Design technical elective (TODO: update from me.berkeley.edu for full approved list)
  List<Course> design_elective_list [{"MECENG 135"}, {"MECENG 167"}, {"MECENG 170"}, {"MECENG 171"}, {"MECENG 179"}, {"MECENG 185"}]
  List<Course> design_elective_matches filter(courses, (c) {
    boolean return one_common_course([c], design_elective_list)
  })
  NCoursesRequirement design_req {design_elective_matches, 1, "Design Technical Elective"}

  // Quantitative science technical elective (TODO: update from me.berkeley.edu for full approved list)
  List<Course> quant_sci_list [{"MECENG 110"}, {"MECENG 115"}, {"MECENG 120"}, {"MECENG 123"}, {"MECENG 124"}, {"MECENG 125"}, {"MECENG 127"}, {"MECENG 128"}, {"MECENG 129"}, {"MECENG 136"}]
  List<Course> quant_sci_matches filter(courses, (c) {
    boolean return one_common_course([c], quant_sci_list)
  })
  NCoursesRequirement quant_sci_req {quant_sci_matches, 1, "Quantitative Science Technical Elective"}

  AndRequirement tech_electives {[upper_div_units_req, meceng_units_req, total_units_req, design_req, quant_sci_req], "Technical Electives"}

  List<Requirement> return [math_lower_div, physics_lower_div, chem, engin_core, upper_div_required, tech_electives]
}
`;

export const COMPSCI_REQ_BTLL = `

Function<boolean>(Course) design_upper_div_finder (course) {
  string subject = get_attr(course, "subject")
  string number = get_attr(course, "number")

  boolean is_cs = and([equal([subject, "COMPSCI"]), or([equal([number, "160"]), equal([number, "161"]), equal([number, "162"]), equal([number, "164"]), equal([number, "168"]), equal([number, "169"]), equal([number, "169A"]), equal([number, "169L"]), equal([number, "180"]), equal([number, "182"]), equal([number, "W182"]), equal([number, "184"]), equal([number, "186"]), equal([number, "W186"])])])
  boolean is_ee = and([equal([subject, "ELENG"]), or([equal([number, "C128"]), equal([number, "130"]), equal([number, "140"]), equal([number, "143"]), equal([number, "192"])])])
  boolean is_eecs = and([equal([subject, "EECS"]), or([equal([number, "C106A"]), equal([number, "C106B"]), equal([number, "149"]), equal([number, "151"])])])

  return or([cs_match, ee_match, eecs_match])
}

Function<boolean>(Course) eecs_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  // EECS courses numbered 100-C191B
  boolean is_eecs_valid and([equal([subject, "EECS"]), or([regex_match(number, "^1[0-8][0-9]"), regex_match(number, "^19[0-1]"), equal([number, "C191B"])])])

  // ELENG courses numbered 100-194
  boolean is_eleng_valid and([equal([subject, "ELENG"]), or([regex_match(number, "^1[0-8][0-9]"), regex_match(number, "^19[0-4]")])])

  // COMPSCI courses numbered 100-194
  boolean is_compsci_valid and([equal([subject, "COMPSCI"]), or([regex_match(number, "^1[0-8][0-9]"), regex_match(number, "^19[0-4]")])])

  // Math 156, Math 221, Info 159, Data 101, Data 188, and STAT/DATA/CS C100
  boolean is_math_156 and([equal([subject, "MATH"]), equal([number, "156"])])
  boolean is_math_221 and([equal([subject, "MATH"]), equal([number, "221"])])
  boolean is_info_159 and([equal([subject, "INFO"]), equal([number, "159"])])
  boolean is_data_101 and([equal([subject, "DATA"]), equal([number, "101"])])
  boolean is_data_188 and([equal([subject, "DATA"]), equal([number, "188"])])
  boolean is_data_c100 and([equal([subject, "DATA"]), equal([number, "C100"])])
  boolean is_stat_c100 and([equal([subject, "STAT"]), equal([number, "C100"])])
  boolean is_compsci_c100 and([equal([subject, "COMPSCI"]), equal([number, "C100"])])
  boolean non_eecs or([is_math_156, is_math_221, is_info_159, is_data_101, is_data_188, is_data_c100, is_stat_c100, is_compsci_c100])

  boolean return or([is_eecs_valid, is_eleng_validm is_compsci_valid, non_eecs])
}

Function<boolean>(Course) cs_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  // COMPSCI courses numbered 100-194
  boolean is_compsci_valid and([equal([subject, "COMPSCI"]), or([regex_match(number, "^1[0-8][0-9]"), regex_match(number, "^19[0-4]")])])

  // Math 156, Math 221, Info 159, Data 101, Data 188, and STAT/DATA/CS C100
  boolean is_math_156 and([equal([subject, "MATH"]), equal([number, "156"])])
  boolean is_math_221 and([equal([subject, "MATH"]), equal([number, "221"])])
  boolean is_info_159 and([equal([subject, "INFO"]), equal([number, "159"])])
  boolean is_data_101 and([equal([subject, "DATA"]), equal([number, "101"])])
  boolean is_data_188 and([equal([subject, "DATA"]), equal([number, "188"])])
  boolean is_data_c100 and([equal([subject, "DATA"]), equal([number, "C100"])])
  boolean is_stat_c100 and([equal([subject, "STAT"]), equal([number, "C100"])])
  boolean is_compsci_c100 and([equal([subject, "COMPSCI"]), equal([number, "C100"])])
  boolean non_eecs or([is_math_156, is_math_221, is_info_159, is_data_101, is_data_188, is_data_c100, is_stat_c100, is_compsci_c100])

  boolean return or([is_compsci_valid, non_eecs])
}

Function<boolean>(Course) cs_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_compsci and([equal([subject, "COMPSCI"]), or([equal([number, "61A"]), equal([number, "61B"]), equal([number, "61BL"]), equal([number, "61C"])])])
  boolean return is_compsci
}

Function<boolean>(Course) technical_elective_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")
  number units get_attr(course, "units")

  // Must be upper division (100+) or C### and NOT 195–199
  boolean is_upper_div or([regex_match(number, "^1[0-9][0-9]"), regex_match(number, "^2[0-9][0-9]"), regex_match(number, "^C[0-9][0-9]"), regex_match(number, "^C1[0-9][0-9]"), regex_match(number, "^C2[0-9][0-9]"), regex_match(number, "^W[0-9][0-9]"), regex_match(number, "^W1[0-9][0-9]"), regex_match(number, "^W2[0-9][0-9]"), regex_match(number, "^N[0-9][0-9]"), regex_match(number, "^N1[0-9][0-9]")])
  boolean is_excluded_seminar regex_match(number, "^19[5-9]")
  boolean is_valid_number and([is_upper_div, not(is_excluded_seminar)])

  // 4+ unit check (for departments requiring it)
  boolean has_4_units or([greater_than(units, 3), equal([units, 4])])

  // TODO: some courses only count for specific sections, but checks are currently only implemented for the course number level
  // ANTHRO
  boolean is_anthro_107 and([equal([subject, "ANTHRO"]), equal([number, "107"])])

  // ARCH
  boolean is_arch and([equal([subject, "ARCH"]), or([equal([number, "122"]), equal([number, "129"]), equal([number, "222"]), equal([number, "229"])])])

  // ART
  boolean is_art and([equal([subject, "ART"]), or([equal([number, "172"]), equal([number, "173"]), equal([number, "175"]), equal([number, "178"])])])

  // ASTRON
  boolean is_astron and([equal([subject, "ASTRON"]), equal([number, "C162"])])

  // BIOENG (except 100, C181, 190, 192, 196)
  boolean is_bioeng_excluded or([equal([number, "100"]), equal([number, "C181"]), equal([number, "190"]), equal([number, "192"]), equal([number, "196"])])
  boolean is_bioeng and([equal([subject, "BIOENG"]), is_valid_number, not(is_bioeng_excluded)])

  // CHEM (all technical UD and Grad)
  boolean is_chem and([equal([subject, "CHEM"]), is_valid_number])

  // CHMENG (except 180, 185)
  boolean is_chmeng_excluded or([equal([number, "180"]), equal([number, "185"])])
  boolean is_chmeng and([equal([subject, "CHMENG"]), is_valid_number, not(is_chmeng_excluded)])

  // CIVENG (except 167, 192, 252L, 290R)
  boolean is_civeng_excluded or([equal([number, "167"]), equal([number, "192"]), equal([number, "252L"]), equal([number, "290R"])])
  boolean is_civeng and([equal([subject, "CIVENG"]), is_valid_number, not(is_civeng_excluded)])

  // COG SCI
  boolean is_cogsci and([equal([subject, "COG SCI"]), or([equal([number, "N100"]), equal([number, "C100"]), equal([number, "C101"]), equal([number, "C110"]), equal([number, "C126"]), equal([number, "C127"]), equal([number, "131"]), equal([number, "C131"]), equal([number, "C133"]), equal([number, "190"])])])

  // COMLIT
  boolean is_comlit_170 and([equal([subject, "COMLIT"]), equal([number, "170"])])

  // COMP BIO
  boolean is_compbio_175 and([equal([subject, "COMP BIO"]), equal([number, "175"])])

  // CYPLAN
  boolean is_cyplan_101 and([equal([subject, "CYPLAN"]), equal([number, "101"])])

  // DATA
  boolean is_data and([equal([subject, "DATA"]), or([equal([number, "C100"]), equal([number, "101"]), equal([number, "C102"]), equal([number, "C104"]), equal([number, "140"]), equal([number, "144"]), equal([number, "145"]), equal([number, "188"])])])
  
  // STS C104 / HIST C184D
  boolean is_hist_c184d and([equal([subject, "HIST"]), equal([number, "C184D"])])
  boolean is_sts_c104 and([equal([subject, "STS"]), equal([number, "C104"])])

  // DEMOG
  boolean is_demog and([equal([subject, "DEMOG"]), or([equal([number, "C175"]), equal([number, "180"])])])

  // DES INV
  boolean is_desinv and([equal([subject, "DESINV"]), or([equal([number, "190"]), equal([number, "190E"])])])
  boolean is_meceng_292c and([equal([subject, "MECENG"]), equal([number, "292C"])])

  // DEV ENG
  boolean is_deveng_290 and([equal([subject, "DEVENG"]), equal([number, "290"])])

  // DIGHUM
  boolean is_dighum_101 and([equal([subject, "DIGHUM"]), equal([number, "101"])])

  // ECON
  boolean is_econ and([equal([subject, "ECON"]), or([equal([number, "100A"]), equal([number, "100B"]), equal([number, "101A"]), equal([number, "101B"]), equal([number, "C103"]), equal([number, "C110"]), equal([number, "136"]), equal([number, "139"]), equal([number, "140"]), equal([number, "141"]), equal([number, "148"]), equal([number, "C175"])])])

  // EDUC
  boolean is_educ and([equal([subject, "EDUC"]), or([equal([number, "161"]), equal([number, "W161"]), equal([number, "C260F"]), equal([number, "290A"])])])

  // EECS / ELENG (all UD and approved Grad)
  boolean is_eecs and([or([equal([subject, "EECS"]), equal([subject, "ELENG"])]), is_valid_number])

  // ENERES
  boolean is_eneres and([equal([subject, "ENERES"]), or([equal([number, "C100"]), equal([number, "W100"]), equal([number, "C176"])])])

  // ENGIN (except 102, 125, 157AC; 183 sections need manual review)
  boolean is_engin_excluded or([equal([number, "102"]), equal([number, "125"]), equal([number, "157AC"])])
  boolean is_engin and([equal([subject, "ENGIN"]), is_valid_number, not(is_engin_excluded)])

  // ENVECON
  boolean is_envecon and([equal([subject, "ENVECON"]), or([equal([number, "100"]), equal([number, "C118"])])])

  // EPS
  boolean is_eps and([equal([subject, "EPS"]), or([equal([number, "104"]), equal([number, "109"]), equal([number, "122"]), equal([number, "C162"])])])

  // ESPM
  boolean is_espm and([equal([subject, "ESPM"]), or([equal([number, "136"]), equal([number, "137"]), equal([number, "169"])])])

  // GEOG
  boolean is_geog and([equal([subject, "GEOG"]), or([equal([number, "142"]), equal([number, "143"]), equal([number, "183"]), equal([number, "185"]), equal([number, "187"]), equal([number, "C188"])])])

  // IND ENG (except 171, select 185, 186, 190 series, 191; 185 needs manual review)
  boolean is_indeng_excluded or([equal([number, "171"]), equal([number, "186"]), equal([number, "191"])])
  boolean is_indeng_190_series regex_match(number, "^190")
  boolean is_indeng and([equal([subject, "INDENG"]), is_valid_number, not(is_indeng_excluded), not(is_indeng_190_series)])

  // INFO
  boolean is_info and([equal([subject, "INFO"]), or([equal([number, "103"]), equal([number, "159"]), equal([number, "213"]), equal([number, "251"]), equal([number, "C262"])])])

  // INTEGBI (all technical 4-unit UD and Grad)
  boolean is_integbi and([equal([subject, "INTEGBI"]), is_valid_number, has_4_units])

  // LD ARCH
  boolean is_ldarch and([equal([subject, "LDARCH"]), or([equal([number, "C177"]), equal([number, "C188"])])])

  // LEGALST
  boolean is_legalst_123 and([equal([subject, "LEGALST"]), equal([number, "123"])])

  // LING
  boolean is_ling and([equal([subject, "LING"]), or([equal([number, "100"]), equal([number, "C105"]), equal([number, "C160"]), equal([number, "120"]), equal([number, "C189"])])])

  // MATH (all technical UD and Grad)
  boolean is_math and([equal([subject, "MATH"]), is_valid_number])

  // MECH ENG (except 191K)
  boolean is_me and([equal([subject, "MECENG"]), is_valid_number, not(equal([number, "191K"]))])

  // MCELLBI (all technical 4-unit UD and Grad)
  boolean is_mcellbi and([equal([subject, "MCELLBI"]), is_valid_number, has_4_units])

  // MUSIC
  boolean is_music and([equal([subject, "MUSIC"]), or([equal([number, "108"]), equal([number, "158A"]), equal([number, "159"]), equal([number, "209"])])])

  // NEUROSC (all technical UD and Grad, minimum 4 units)
  boolean is_neurosc and([equal([subject, "NEUROSC"]), is_valid_number, has_4_units])

  // NEW MEDIA
  boolean is_newmedia and([equal([subject, "NWMEDIA"]), or([equal([number, "190"]), equal([number, "C203"]), equal([number, "C262"])])])

  // NUC ENG (all technical 4-unit UD and Grad)
  boolean is_nuceng and([equal([subject, "NUCENG"]), is_valid_number, has_4_units])

  // NUSCTX
  boolean is_nusctx_103 and([equal([subject, "NUSCTX"]), equal([number, "103"])])

  // PHILOS
  boolean is_philos and([equal([subject, "PHILOS"]), or([equal([number, "140A"]), equal([number, "140B"]), equal([number, "143"])])])

  // PHYSICS (all technical 4-unit UD and Grad)
  boolean is_physics and([equal([subject, "PHYSICS"]), is_valid_number, has_4_units])

  // POL SCI
  boolean is_polsci and([equal([subject, "POLSCI"]), or([equal([number, "C135"]), equal([number, "W135"]), equal([number, "132B"])])])

  // PSYCH
  boolean is_psych_c123 and([equal([subject, "PSYCH"]), equal([number, "C123"])])

  // PUBLIC HEALTH
  boolean is_pubhlth and([equal([subject, "PBHLTH"]), or([equal([number, "142"]), equal([number, "150A"]), equal([number, "162A"]), equal([number, "252D"])])])

  // PUB POL (290 section 002 only)
  boolean is_pubpol and([equal([subject, "PUBPOL"]), or([equal([number, "290"]), equal([number, "C184"]), equal([number, "W184"])])])

  // SOCIOL
  boolean is_sociol_166 and([equal([subject, "SOCIOL"]), equal([number, "166"])])

  // SPANISH
  boolean is_spanish_100 and([equal([subject, "SPANISH"]), equal([number, "100"])])

  // STAT (all technical 4-unit UD and Grad)
  boolean is_stat and([equal([subject, "STAT"]), is_valid_number, has_4_units])

  // THEATER
  boolean is_theater_177 and([equal([subject, "THEATER"]), equal([number, "177"])])

  // UGBA
  boolean is_ugba and([equal([subject, "UGBA"]), or([equal([number, "103"]), equal([number, "120AA"]), equal([number, "120AB"]), equal([number, "122"])])])

  boolean return or([is_anthro_107, is_arch, is_art, is_astron, is_bioeng, is_chem, is_chmeng, is_civeng, is_cogsci, is_comlit_170, is_compbio_175, is_cyplan_101, is_data, is_hist_c184d, is_sts_c104, is_demog, is_desinv, is_meceng_292c, is_deveng_290, is_dighum_101, is_econ, is_educ, is_eecs, is_eneres, is_engin, is_envecon, is_eps, is_espm, is_geog, is_indeng, is_info, is_integbi, is_ldarch, is_legalst_123, is_ling, is_math, is_mcellbi, is_me, is_music, is_neurosc, is_newmedia, is_nuceng, is_nusctx_103, is_philos, is_physics, is_polsci, is_psych_c123, is_pubhlth, is_pubpol, is_sociol_166, is_spanish_100, is_stat, is_theater_177, is_ugba])
}

Function<number>(number, Course) add_course_units (acc, course){
  number units get_attr(course, "units")
  number return add([acc, units])
}

Function<List<Course>>(List<Course> available, number target) take_units {
  List<Course> consumed []
  number current_total 0
  
  foreach(course in available) {
    if(less_than(current_total, target)) {
      add_to_list(consumed, course)
      current_total = add_course_units(current_total, course)
    }
  }
  return consumed
}

Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> math_1a_51_list [{"MATH 1A"}, {"MATH 51"}]
  List<Course> math_1a_51_matches filter(courses, (c) {
    boolean return one_common_course([c], math_1a_51_list)
  })
  NCoursesRequirement math_1a {math_1a_51_matches, 1, "Calculus I (MATH 1A or 51)"}

  List<Course> math_1b_52_list [{"MATH 1B"}, {"MATH 52"}]
  List<Course> math_1b_52_matches filter(courses, (c) {
    boolean return one_common_course([c], math_1b_52_list)
  })
  NCoursesRequirement math_1b {math_1b_52_matches, 1, "Calculus II (MATH 1B or 52)"}

  List<Course> math_53_54_list [{"MATH 53"}, {"MATH 54"}]
  List<boolean> math_53_54_status common_course_matches(math_53_54_list, courses)
  CourseListRequirement math_53_54 {math_53_54_list, math_53_54_status, "MATH 53 and 54"}

  // TODO: change this to only accept MATH 55 for Math/CS double majors
  List<Course> math_55_compsci_70_list [{"MATH 55"}, {"COMPSCI 70"}]
  List<Course> math_55_compsci_70_matches filter(courses, (c) {
    boolean return one_common_course([c], math_55_compsci_70_list)
  })
  NCoursesRequirement compsci_70 {math_55_compsci_70_matches, 1, "Calculus II (MATH 1B or 52)"}

  // Lower Division Mathematics: MATH 51, 52, 53, 54, COMPSCI 70
  AndRequirement math_lower_div {[math_1a, math_1b, math_53_54, compsci_70], "Lower Division Mathematics"}

  // Lower Division Computer Science: COMPSCI 61A, (61B OR 61BL), 61C
  List<Course> cs61b [{"COMPSCI 61A"}, {"COMPSCI 61B"}, {"COMPSCI 61C"}]
  List<Course> cs61bl [{"COMPSCI 61A"}, {"COMPSCI 61BL"}, {"COMPSCI 61C"}]
  List<boolean> cs61b_status common_course_matches(cs61b, courses)
  List<boolean> cs61bl_status common_course_matches(cs61bl, courses)
  CourseListRequirement cs61b_req {cs61b, cs61b_status, "COMPSCI 61A, 61B, 61C"}
  CourseListRequirement cs61bl_req {cs61bl, cs61bl_status, "COMPSCI 61A, 61BL, 61C"}
  OrRequirement cs_lower_div {[cs61b_req, cs61bl_req], "Lower Division Computer Science"}

  // TODO: add special topics and graduate courses from https://eecs.berkeley.edu/academics/courses/approved-cs-graduate-and-special-topics-courses/

  // Upper Division 
  // Design: 4 units
  List<Course> design_pool filter(courses, design_upper_div_finder)
  List<Course> design_consumed take_units(design_pool, 4)
  number design_units reduce(design_consumed, add_course_units, 0)
  NumberRequirement design_upper_div {design_units, 4, "Upper Division Design"}
  
  // CS: 8 units
  List<Course> cs__pool filter(difference(courses, design_consumed), cs_upper_div_finder)
  List<Course> cs_consumed take_units(cs_only_pool, 8)
  number cs_units reduce(cs_consumed, add_course_units, 0)
  NumberRequirement cs_upper_div {cs_units, 8, "Upper Division CS"}

  // CS/EE/EECS: 8 units
  List<Course> used_so_far union(design_consumed, cs_consumed)
  List<Course> eecs_pool filter(difference(courses, used_so_far), eecs_upper_div_finder)
  List<Course> eecs_consumed take_units(eecs_pool, 8)
  number eecs_units reduce(eecs_consumed, add_course_units, 0)
  NumberRequirement eecs_upper_div {eecs_units, 8, "Upper Division CS/EE/EECS"}

  // Technical elective: one 4-unit course
  technical_elective_finder
  List<Course> used_so_far union(used_so_far, eecs_consumed)
  List<Course> tech_elec_pool filter(difference(courses, used_so_far), technical_elective_finder)
  NCoursesRequirement tech_elec_upper_div {tech_elec_pool, 1, "Upper Division Technical Elective"}

  List<Requirement> return [math_lower_div, cs_lower_div, cs_upper_div, eecs_upper_div, design_upper_div, tech_elec_upper_div]
}
`;

export const DATASCI_REQ_BTLL = `
Function<boolean>(Course) data_c100_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_100 and([equal([subject, "DATA"]), equal([number, "100"])])
  boolean return is_data_100
}

Function<boolean>(Course) probability_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_stat_c140 and([or([equal([subject, "DATA"]), equal([subject, "STAT"])]), equal([number, "C140"])])
  boolean is_eecs_126 and([equal([subject, "EECS"]), equal([number, "126"])])
  boolean is_indeng_172 and([equal([subject, "IND ENG"]), equal([number, "172"])])
  boolean is_math_106 and([equal([subject, "MATH"]), equal([number, "106"])])
  boolean is_stat_134 and([equal([subject, "STAT"]), equal([number, "134"])])

  boolean return or([is_data_stat_c140, is_eecs_126, is_indeng_172, is_math_106, is_stat_134])
}

Function<boolean>(Course) modeling_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_compsci_182 and([or([equal([subject, "DATA"]), equal([subject, "COMPSCI"])]), or([equal([number, "182"]), equal([number, "C182"]), equal([number, "L182"]), equal([number, "W182"])])])
  boolean is_compsci_189 and([equal([subject, "COMPSCI"]), equal([number, "189"])])
  boolean is_data_stat_c102 and([or([equal([subject, "DATA"]), equal([subject, "STAT"])]), equal([number, "C102"])])
  boolean is_indeng_142a and([equal([subject, "INDENG"]), equal([number, "142A"])])
  boolean is_stat_154 and([equal([subject, "STAT"]), equal([number, "154"])])
  // DATA 188 only counts in Spring 2026 
  boolean is_data_188 and([equal([subject, "DATA"]), equal([number, "188"])])

  boolean return or([is_data_compsci_182, is_compsci_189, is_data_stat_c102, is_indeng_142a, is_stat_154, is_data_188])
}

Function<boolean>(Course) human_contexts_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_anthro_168 and([equal([subject, "ANTHRO"]), equal([number, "168"])])
  boolean is_cyplan_101 and([equal([subject, "CYPLAN"]), equal([number, "101"])])
  boolean is_data_c104 and([or([equal([subject, "DATA"]), equal([subject, "HISTORY"]), equal([subject, "STS"])]), equal([number, "C104"])])
  boolean is_dighum_100 and([equal([subject, "DIGHUM"]), equal([number, "100"])])
  boolean is_espm_c167 and([equal([subject, "ESPM"]), equal([number, "C167"])])
  boolean is_pubhlth_c160 and([equal([subject, "PBHLTH"]), equal([number, "C160"])])
  boolean is_info_101 and([equal([subject, "INFO"]), equal([number, "101"])])
  boolean is_info_188 and([equal([subject, "INFO"]), equal([number, "188"])])
  boolean is_isf_100j and([equal([subject, "ISF"]), equal([number, "100J"])])
  boolean is_nwmedia_151ac and([equal([subject, "NWMEDIA"]), equal([number, "151AC"])])
  boolean is_philos_121 and([equal([subject, "PHILOS"]), equal([number, "121"])])
  boolean is_polecon_159 and([equal([subject, "POLECON"]), equal([number, "159"])])
  // BIOENG 100 only counts prior to Fall 2025
  boolean is_bioeng_100 and([equal([subject, "BIOENG"]), equal([number, "100"])])

  boolean return or([is_anthro_168, is_cyplan_101, is_data_c104, is_dighum_100, is_espm_c167, is_pubhlth_c160, is_info_101, is_info_188, is_isf_100j, is_nwmedia_151ac, is_philos_121, is_polecon_159, is_bioeng_100])
}

Function<boolean>(Course) computational_inferential_depth_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_astron_128 and([equal([subject, "ASTRON"]), equal([number, "128"])])
  boolean is_bioeng_chem_c142 and([or([equal([subject, "BIOENG"]), equal([subject, "CHEM"])]), equal([number, "C142"])])
  boolean is_chem_compsci_physics_c191 and([or([equal([subject, "CHEM"]), equal([subject, "COMPSCI"]), equal([subject, "PHYSICS"])]), equal([number, "C191"])])
  boolean is_compsci_161 and([equal([subject, "COMPSCI"]), equal([number, "161"])])
  boolean is_compsci_162 and([equal([subject, "COMPSCI"]), equal([number, "162"])])
  boolean is_compsci_164 and([equal([subject, "COMPSCI"]), equal([number, "164"])])
  boolean is_compsci_168 and([equal([subject, "COMPSCI"]), equal([number, "168"])])
  boolean is_compsci_169 and([equal([subject, "COMPSCI"]), or([equal([number, "169"]), equal([number, "169A"]), equal([number, "W169"]), equal([number, "W169A"])])])
  // 169L (2 units) may only combine with 169A/W169A, not 169; enforced in main()
  boolean is_compsci_169l and([equal([subject, "COMPSCI"]), equal([number, "169L"])])
  boolean is_compsci_170 and([equal([subject, "COMPSCI"]), equal([number, "170"])])
  boolean is_compsci_186 and([equal([subject, "COMPSCI"]), or([equal([number, "186"]), equal([number, "W186"])])])
  boolean is_compsci_188 and([equal([subject, "COMPSCI"]), equal([number, "188"])])
  boolean is_cph_data_c146 and([or([equal([subject, "CPH"]), equal([subject, "DATA"])]), equal([number, "C146"])])
  boolean is_data_c101 and([equal([subject, "DATA"]), equal([number, "C101"])])
  boolean is_data_144 and([equal([subject, "DATA"]), equal([number, "144"])])
  boolean is_data_145 and([equal([subject, "DATA"]), equal([number, "145"])])
  boolean is_econ_140 and([equal([subject, "ECON"]), equal([number, "140"])])
  boolean is_econ_141 and([equal([subject, "ECON"]), equal([number, "141"])])
  boolean is_eecs_127 and([equal([subject, "EECS"]), equal([number, "127"])])
  boolean is_eleng_120 and([equal([subject, "ELENG"]), equal([number, "120"])])
  boolean is_eleng_122 and([equal([subject, "ELENG"]), equal([number, "122"])])
  boolean is_eleng_123 and([equal([subject, "ELENG"]), equal([number, "123"])])
  boolean is_envecon_c118 and([or([equal([subject, "ENVECON"]), equal([subject, "IAS"])]), equal([number, "C118"])])
  boolean is_espm_174 and([equal([subject, "ESPM"]), equal([number, "174"])])
  boolean is_indeng_115 and([equal([subject, "IND ENG"]), equal([number, "115"])])
  boolean is_indeng_135 and([equal([subject, "IND ENG"]), equal([number, "135"])])
  boolean is_indeng_142b and([equal([subject, "IND ENG"]), equal([number, "142B"])])
  boolean is_indeng_160 and([equal([subject, "IND ENG"]), equal([number, "160"])])
  boolean is_indeng_162 and([equal([subject, "IND ENG"]), equal([number, "162"])])
  boolean is_indeng_164 and([equal([subject, "IND ENG"]), equal([number, "164"])])
  boolean is_indeng_165 and([equal([subject, "IND ENG"]), equal([number, "165"])])
  boolean is_indeng_166 and([equal([subject, "IND ENG"]), equal([number, "166"])])
  // IND ENG 173 and STAT 150 share a mutual exclusion with EECS 126 (probability); enforced in main()
  boolean is_indeng_173 and([equal([subject, "IND ENG"]), equal([number, "173"])])
  boolean is_indeng_174 and([equal([subject, "IND ENG"]), equal([number, "174"])])
  boolean is_info_159 and([equal([subject, "INFO"]), equal([number, "159"])])
  // INFO 190-1 only counts when offered with the Data Visualization topic
  boolean is_info_190_1 and([equal([subject, "INFO"]), equal([number, "190-1"])])
  boolean is_math_156 and([equal([subject, "MATH"]), equal([number, "156"])])
  boolean is_nuceng_175 and([equal([subject, "NUC ENG"]), equal([number, "175"])])
  boolean is_physics_188 and([equal([subject, "PHYSICS"]), equal([number, "188"])])
  boolean is_stat_135 and([equal([subject, "STAT"]), equal([number, "135"])])
  boolean is_stat_150 and([equal([subject, "STAT"]), equal([number, "150"])])
  boolean is_stat_151a and([equal([subject, "STAT"]), equal([number, "151A"])])
  boolean is_stat_152 and([equal([subject, "STAT"]), equal([number, "152"])])
  boolean is_stat_153 and([equal([subject, "STAT"]), equal([number, "153"])])
  boolean is_stat_158 and([equal([subject, "STAT"]), equal([number, "158"])])
  boolean is_stat_159 and([equal([subject, "STAT"]), equal([number, "159"])])
  boolean is_stat_165 and([equal([subject, "STAT"]), equal([number, "165"])])
  boolean is_ugba_142 and([equal([subject, "UGBA"]), equal([number, "142"])])

  boolean return or([is_astron_128, is_bioeng_chem_c142, is_chem_compsci_physics_c191, is_compsci_161, is_compsci_162, is_compsci_164, is_compsci_168, is_compsci_169, is_compsci_169l, is_compsci_170, is_compsci_186, is_compsci_188, is_cph_data_c146, is_data_c101, is_data_144, is_data_145, is_econ_140, is_econ_141, is_eecs_127, is_eleng_120, is_eleng_122, is_eleng_123, is_envecon_c118, is_espm_174, is_indeng_115, is_indeng_135, is_indeng_142b, is_indeng_160, is_indeng_162, is_indeng_164, is_indeng_165, is_indeng_166, is_indeng_173, is_indeng_174, is_info_159, is_info_190_1, is_math_156, is_nuceng_175, is_physics_188, is_stat_135, is_stat_150, is_stat_151a, is_stat_152, is_stat_153, is_stat_158, is_stat_159, is_stat_165, is_ugba_142])
}

Function<number>(number, Course) add_course_units (acc, course){
  number units get_attr(course, "units")
  number return add([acc, units])
}

Function<List<Course>>(List<Course> available, number target) take_units {
  List<Course> consumed []
  number current_total 0
  
  foreach(course in available) {
    if(less_than(current_total, target)) {
      add_to_list(consumed, course)
      current_total = add_course_units(current_total, course)
    }
  }
  return consumed
}

Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  // Foundations of Data Science: Data C8 or Stat 20
  List<Course> foundations_list [{"DATA C8"}, {"STAT C8"}, {"COMPSCI C8"}, {"STAT 20"}]
  List<Course> foundations_matches filter(courses, (c) {
    boolean return one_common_course([c], foundations_list)
  })
  NCoursesRequirement foundations {foundations_matches, 1, "Foundations of Data Science"}

  // Calculus I: Math 51, 1A, N1A, 10A, or 16A 
  List<Course> calc1_list [{"MATH 51"}, {"MATH 1A"}, {"MATH N1A"}, {"MATH 10A"}, {"MATH 16A"}]
  List<Course> calc1_matches filter(courses, (c) {
    boolean return one_common_course([c], calc1_list)
  })
  NCoursesRequirement calc1 {calc1_matches, 1, "Calculus I"}

  // Calculus II: Data 89, Math 52, 1B, or N1B
  List<Course> calc2_list [{"DATA 89"}, {"MATH 52"}, {"MATH 1B"}, {"MATH N1B"}]
  List<Course> calc2_matches filter(courses, (c) {
    boolean return one_common_course([c], calc2_list)
  })
  NCoursesRequirement calc2 {calc2_matches, 1, "Calculus II"}

  // Linear Algebra: Math 54/N54/W54, Math 56, Physics 89, Stat 89A, or EE/EECS 16A+16B (both required)
  // Check solo-qualifying courses first; only fall back to 16A+16B pair if none found
  List<Course> linalg_solo_list [{"MATH 54"}, {"MATH N54"}, {"MATH W54"}, {"MATH 56"}, {"PHYSICS 89"}, {"STAT 89A"}]
  List<Course> linalg_solo_matches filter(courses, (c) {
    boolean return one_common_course([c], linalg_solo_list)
  })
  boolean has_solo_linalg greater_than(length(linalg_solo_matches), 0)

  List<Course> linalg_16a_list [{"EECS 16A"}]
  List<Course> linalg_16b_list [{"EECS 16B"}]
  List<Course> linalg_16a_matches filter(courses, (c) {
    boolean return one_common_course([c], linalg_16a_list)
  })
  List<Course> linalg_16b_matches filter(courses, (c) {
    boolean return one_common_course([c], linalg_16b_list)
  })
  boolean has_16a greater_than(length(linalg_16a_matches), 0)
  boolean has_16b greater_than(length(linalg_16b_matches), 0)
  boolean has_16ab and([has_16a, has_16b])

  boolean linalg_satisfied or([has_solo_linalg, has_16ab])
  BooleanRequirement linalg {linalg_satisfied, "Linear Algebra"}

  // Program Structures: CS 61A, CS/Data C88C, or Engin 7
  List<Course> prog_structures_list [{"COMPSCI 61A"}, {"COMPSCI C88C"}, {"DATA C88C"}, {"ENGIN 7"}]
  List<Course> prog_structures_matches filter(courses, (c) {
    boolean return one_common_course([c], prog_structures_list)
  })
  NCoursesRequirement prog_structures {prog_structures_matches, 1, "Program Structures"}

  // Data Structures: CS 61B or 61BL
  List<Course> data_structures_list [{"COMPSCI 61B"}, {"COMPSCI 61BL"}]
  List<Course> data_structures_matches filter(courses, (c) {
    boolean return one_common_course([c], data_structures_list)
  })
  NCoursesRequirement data_structures {data_structures_matches, 1, "Data Structures"}

  
  // can't have Stat 20 fulfilling foundations AND Engin 7 fulfilling Program Structures
  List<Course> engin_7_list [{"ENGIN 7"}]
  List<Course> engin_7_matches filter(courses, (c) {
    boolean return one_common_course([c], engin_7_list)
  })
  boolean used_engin_7 greater_than(length(engin_7_matches), 0)

  List<Course> stat_20_list [{"STAT 20"}]
  List<Course> stat_20_matches filter(courses, (c) {
    boolean return one_common_course([c], stat_20_list)
  })
  boolean used_stat_20 greater_than(length(stat_20_matches), 0)

  List<Course> data_c8_list [{"DATA C8"}, {"STAT C8"}, {"COMPSCI C8"}]
  List<Course> data_c8_matches filter(courses, (c) {
    boolean return one_common_course([c], data_c8_list)
  })
  boolean has_data_c8 greater_than(length(data_c8_matches), 0)

  // Stat 20 is only being relied on for foundations if Data C8 is absent
  boolean stat_20_used_for_foundations and([used_stat_20, not(has_data_c8)])

  // Conflict only triggers if Stat 20 is filling foundations AND Engin 7 is filling Program Structures
  boolean stat_20_substitution_invalid and([stat_20_used_for_foundations, used_engin_7])
  BooleanRequirement stat_20_engin_7_conflict {not(stat_20_substitution_invalid), "Stat 20 may not substitute for Data C8 when Engin 7 is used for Program Structures"}

  // TODO: add upper div checks

  // Data C100
  List<Course> data_c100_matches filter(courses, data_c100_finder)
  NCoursesRequirement data_c100 {data_c100_matches, 1, "Data C100: Principles and Techniques of Data Science"}

  // Probability
  List<Course> probability_matches filter(courses, probability_finder)
  NCoursesRequirement probability {probability_matches, 1, "Probability"}

  // Modeling, Learning, and Decision-Making
  List<Course> modeling_matches filter(courses, modeling_finder)
  NCoursesRequirement modeling {modeling_matches, 1, "Modeling, Learning, and Decision-Making"}

  // Human Contexts and Ethics
  List<Course> human_contexts_matches filter(courses, human_contexts_finder)
  NCoursesRequirement human_contexts {human_contexts_matches, 1, "Human Contexts and Ethics"}

  // Computational & Inferential Depth: 2 courses totaling 7+ units
  // EECS 126 may not double-count here if used for Probability
  // IND ENG 173 / STAT 150 share a mutual exclusion with EECS 126; enforced below
  List<Course> cid_pool filter(difference(courses, probability_matches), computational_inferential_depth_finder)
  List<Course> cid_consumed take_units(cid_pool, 7)
  number cid_units reduce(cid_consumed, add_course_units, 0)
  number cid_course_count length(cid_consumed)
  BooleanRequirement cid_min_courses {greater_than_or_equal(cid_course_count, 2), "Computational & Inferential Depth: minimum 2 courses"}
  BooleanRequirement cid_min_units {greater_than_or_equal(cid_units, 7), "Computational & Inferential Depth: minimum 7 units"}

  // EECS 126 / IND ENG 173 / STAT 150 mutual exclusion: at most one may count across Probability + C&ID
  List<Course> mutex_list [{"EECS 126"}, {"INDENG 173"}, {"STAT 150"}]
  List<Course> mutex_in_probability filter(probability_matches, (c) {
    boolean return one_common_course([c], mutex_list)
  })
  List<Course> mutex_in_cid filter(cid_consumed, (c) {
    boolean return one_common_course([c], mutex_list)
  })
  List<Course> mutex_consumed union(mutex_in_probability, mutex_in_cid)
  BooleanRequirement mutex_check {less_than_or_equal(length(mutex_consumed), 1), "only one of EECS 126,IND ENG 173, STAT 150 can count toward the major"}

  // COMPSCI 169L may only count toward C&ID if paired with 169A/W169A, not with 169
  // Only matters if 169L actually ends up in the consumed C&ID courses
  List<Course> cs_169a_list [{"COMPSCI 169A"}, {"COMPSCI W169A"}]
  List<Course> cs_169l_list [{"COMPSCI 169L"}]
  List<Course> cs_169_list [{"COMPSCI 169"}, {"COMPSCI W169"}]
  List<Course> cs_169a_matches filter(cid_consumed, (c) {
    boolean return one_common_course([c], cs_169a_list)
  })
  List<Course> cs_169l_matches filter(cid_consumed, (c) {
    boolean return one_common_course([c], cs_169l_list)
  })
  List<Course> cs_169_matches filter(cid_consumed, (c) {
    boolean return one_common_course([c], cs_169_list)
  })
  boolean cid_has_169l greater_than(length(cs_169l_matches), 0)
  boolean cid_has_169a greater_than(length(cs_169a_matches), 0)
  boolean cid_has_169 greater_than(length(cs_169_matches), 0)
  // 169L is invalid only if it's being used in C&ID, paired with 169 rather than 169A
  boolean cs_169l_invalid and([cid_has_169l, cid_has_169, not(cid_has_169a)])
  BooleanRequirement cs_169l_check {not(cs_169l_invalid), "C&ID: COMPSCI 169L must be paired with COMPSCI 169A/W169A"}

  // ECON 140 and 141 are mutually exclusive toward C&ID; only one may count
  List<Course> econ_140_list [{"ECON 140"}]
  List<Course> econ_141_list [{"ECON 141"}]
  List<Course> econ_140_consumed filter(cid_consumed, (c) {
    boolean return one_common_course([c], econ_140_list)
  })
  List<Course> econ_141_consumed filter(cid_consumed, (c) {
    boolean return one_common_course([c], econ_141_list)
  })
  boolean cid_has_econ_140 greater_than(length(econ_140_consumed), 0)
  boolean cid_has_econ_141 greater_than(length(econ_141_consumed), 0)
  BooleanRequirement econ_140_141_check {not(and([cid_has_econ_140, cid_has_econ_141])), "C&ID: ECON 140 and ECON 141 cannot both be used"}

  // Minimum upper-division totals: 8 courses, 28 units
  List<Course> upper_div_all union([data_c100_matches, probability_matches, modeling_matches, human_contexts_matches, cid_consumed])
  number upper_div_units reduce(upper_div_all, add_course_units, 0)
  BooleanRequirement upper_div_min_courses {greater_than_or_equal(length(upper_div_all), 8), "Minimum 8 upper-division courses"}
  BooleanRequirement upper_div_min_units {greater_than_or_equal(upper_div_units, 28), "Minimum 28 upper-division units"}

  List<Requirement> return [foundations, calc1, calc2, linalg, prog_structures, data_structures, stat_20_engin_7_conflict, data_c100, probability, modeling, human_contexts, cid_min_courses, cid_min_units, mutex_check, cs_169l_check, econ_140_141_check, upper_div_min_courses, upper_div_min_units]
}
`;
