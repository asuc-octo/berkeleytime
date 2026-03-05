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
  NCoursesRequirement arts_and_lit {arts_and_lit_courses, 1, "Arts & Literature"}

  // 1 Biological Sciences
  List<Course> biological_sciences_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Biological Sciences")
  })
  NCoursesRequirement biological_sciences {biological_sciences_courses, 1, "Biological Sciences"}

  // 1 Historical Studies
  List<Course> historical_studies_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Historical Studies")
  })
  NCoursesRequirement historical_studies {historical_studies_courses, 1, "Historical Studies"}

  // 1 International Studies
  List<Course> international_studies_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "International Studies")
  })
  NCoursesRequirement international_studies {international_studies_courses, 1, "International Studies"}

  // 1 Philosophy & Values
  List<Course> philosophy_and_values_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Philosophy & Values")
  })
  NCoursesRequirement philosophy_and_values {philosophy_and_values_courses, 1, "Philosophy & Values"}

  // 1 Physical Sciences
  List<Course> physical_sciences_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Physical Sciences")
  })
  NCoursesRequirement physical_sciences {physical_sciences_courses, 1, "Physical Sciences"}

  // 1 Social & Behavioral Sciences
  List<Course> social_and_behavioral_sciences_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Social & Behavioral Sciences")
  })
  NCoursesRequirement social_and_behavioral_sciences {social_and_behavioral_sciences_courses, 1, "Social & Behavioral Sciences"}


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
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_cs and([equal([subject, "COMPSCI"]), or([equal([number, "160"]), equal([number, "161"]), equal([number, "162"]), equal([number, "164"]), equal([number, "168"]), equal([number, "169"]), equal([number, "169A"]), equal([number, "169L"]), equal([number, "180"]), equal([number, "182"]), equal([number, "W182"]), equal([number, "184"]), equal([number, "186"]), equal([number, "W186"])])])
  boolean is_ee and([equal([subject, "ELENG"]), or([equal([number, "C128"]), equal([number, "130"]), equal([number, "140"]), equal([number, "143"]), equal([number, "192"])])])
  boolean is_eecs and([equal([subject, "EECS"]), or([equal([number, "C106A"]), equal([number, "C106B"]), equal([number, "149"]), equal([number, "151"])])])

  boolean return or([is_cs, is_ee, is_eecs])
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

  boolean return or([is_eecs_valid, is_eleng_valid, is_compsci_valid, non_eecs])
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

  // COGSCI
  boolean is_cogsci and([equal([subject, "COGSCI"]), or([equal([number, "N100"]), equal([number, "C100"]), equal([number, "C101"]), equal([number, "C110"]), equal([number, "C126"]), equal([number, "C127"]), equal([number, "131"]), equal([number, "C131"]), equal([number, "C133"]), equal([number, "190"])])])

  // COMLIT
  boolean is_comlit_170 and([equal([subject, "COMLIT"]), equal([number, "170"])])

  // CMPBIO
  boolean is_compbio_175 and([equal([subject, "CMPBIO"]), equal([number, "175"])])

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

  // LDARCH
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

  // NUCENG (all technical 4-unit UD and Grad)
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
  boolean is_pbhtlh and([equal([subject, "PBHLTH"]), or([equal([number, "142"]), equal([number, "150A"]), equal([number, "162A"]), equal([number, "252D"])])])

  // PUBPOL (290 section 002 only)
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

  boolean return or([is_anthro_107, is_arch, is_art, is_astron, is_bioeng, is_chem, is_chmeng, is_civeng, is_cogsci, is_comlit_170, is_compbio_175, is_cyplan_101, is_data, is_hist_c184d, is_sts_c104, is_demog, is_desinv, is_meceng_292c, is_deveng_290, is_dighum_101, is_econ, is_educ, is_eecs, is_eneres, is_engin, is_envecon, is_eps, is_espm, is_geog, is_indeng, is_info, is_integbi, is_ldarch, is_legalst_123, is_ling, is_math, is_mcellbi, is_me, is_music, is_neurosc, is_newmedia, is_nuceng, is_nusctx_103, is_philos, is_physics, is_polsci, is_psych_c123, is_pbhtlh, is_pubpol, is_sociol_166, is_spanish_100, is_stat, is_theater_177, is_ugba])
}

Function<number>(number, Course) add_course_units (acc, course){
  number units get_attr(course, "units")
  number return add([acc, units])
}

Function<boolean>(Course) any_upper_div_tech_finder (course) {
  boolean is_design design_upper_div_finder(course)
  boolean is_cs cs_upper_div_finder(course)
  boolean is_eecs eecs_upper_div_finder(course)
  boolean is_tech technical_elective_finder(course)
  boolean return or([is_design, is_cs, is_eecs, is_tech])
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
  NCoursesRequirement compsci_70 {math_55_compsci_70_matches, 1, "Discrete Math"}

  AndRequirement math_lower_div {[math_1a, math_1b, math_53_54, compsci_70], "Lower Division Mathematics"}

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
  List<Course> design_eligible filter(courses, design_upper_div_finder)
  number design_units reduce(design_eligible, add_course_units, 0)
  NumberRequirement design_upper_div {design_units, 4, "Design Upper Division Units"}
  
  // CS: 8 units
  List<Course> cs_eligible filter(courses, cs_upper_div_finder)
  number cs_units reduce(cs_eligible, add_course_units, 0)
  NumberRequirement cs_upper_div {cs_units, 8, "CS Upper Division Units"}

  // CS/EE/EECS: 8 units
  List<Course> eecs_eligible filter(courses, eecs_upper_div_finder)
  number eecs_units reduce(eecs_eligible, add_course_units, 0)
  NumberRequirement eecs_upper_div {eecs_units, 8, "CS/EE/EECS Upper Division Units"}

  // Technical elective: one 4-unit course
  List<Course> tech_elec_eligible filter(courses, technical_elective_finder)
  NCoursesRequirement tech_elec_upper_div {tech_elec_eligible, 1, "Upper Division Technical Elective"}

  // min 24 total units
  List<Course> total_tech_pool filter(courses, any_upper_div_tech_finder)
  number total_tech_units reduce(total_tech_pool, add_course_units, 0)
  NumberRequirement total_units_check {total_tech_units, 24, "Total Upper Division Technical Units"}

  List<Requirement> return [math_lower_div, cs_lower_div, cs_upper_div, eecs_upper_div, design_upper_div, tech_elec_upper_div, total_units_check]
}
`;

export const DATASCI_REQ_BTLL = `
Function<boolean>(Course) data_c100_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_100 and([equal([subject, "DATA"]), or([equal([number, "100"]), equal([number, "100"])])])
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
  boolean is_pbhtlh_c160 and([equal([subject, "PBHLTH"]), equal([number, "C160"])])
  boolean is_info_101 and([equal([subject, "INFO"]), equal([number, "101"])])
  boolean is_info_188 and([equal([subject, "INFO"]), equal([number, "188"])])
  boolean is_isf_100j and([equal([subject, "ISF"]), equal([number, "100J"])])
  boolean is_nwmedia_151ac and([equal([subject, "NWMEDIA"]), equal([number, "151AC"])])
  boolean is_philos_121 and([equal([subject, "PHILOS"]), equal([number, "121"])])
  boolean is_polecon_159 and([equal([subject, "POLECON"]), equal([number, "159"])])
  // BIOENG 100 only counts prior to Fall 2025
  boolean is_bioeng_100 and([equal([subject, "BIOENG"]), equal([number, "100"])])

  boolean return or([is_anthro_168, is_cyplan_101, is_data_c104, is_dighum_100, is_espm_c167, is_pbhtlh_c160, is_info_101, is_info_188, is_isf_100j, is_nwmedia_151ac, is_philos_121, is_polecon_159, is_bioeng_100])
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
  boolean is_indeng_173 and([equal([subject, "IND ENG"]), equal([number, "173"])])
  boolean is_indeng_174 and([equal([subject, "IND ENG"]), equal([number, "174"])])
  boolean is_info_159 and([equal([subject, "INFO"]), equal([number, "159"])])
  // INFO 190-1 only counts when offered with the Data Visualization topic
  boolean is_info_190_1 and([equal([subject, "INFO"]), equal([number, "190-1"])])
  boolean is_math_156 and([equal([subject, "MATH"]), equal([number, "156"])])
  boolean is_nuceng_175 and([equal([subject, "NUCENG"]), equal([number, "175"])])
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


Function<boolean>(Course) applied_math_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_math_53 and([equal([subject, "MATH"]), equal([number, "53"])])
  boolean is_math_55 and([equal([subject, "MATH"]), equal([number, "55"])])

  boolean return or([is_math_53, is_math_55])
}

Function<boolean>(Course) applied_math_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_civeng_meceng_c133_c180 and([or([equal([subject, "CIVENG"]), equal([subject, "MECENG"])]), or([equal([number, "C133"]), equal([number, "C180"])])])
  boolean is_eecs_127 and([equal([subject, "EECS"]), equal([number, "127"])])
  boolean is_engin_150 and([equal([subject, "ENGIN"]), equal([number, "150"])])
  boolean is_indeng_160 and([equal([subject, "INDENG"]), equal([number, "160"])])
  boolean is_indeng_162 and([equal([subject, "INDENG"]), equal([number, "162"])])
  boolean is_math_104 and([equal([subject, "MATH"]), equal([number, "104"])])
  boolean is_math_110 and([equal([subject, "MATH"]), equal([number, "110"])])
  boolean is_math_113 and([equal([subject, "MATH"]), equal([number, "113"])])
  boolean is_math_118 and([equal([subject, "MATH"]), equal([number, "118"])])
  boolean is_math_126 and([equal([subject, "MATH"]), equal([number, "126"])])
  boolean is_math_128a and([equal([subject, "MATH"]), equal([number, "128A"])])
  boolean is_math_128b and([equal([subject, "MATH"]), equal([number, "128B"])])
  boolean is_math_156 and([equal([subject, "MATH"]), equal([number, "156"])])
  boolean is_compsci_engin_c267_c233 and([or([equal([subject, "COMPSCI"]), equal([subject, "ENGIN"])]), or([equal([number, "C267"]), equal([number, "C233"])])])

  boolean return or([is_civeng_meceng_c133_c180, is_eecs_127, is_engin_150, is_indeng_160, is_indeng_162, is_math_104, is_math_110, is_math_113, is_math_118, is_math_126, is_math_128a, is_math_128b, is_math_156, is_compsci_engin_c267_c233])
}

Function<AndRequirement>() eval_applied_math (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, applied_math_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, applied_math_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Applied Mathematics and Modeling")
}



Function<boolean>(Course) bioinformatics_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_bio_1a and([equal([subject, "BIOLOGY"]), equal([number, "1A"])])
  boolean is_bio_1b and([equal([subject, "BIOLOGY"]), equal([number, "1B"])])
  boolean is_math_53 and([equal([subject, "MATH"]), equal([number, "53"])])

  boolean return or([is_bio_1a, is_bio_1b, is_math_53])
}

Function<boolean>(Course) bioinformatics_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_bioeng_cmpbio_131 and([or([equal([subject, "BIOENG"]), equal([subject, "CMPBIO"])]), or([equal([number, "131"]), equal([number, "C131"])])])
  boolean is_bioeng_134 and([equal([subject, "BIOENG"]), equal([number, "134"])])
  boolean is_bioeng_144 and([equal([subject, "BIOENG"]), equal([number, "144"])])
  boolean is_bioeng_145 and([equal([subject, "BIOENG"]), equal([number, "145"])])
  boolean is_bioeng_cmpbio_c149 and([or([equal([subject, "BIOENG"]), equal([subject, "CMPBIO"])]), equal([number, "C149"])])
  boolean is_chem_135 and([equal([subject, "CHEM"]), equal([number, "135"])])
  boolean is_cmpbio_156 and([equal([subject, "CMPBIO"]), equal([number, "156"])])
  boolean is_cmpbio_compsci_c176 and([or([equal([subject, "CMPBIO"]), equal([subject, "COMPSCI"])]), equal([number, "C176"])])
  boolean is_integbi_120 and([equal([subject, "INTEGBI"]), equal([number, "120"])])
  boolean is_integbi_134l and([equal([subject, "INTEGBI"]), equal([number, "134L"])])
  boolean is_integbi_141 and([equal([subject, "INTEGBI"]), equal([number, "141"])])
  boolean is_integbi_161 and([equal([subject, "INTEGBI"]), equal([number, "161"])])
  boolean is_integbi_164 and([equal([subject, "INTEGBI"]), equal([number, "164"])])
  boolean is_math_127 and([equal([subject, "MATH"]), equal([number, "127"])])
  boolean is_mcellbi_c100a and([or([equal([subject, "MCELLBI"]), equal([subject, "CHEM"])]), equal([number, "C100A"])])
  boolean is_mcellbi_102 and([equal([subject, "MCELLBI"]), equal([number, "102"])])
  boolean is_mcellbi_104 and([equal([subject, "MCELLBI"]), equal([number, "104"])])
  boolean is_mcellbi_130 and([equal([subject, "MCELLBI"]), equal([number, "130"])]) 
  boolean is_mcellbi_132 and([equal([subject, "MCELLBI"]), equal([number, "132"])])
  boolean is_mcellbi_137l and([equal([subject, "MCELLBI"]), equal([number, "137L"])])
  boolean is_mcellbi_140 and([equal([subject, "MCELLBI"]), equal([number, "140"])])
  boolean is_mcellbi_143 and([equal([subject, "MCELLBI"]), equal([number, "143"])])
  boolean is_mcellbi_146 and([equal([subject, "MCELLBI"]), equal([number, "146"])])
  boolean is_mcellbi_plantbi_c148 and([or([equal([subject, "MCELLBI"]), equal([subject, "PLANTBI"])]), equal([number, "C148"])])
  boolean is_mcellbi_149 and([equal([subject, "MCELLBI"]), equal([number, "149"])])
  boolean is_mcellbi_153 and([equal([subject, "MCELLBI"]), equal([number, "153"])])
  boolean is_plantbi_160 and([equal([subject, "PLANTBI"]), equal([number, "160"])])

  boolean return or([is_bioeng_cmpbio_131, is_bioeng_134, is_bioeng_144, is_bioeng_145, is_bioeng_cmpbio_c149, is_chem_135, is_cmpbio_156, is_cmpbio_compsci_c176, is_integbi_120, is_integbi_134l, is_integbi_141, is_integbi_161, is_integbi_164, is_math_127, is_mcellbi_c100a, is_mcellbi_102, is_mcellbi_104, is_mcellbi_130, is_mcellbi_132, is_mcellbi_137l, is_mcellbi_140, is_mcellbi_143, is_mcellbi_146, is_mcellbi_plantbi_c148, is_mcellbi_149, is_mcellbi_153, is_plantbi_160])
}

Function<AndRequirement>() eval_bioinformatics (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, bioinformatics_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, bioinformatics_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  // INTEGBI 141, 164, and MCELLBI 149 are an or-group; only one may count
  List<Course> integbi_group_list [{"INTEGBI 141"}, {"INTEGBI 164"}, {"MCELLBI 149"}]
  List<Course> integbi_group_consumed filter(upper_div_matches, (c) {
    boolean return one_common_course([c], integbi_group_list)
  })

  BooleanRequirement integbi_group_check {greater_than(length(upper_div_matches), length(integbi_group_consumed)), "Max 1: INTEGBI 141, 164, MCELLBI 149"}

  AndRequirement return AndRequirement([lower_div, upper_div, integbi_group_check], "Computational Methods in Molecular and Genomic Biology")
}



Function<boolean>(Course) business_analytics_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_econ_1 and([equal([subject, "ECON"]), equal([number, "1"])])
  boolean is_econ_2 and([equal([subject, "ECON"]), equal([number, "2"])])
  boolean is_math_53 and([equal([subject, "MATH"]), equal([number, "53"])])

  boolean return or([is_econ_1, is_econ_2, is_math_53])
}

Function<boolean>(Course) business_analytics_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  // ENGIN 183 and 183C/D sections are topic-dependent
  boolean is_engin_183 and([equal([subject, "ENGIN"]), or([equal([number, "183"]), equal([number, "183C"]), equal([number, "183D"])])])
  boolean is_indeng_115 and([equal([subject, "INDENG"]), equal([number, "115"])])
  boolean is_indeng_120 and([equal([subject, "INDENG"]), equal([number, "120"])])
  boolean is_indeng_130 and([equal([subject, "INDENG"]), equal([number, "130"])])
  boolean is_indeng_153 and([equal([subject, "INDENG"]), equal([number, "153"])])
  boolean is_indeng_156 and([equal([subject, "INDENG"]), equal([number, "156"])])
  boolean is_indeng_166 and([equal([subject, "INDENG"]), equal([number, "166"])])
  // INDENG 185 OpportunityTech topic only
  boolean is_indeng_185 and([equal([subject, "INDENG"]), equal([number, "185"])]) 
  boolean is_legalst_122 and([equal([subject, "LEGALST"]), equal([number, "122"])])
  boolean is_ugba_104 and([equal([subject, "UGBA"]), equal([number, "104"])])
  boolean is_ugba_134 and([equal([subject, "UGBA"]), equal([number, "134"])])
  boolean is_ugba_141 and([equal([subject, "UGBA"]), equal([number, "141"])])
  boolean is_ugba_142 and([equal([subject, "UGBA"]), or([equal([number, "142"]), equal([number, "147"])])]) 
  boolean is_ugba_161 and([equal([subject, "UGBA"]), equal([number, "161"])])
  // UGBA 167 topic-dependent
  boolean is_ugba_167 and([equal([subject, "UGBA"]), equal([number, "167"])]) 

  boolean return or([is_engin_183, is_indeng_115, is_indeng_120, is_indeng_130, is_indeng_153, is_indeng_156, is_indeng_166, is_indeng_185, is_legalst_122, is_ugba_104, is_ugba_134, is_ugba_141, is_ugba_142, is_ugba_161, is_ugba_167])
}

Function<AndRequirement>() eval_business_analytics (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, business_analytics_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, business_analytics_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Business and Industrial Analytics")
}



Function<boolean>(Course) cognition_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_cogsci_1 and([equal([subject, "COGSCI"]), equal([number, "1"])])
  boolean is_cogsci_1b_n1 and([equal([subject, "COGSCI"]), or([equal([number, "1B"]), equal([number, "N1"])])])
  boolean is_psych_c61 and([equal([subject, "PSYCH"]), equal([number, "C61"])])
  boolean is_psych_c64 and([equal([subject, "PSYCH"]), equal([number, "C64"])])

  boolean return or([is_cogsci_1, is_cogsci_1b_n1, is_psych_c61, is_psych_c64])
}

Function<boolean>(Course) cognition_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_cogsci_psych_c100_c120 and([or([equal([subject, "COGSCI"]), equal([subject, "PSYCH"])]), or([equal([number, "C100"]), equal([number, "C120"])])])
  boolean is_cogsci_ling_c101_c105 and([or([equal([subject, "COGSCI"]), equal([subject, "LINGUIS"])]), or([equal([number, "C101"]), equal([number, "C105"])])])
  boolean is_cogsci_psych_c126 and([or([equal([subject, "COGSCI"]), equal([subject, "PSYCH"])]), equal([number, "C126"])])
  boolean is_cogsci_psych_c127 and([or([equal([subject, "COGSCI"]), equal([subject, "PSYCH"])]), equal([number, "C127"])])
  boolean is_cogsci_psych_131_c131_c123 and([or([equal([subject, "COGSCI"]), equal([subject, "PSYCH"])]), or([equal([number, "131"]), equal([number, "C131"]), equal([number, "C123"])])])
  boolean is_cogsci_132 and([equal([subject, "COGSCI"]), equal([number, "132"])])
  boolean is_cogsci_150 and([equal([subject, "COGSCI"]), equal([number, "150"])]) 
  boolean is_cogsci_180 and([equal([subject, "COGSCI"]), equal([number, "180"])])
  boolean is_cogsci_190 and([equal([subject, "COGSCI"]), equal([number, "190"])])
  boolean is_compsci_188 and([equal([subject, "COMPSCI"]), equal([number, "188"])])
  boolean is_music_108 and([equal([subject, "MUSIC"]), or([equal([number, "108"]), equal([number, "108M"])])])
  boolean is_psych_114 and([equal([subject, "PSYCH"]), equal([number, "114"])])
  boolean is_psych_117 and([equal([subject, "PSYCH"]), equal([number, "117"])])
  boolean is_psych_131 and([equal([subject, "PSYCH"]), equal([number, "131"])])
  boolean is_psych_ling_c143_c146 and([or([equal([subject, "PSYCH"]), equal([subject, "LINGUIS"])]), or([equal([number, "C143"]), equal([number, "C146"])])])

  boolean return or([is_cogsci_psych_c100_c120, is_cogsci_ling_c101_c105, is_cogsci_psych_c126, is_cogsci_psych_c127, is_cogsci_psych_131_c131_c123, is_cogsci_132, is_cogsci_150, is_cogsci_180, is_cogsci_190, is_compsci_188, is_music_108, is_psych_114, is_psych_117, is_psych_131, is_psych_ling_c143_c146])
}

Function<AndRequirement>() eval_cognition (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, cognition_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, cognition_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Cognition")
}



Function<boolean>(Course) data_arts_humanities_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_art_23ac and([equal([subject, "ART"]), or([equal([number, "23AC"]), equal([number, "W23AC"])])])
  boolean is_history_88 and([equal([subject, "HISTORY"]), equal([number, "88"])])
  // LNS 88 only valid for specific approved topics
  boolean is_ls_88 and([equal([subject, "LNS"]), equal([number, "88"])])
  boolean is_music_29 and([equal([subject, "MUSIC"]), equal([number, "29"])])
  boolean is_music_30 and([equal([subject, "MUSIC"]), equal([number, "30"])])
  boolean is_rhetor_10 and([equal([subject, "RHETOR"]), equal([number, "10"])])

  boolean return or([is_art_23ac, is_history_88, is_ls_88, is_music_29, is_music_30, is_rhetor_10])
}

Function<boolean>(Course) data_arts_humanities_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_art_172 and([equal([subject, "ART"]), equal([number, "172"])])
  boolean is_art_173 and([equal([subject, "ART"]), equal([number, "173"])])
  boolean is_dighum_100 and([equal([subject, "DIGHUM"]), equal([number, "100"])])
  boolean is_dighum_101 and([equal([subject, "DIGHUM"]), equal([number, "101"])])
  boolean is_dighum_150a and([equal([subject, "DIGHUM"]), equal([number, "150A"])])
  boolean is_dighum_150b and([equal([subject, "DIGHUM"]), equal([number, "150B"])])
  boolean is_dighum_150c and([equal([subject, "DIGHUM"]), equal([number, "150C"])])
  boolean is_dighum_160 and([equal([subject, "DIGHUM"]), equal([number, "160"])])
  // GLOBAL 140/JEWISH 121 topic-dependent 
  boolean is_global_jewish_140_121 and([or([equal([subject, "GLOBAL"]), equal([subject, "JEWISH"])]), or([equal([number, "140"]), equal([number, "121"])])]) 
  // formerly History 100D
  boolean is_history_133d and([equal([subject, "HISTORY"]), equal([number, "133D"])]) 
  boolean is_histart_english_c109_c181 and([or([equal([subject, "HISTART"]), equal([subject, "ENGLISH"])]), or([equal([number, "C109"]), equal([number, "C181"])])])
  // HISTART 190T topic-dependent 
  boolean is_histart_190t and([equal([subject, "HISTART"]), equal([number, "190T"])]) 
  boolean is_histart_192dh and([equal([subject, "HISTART"]), equal([number, "192DH"])])
  boolean is_info_103 and([equal([subject, "INFO"]), equal([number, "103"])])
  boolean is_info_159 and([equal([subject, "INFO"]), equal([number, "159"])])
  // INFO 190-1 topic-dependent 
  boolean is_info_190_1 and([equal([subject, "INFO"]), equal([number, "190-1"])]) 
  boolean is_music_107 and([equal([subject, "MUSIC"]), equal([number, "107"])])
  boolean is_music_158a and([equal([subject, "MUSIC"]), equal([number, "158A"])])
  boolean is_music_158b and([equal([subject, "MUSIC"]), equal([number, "158B"])])
  boolean is_music_159 and([equal([subject, "MUSIC"]), equal([number, "159"])])
  // formerly NESTUD 110
  boolean is_melc_110 and([equal([subject, "MELC"]), equal([number, "110"])])
  boolean is_rhetor_107 and([equal([subject, "RHETOR"]), equal([number, "107"])])
  boolean is_rhetor_114 and([equal([subject, "RHETOR"]), equal([number, "114"])])
  boolean is_rhetor_115 and([equal([subject, "RHETOR"]), equal([number, "115"])])
  boolean is_rhetor_137 and([equal([subject, "RHETOR"]), equal([number, "137"])])
  boolean is_rhetor_145 and([equal([subject, "RHETOR"]), equal([number, "145"])])
  boolean is_rhetor_170 and([equal([subject, "RHETOR"]), equal([number, "170"])])
  // petition-only courses below; included for completeness, topic enforcement external
  boolean is_amerstd_h110 and([equal([subject, "AMERSTD"]), equal([number, "H110"])])
  // ENGLISH 166 topic-dependent 
  boolean is_english_166 and([equal([subject, "ENGLISH"]), equal([number, "166"])]) 
  // HISTORY 100S topic-dependent 
  boolean is_history_100s and([equal([subject, "HISTORY"]), equal([number, "100S"])]) 
  boolean is_history_104 and([equal([subject, "HISTORY"]), equal([number, "104"])])
  // THEATER/NWMEDIA 166/190 topic-dependent 
  boolean is_theater_nwmedia_166_190 and([or([equal([subject, "THEATER"]), equal([subject, "NWMEDIA"])]), or([equal([number, "166"]), equal([number, "190"])])]) 
  // formerly NE STUD 114
  boolean is_melc_114 and([equal([subject, "MELC"]), equal([number, "114"])]) 
  // NE STUD 190A topic-dependent 
  boolean is_nestud_190a and([equal([subject, "NE STUD"]), equal([number, "190A"])]) 
  // SPANISH 135 topic-dependent 
  boolean is_spanish_135 and([equal([subject, "SPANISH"]), equal([number, "135"])]) 

  boolean return or([is_art_172, is_art_173, is_dighum_100, is_dighum_101, is_dighum_150a, is_dighum_150b, is_dighum_150c, is_dighum_160, is_global_jewish_140_121, is_history_133d, is_histart_english_c109_c181, is_histart_190t, is_histart_192dh, is_info_103, is_info_159, is_info_190_1, is_music_107, is_music_158a, is_music_158b, is_music_159, is_melc_110, is_rhetor_107, is_rhetor_114, is_rhetor_115, is_rhetor_137, is_rhetor_145, is_rhetor_170, is_amerstd_h110, is_english_166, is_history_100s, is_history_104, is_theater_nwmedia_166_190, is_melc_114, is_nestud_190a, is_spanish_135])
}

Function<AndRequirement>() eval_data_arts_humanities (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, data_arts_humanities_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, data_arts_humanities_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Data Arts and Humanities")
}



Function<boolean>(Course) ecology_environment_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_espm_2 and([equal([subject, "ESPM"]), equal([number, "2"])])
  boolean is_espm_6 and([equal([subject, "ESPM"]), equal([number, "6"])])
  boolean is_espm_15 and([equal([subject, "ESPM"]), equal([number, "15"])])
  boolean is_geog_40 and([equal([subject, "GEOG"]), equal([number, "40"])])
  boolean is_espm_ls_c46 and([or([equal([subject, "ESPM"]), equal([subject, "LNS"])]), equal([number, "C46"])])
  boolean is_espm_88b and([equal([subject, "ESPM"]), equal([number, "88B"])])
  boolean is_eps_80 and([equal([subject, "EPS"]), equal([number, "80"])])

  boolean return or([is_espm_2, is_espm_6, is_espm_15, is_geog_40, is_espm_ls_c46, is_espm_88b, is_eps_80])
}

Function<boolean>(Course) ecology_environment_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_eneres_102 and([equal([subject, "ENERES"]), equal([number, "102"])])
  // ESPM 102B + 102BL are a paired 2+2 unit combo counting as ONE upper-div slot.
  // Both must be present; pairing enforced in main() via BooleanRequirement.
  boolean is_espm_102b and([equal([subject, "ESPM"]), equal([number, "102B"])])
  boolean is_espm_102bl and([equal([subject, "ESPM"]), equal([number, "102BL"])])
  boolean is_espm_integbi_c103_c156 and([or([equal([subject, "ESPM"]), equal([subject, "INTEGBI"])]), or([equal([number, "C103"]), equal([number, "C156"])])])
  boolean is_espm_111 and([equal([subject, "ESPM"]), equal([number, "111"])])
  boolean is_eps_espm_c129 and([or([equal([subject, "EPS"]), equal([subject, "ESPM"])]), equal([number, "C129"])])
  boolean is_espm_130a and([equal([subject, "ESPM"]), equal([number, "130A"])])
  boolean is_espm_152 and([equal([subject, "ESPM"]), equal([number, "152"])]) 
  boolean is_espm_157 and([equal([subject, "ESPM"]), equal([number, "157"])])
  boolean is_espm_eps_c170_c183 and([or([equal([subject, "ESPM"]), equal([subject, "EPS"])]), or([equal([number, "C170"]), equal([number, "C183"])])])
  boolean is_espm_174a and([equal([subject, "ESPM"]), equal([number, "174A"])])
  boolean is_civeng_eps_espm_c106_c180 and([or([equal([subject, "CIVENG"]), equal([subject, "EPS"]), equal([subject, "ESPM"])]), or([equal([number, "C106"]), equal([number, "C180"])])])
  boolean is_integbi_espm_c153 and([or([equal([subject, "INTEGBI"]), equal([subject, "ESPM"])]), equal([number, "C153"])])
  boolean is_integbi_170lf and([equal([subject, "INTEGBI"]), equal([number, "170LF"])])

  boolean return or([is_eneres_102, is_espm_102b, is_espm_102bl, is_espm_integbi_c103_c156, is_espm_111, is_eps_espm_c129, is_espm_130a, is_espm_152, is_espm_157, is_espm_eps_c170_c183, is_espm_174a, is_civeng_eps_espm_c106_c180, is_integbi_espm_c153, is_integbi_170lf])
}

Function<AndRequirement>() eval_ecology_environment (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, ecology_environment_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, ecology_environment_upper_div_finder)

  // ESPM 102B + 102BL pairing:
  // The pair counts as ONE slot. If a student uses both, the NCoursesRequirement
  // would incorrectly treat them as two separate slots. We enforce that the pair
  // together counts as at most one slot by checking whether 102BL appears without
  // 102B (invalid) and collapsing the pair into a synthetic slot count.
  List<Course> espm_102b_list [{"ESPM 102B"}]
  List<Course> espm_102bl_list [{"ESPM 102BL"}]
  List<Course> espm_102b_matches filter(courses, (c) {
    boolean return one_common_course([c], espm_102b_list)
  })
  List<Course> espm_102bl_matches filter(courses, (c) {
    boolean return one_common_course([c], espm_102bl_list)
  })
  boolean has_102b greater_than(length(espm_102b_matches), 0)
  boolean has_102bl greater_than(length(espm_102bl_matches), 0)

  // 102BL may only count when paired with 102B
  BooleanRequirement espm_102bl_pairing_check {or([not(has_102bl), and([has_102bl, has_102b])]), "ESPM 102BL must be paired with ESPM 102B"}

  // The pair together counts as ONE upper-div slot, not two.
  // Build an adjusted pool that replaces both with a single representative entry.
  List<Course> adjusted_upper_div_matches filter(upper_div_matches, (c) {
    string number get_attr(c, "number")
    boolean is_102b equal([number, "102B"])
    boolean is_102bl equal([number, "102BL"])
    boolean is_pair_course or([is_102b, is_102bl])
    boolean has_both and([has_102b, has_102bl])
    boolean is_valid_pair and([is_pair_course, has_both])
    boolean is_non_pair not(is_pair_course)
    boolean return or([is_non_pair, is_valid_pair])
  })

  NCoursesRequirement upper_div {adjusted_upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div, espm_102bl_pairing_check], "Ecology and Environment")
}



Function<boolean>(Course) economics_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_econ_1 and([equal([subject, "ECON"]), equal([number, "1"])])
  boolean is_econ_2 and([equal([subject, "ECON"]), equal([number, "2"])])
  // also approved as Data 88 prior to Spring 2021
  boolean is_data_88e and([equal([subject, "DATA"]), or([equal([number, "88E"]), equal([number, "88"])])]) 

  boolean return or([is_econ_1, is_econ_2, is_data_88e])
}

Function<boolean>(Course) economics_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  // only one of 100A/101A/100B/101B may count; mutual exclusion enforced in main()
  boolean is_econ_100a and([equal([subject, "ECON"]), equal([number, "100A"])])
  boolean is_econ_101a and([equal([subject, "ECON"]), equal([number, "101A"])])
  boolean is_econ_100b and([equal([subject, "ECON"]), equal([number, "100B"])])
  boolean is_econ_101b and([equal([subject, "ECON"]), equal([number, "101B"])])
  boolean is_econ_math_c103 and([or([equal([subject, "ECON"]), equal([subject, "MATH"])]), equal([number, "C103"])])
  // ECON 104 approved if taken prior to Spring 2026
  boolean is_econ_104 and([equal([subject, "ECON"]), equal([number, "104"])]) 
  boolean is_econ_polsci_c110_c135 and([or([equal([subject, "ECON"]), equal([subject, "POLSCI"])]), or([equal([number, "C110"]), equal([number, "C135"])])])
  boolean is_econ_119 and([equal([subject, "ECON"]), equal([number, "119"])])
  boolean is_econ_121 and([equal([subject, "ECON"]), equal([number, "121"])])
  boolean is_econ_envecon_c125_c101 and([or([equal([subject, "ECON"]), equal([subject, "ENVECON"])]), or([equal([number, "C125"]), equal([number, "C101"])])])
  boolean is_econ_127 and([equal([subject, "ECON"]), equal([number, "127"])])
  boolean is_econ_131 and([equal([subject, "ECON"]), equal([number, "131"])])
  boolean is_econ_134 and([equal([subject, "ECON"]), equal([number, "134"])])
  boolean is_econ_136 and([equal([subject, "ECON"]), equal([number, "136"])])
  boolean is_econ_139 and([equal([subject, "ECON"]), equal([number, "139"])])
  // only one of 140 or 141 may count; mutual exclusion enforced in main()
  boolean is_econ_140 and([equal([subject, "ECON"]), equal([number, "140"])])
  boolean is_econ_141 and([equal([subject, "ECON"]), equal([number, "141"])])
  boolean is_econ_pubpol_polsci_c142_c131a and([or([equal([subject, "ECON"]), equal([subject, "PUBPOL"]), equal([subject, "POLSCI"])]), or([equal([number, "C142"]), equal([number, "C131A"])])])
  boolean is_econ_143 and([equal([subject, "ECON"]), equal([number, "143"])])
  boolean is_econ_144 and([equal([subject, "ECON"]), equal([number, "144"])])
  boolean is_econ_compsci_c147_c177 and([or([equal([subject, "ECON"]), equal([subject, "COMPSCI"])]), or([equal([number, "C147"]), equal([number, "C177"])])])
  boolean is_econ_148 and([equal([subject, "ECON"]), equal([number, "148"])])
  boolean is_econ_151 and([equal([subject, "ECON"]), equal([number, "151"])])
  boolean is_econ_152 and([equal([subject, "ECON"]), equal([number, "152"])])
  boolean is_econ_165 and([equal([subject, "ECON"]), equal([number, "165"])])
  boolean is_econ_172 and([equal([subject, "ECON"]), equal([number, "172"])])
  boolean is_econ_174 and([equal([subject, "ECON"]), equal([number, "174"])])
  boolean is_econ_demog_c175 and([or([equal([subject, "ECON"]), equal([subject, "DEMOG"])]), equal([number, "C175"])])
  boolean is_econ_envecon_c184_c132 and([or([equal([subject, "ECON"]), equal([subject, "ENVECON"])]), or([equal([number, "C184"]), equal([number, "C132"])])])
  // ENVECON/IAS C118 approved if taken prior to Spring 2026
  boolean is_envecon_ias_c118 and([or([equal([subject, "ENVECON"]), equal([subject, "IAS"])]), equal([number, "C118"])])

  boolean return or([is_econ_100a, is_econ_101a, is_econ_100b, is_econ_101b, is_econ_math_c103, is_econ_104, is_econ_polsci_c110_c135, is_econ_119, is_econ_121, is_econ_envecon_c125_c101, is_econ_127, is_econ_131, is_econ_134, is_econ_136, is_econ_139, is_econ_140, is_econ_141, is_econ_pubpol_polsci_c142_c131a, is_econ_143, is_econ_144, is_econ_compsci_c147_c177, is_econ_148, is_econ_151, is_econ_152, is_econ_165, is_econ_172, is_econ_174, is_econ_demog_c175, is_econ_envecon_c184_c132, is_envecon_ias_c118])
}

Function<AndRequirement>() eval_economics (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, economics_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, economics_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  // Only one of ECON 100A, 101A, 100B, 101B may count
  List<Course> econ_intro_list [{"ECON 100A"}, {"ECON 101A"}, {"ECON 100B"}, {"ECON 101B"}]
  List<Course> econ_intro_consumed filter(upper_div_matches, (c) {
    boolean return one_common_course([c], econ_intro_list)
  })
  BooleanRequirement econ_intro_check {not(greater_than(length(econ_intro_consumed), 1)), "Max 1: ECON 100A, 101A, 100B, 101B"}

  // Only one of ECON 140 or 141 may count
  List<Course> econ_metrics_list [{"ECON 140"}, {"ECON 141"}]
  List<Course> econ_metrics_consumed filter(upper_div_matches, (c) {
    boolean return one_common_course([c], econ_metrics_list)
  })
  BooleanRequirement econ_metrics_check {not(greater_than(length(econ_metrics_consumed), 1)), "Max 1: ECON 140, 141"}

  AndRequirement return AndRequirement([lower_div, upper_div, econ_intro_check, econ_metrics_check], "Economics")
}



Function<boolean>(Course) education_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_educ_40ac and([equal([subject, "EDUC"]), equal([number, "40AC"])])
  // EDUC W161 may count as lower OR upper div but not both
  boolean is_educ_w161 and([equal([subject, "EDUC"]), equal([number, "W161"])])

  boolean return or([is_educ_40ac, is_educ_w161])
}

Function<boolean>(Course) education_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  // COMPSCI 194 only when offered with STAR Assessments topic 
  boolean is_compsci_194 and([equal([subject, "COMPSCI"]), equal([number, "194"])])
  boolean is_data_144 and([equal([subject, "DATA"]), equal([number, "144"])])
  boolean is_educ_edstem_c122 and([or([equal([subject, "EDUC"]), equal([subject, "EDSTEM"])]), equal([number, "C122"])])
  boolean is_educ_130 and([equal([subject, "EDUC"]), equal([number, "130"])])
  boolean is_educ_global_c142_c129 and([or([equal([subject, "EDUC"]), equal([subject, "GLOBAL"])]), or([equal([number, "C142"]), equal([number, "C129"])])])
  boolean is_educ_w153 and([equal([subject, "EDUC"]), equal([number, "W153"])])
  // EDUC W161 may count as lower OR upper div but not both
  boolean is_educ_w161 and([equal([subject, "EDUC"]), equal([number, "W161"])])
  boolean is_educ_161c and([equal([subject, "EDUC"]), equal([number, "161C"])])
  boolean is_educ_168 and([equal([subject, "EDUC"]), equal([number, "168"])])
  boolean is_educ_170 and([equal([subject, "EDUC"]), equal([number, "170"])])
  boolean is_sociol_113 and([equal([subject, "SOCIOL"]), or([equal([number, "113"]), equal([number, "113AC"])])])
  boolean is_sociol_180e and([equal([subject, "SOCIOL"]), equal([number, "180E"])])
  // graduate courses 
  boolean is_educ_260 and([equal([subject, "EDUC"]), equal([number, "260"])])
  boolean is_educ_274a and([equal([subject, "EDUC"]), equal([number, "274A"])])
  boolean is_educ_274b and([equal([subject, "EDUC"]), equal([number, "274B"])])
  boolean is_educ_275b and([equal([subject, "EDUC"]), equal([number, "275B"])])
  boolean is_educ_275g and([equal([subject, "EDUC"]), equal([number, "275G"])])
  boolean is_educ_276a and([equal([subject, "EDUC"]), equal([number, "276A"])])
  boolean is_educ_293a and([equal([subject, "EDUC"]), equal([number, "293A"])])

  boolean return or([is_compsci_194, is_data_144, is_educ_edstem_c122, is_educ_130, is_educ_global_c142_c129, is_educ_w153, is_educ_w161, is_educ_161c, is_educ_168, is_educ_170, is_sociol_113, is_sociol_180e, is_educ_260, is_educ_274a, is_educ_274b, is_educ_275b, is_educ_275g, is_educ_276a, is_educ_293a])
}

Function<AndRequirement>() eval_education (){
  List<Course> courses get_attr(this, "allCourses")

  // EDUC W161 special rule: may count as lower OR upper div, but not both
  // If used as lower div, it must not also appear in upper div consumed courses
  List<Course> w161_list [{"EDUC W161"}]
  List<Course> w161_matches filter(courses, (c) {
    boolean return one_common_course([c], w161_list)
  })
  boolean has_w161 greater_than(length(w161_matches), 0)

  List<Course> educ_40ac_list [{"EDUC 40AC"}]
  List<Course> educ_40ac_matches filter(courses, (c) {
    boolean return one_common_course([c], educ_40ac_list)
  })
  boolean has_educ_40ac greater_than(length(educ_40ac_matches), 0)

  // W161 is being used for lower div only if no other lower div course is present
  boolean w161_used_for_lower_div and([has_w161, not(has_educ_40ac)])

  List<Course> lower_div_matches filter(courses, education_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  // When W161 fills lower div, exclude it from upper div pool
  List<Course> upper_div_pool filter(courses, (c) {
    boolean is_in_w161 contains(w161_matches, c)
    boolean should_exclude and([w161_used_for_lower_div, is_in_w161])
    boolean is_valid not(should_exclude)
    boolean is_upper_div education_upper_div_finder(c)
    boolean return and([is_valid, is_upper_div])
  })
  NCoursesRequirement upper_div {upper_div_pool, 2, "Upper Division"}

  BooleanRequirement w161_double_count_check {not(and([w161_used_for_lower_div, one_common_course(upper_div_pool, w161_list)])), "EDUC W161 may not double count"}

  AndRequirement return AndRequirement([lower_div, upper_div, w161_double_count_check], "Education")
}



Function<boolean>(Course) environment_resource_society_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_econ_envecon_c3_c1 and([or([equal([subject, "ECON"]), equal([subject, "ENVECON"])]), or([equal([number, "C3"]), equal([number, "C1"])])])
  boolean is_espm_50ac and([equal([subject, "ESPM"]), equal([number, "50AC"])])

  boolean return or([is_econ_envecon_c3_c1, is_espm_50ac])
}

Function<boolean>(Course) environment_resource_society_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_envecon_100 and([equal([subject, "ENVECON"]), equal([number, "100"])])
  boolean is_envecon_econ_c101_c125 and([or([equal([subject, "ENVECON"]), equal([subject, "ECON"])]), or([equal([number, "C101"]), equal([number, "C125"])])])
  boolean is_envecon_c102 and([equal([subject, "ENVECON"]), equal([number, "C102"])])
  boolean is_envecon_espm_c115_c104 and([or([equal([subject, "ENVECON"]), equal([subject, "ESPM"])]), or([equal([number, "C115"]), equal([number, "C104"])])])
  boolean is_envecon_141 and([equal([subject, "ENVECON"]), equal([number, "141"])])
  boolean is_envecon_142 and([equal([subject, "ENVECON"]), equal([number, "142"])])
  boolean is_envecon_145 and([equal([subject, "ENVECON"]), equal([number, "145"])])
  boolean is_envecon_147 and([equal([subject, "ENVECON"]), equal([number, "147"])])
  boolean is_envecon_153 and([equal([subject, "ENVECON"]), equal([number, "153"])])
  boolean is_eneres_pubpol_c100_c184 and([or([equal([subject, "ENERES"]), equal([subject, "PUBPOL"])]), or([equal([number, "C100"]), equal([number, "C184"]), equal([number, "W100"]), equal([number, "W184"])])])
  boolean is_eneres_131 and([equal([subject, "ENERES"]), equal([number, "131"])])
  boolean is_eneres_envecon_ias_c176 and([or([equal([subject, "ENERES"]), equal([subject, "ENVECON"]), equal([subject, "IAS"])]), equal([number, "C176"])])
  boolean is_espm_102c and([equal([subject, "ESPM"]), equal([number, "102C"])])
  boolean is_espm_102d and([equal([subject, "ESPM"]), equal([number, "102D"])])
  boolean is_espm_151 and([equal([subject, "ESPM"]), equal([number, "151"])])
  boolean is_espm_155ac and([equal([subject, "ESPM"]), equal([number, "155AC"])])
  boolean is_espm_157 and([equal([subject, "ESPM"]), equal([number, "157"])])
  boolean is_espm_168 and([equal([subject, "ESPM"]), equal([number, "168"])])
  boolean is_espm_186 and([equal([subject, "ESPM"]), equal([number, "186"])])

  boolean return or([is_envecon_100, is_envecon_econ_c101_c125, is_envecon_c102, is_envecon_espm_c115_c104, is_envecon_141, is_envecon_142, is_envecon_145, is_envecon_147, is_envecon_153, is_eneres_pubpol_c100_c184, is_eneres_131, is_eneres_envecon_ias_c176, is_espm_102c, is_espm_102d, is_espm_151, is_espm_155ac, is_espm_157, is_espm_168, is_espm_186])
}

Function<AndRequirement>() eval_environment_resource_society (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, environment_resource_society_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, environment_resource_society_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Environment, Resource Management, and Society")
}



Function<boolean>(Course) evolution_biodiversity_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_bio_1a and([equal([subject, "BIOLOGY"]), equal([number, "1A"])])
  boolean is_bio_1b and([equal([subject, "BIOLOGY"]), equal([number, "1B"])])

  boolean return or([is_bio_1a, is_bio_1b])
}

Function<boolean>(Course) evolution_biodiversity_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_espm_integbi_c105 and([or([equal([subject, "ESPM"]), equal([subject, "INTEGBI"])]), equal([number, "C105"])])
  boolean is_espm_108b and([equal([subject, "ESPM"]), equal([number, "108B"])])
  boolean is_espm_geog_integbi_c125_c148_c166 and([or([equal([subject, "ESPM"]), equal([subject, "GEOG"]), equal([subject, "INTEGBI"])]), or([equal([number, "C125"]), equal([number, "C148"]), equal([number, "C166"])])])
  boolean is_espm_152 and([equal([subject, "ESPM"]), equal([number, "152"])])
  boolean is_integbi_plantbi_c109 and([or([equal([subject, "INTEGBI"]), equal([subject, "PLANTBI"])]), equal([number, "C109"])])
  boolean is_integbi_113l and([equal([subject, "INTEGBI"]), equal([number, "113L"])])
  // INTEGBI 117 + 117LF are a paired 2+2 unit combo counting as ONE upper-div slot.
  // Both must be present
  boolean is_integbi_117 and([equal([subject, "INTEGBI"]), equal([number, "117"])])
  boolean is_integbi_117lf and([equal([subject, "INTEGBI"]), equal([number, "117LF"])])
  // only one of 141 or 164 may count
  boolean is_integbi_141 and([equal([subject, "INTEGBI"]), equal([number, "141"])])
  boolean is_integbi_164 and([equal([subject, "INTEGBI"]), equal([number, "164"])])
  // only one of 160 or 167 may count 
  boolean is_integbi_160 and([equal([subject, "INTEGBI"]), equal([number, "160"])])
  boolean is_integbi_167 and([equal([subject, "INTEGBI"]), equal([number, "167"])])
  boolean is_integbi_161 and([equal([subject, "INTEGBI"]), equal([number, "161"])])
  boolean is_integbi_162 and([equal([subject, "INTEGBI"]), equal([number, "162"])])
  boolean is_integbi_169 and([equal([subject, "INTEGBI"]), equal([number, "169"])])
  boolean is_integbi_172 and([equal([subject, "INTEGBI"]), equal([number, "172"])])

  boolean return or([is_espm_integbi_c105, is_espm_108b, is_espm_geog_integbi_c125_c148_c166, is_espm_152, is_integbi_plantbi_c109, is_integbi_113l, is_integbi_117, is_integbi_117lf, is_integbi_141, is_integbi_164, is_integbi_160, is_integbi_167, is_integbi_161, is_integbi_162, is_integbi_169, is_integbi_172])
}

Function<AndRequirement>() eval_evolution_biodiversity (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, evolution_biodiversity_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, evolution_biodiversity_upper_div_finder)

  // INTEGBI 117 + 117LF pairing:
  // The lecture+lab pair counts as ONE slot. Enforce 117LF may only count with 117,
  // then collapse the pair into a single slot in the adjusted pool.
  List<Course> integbi_117_list [{"INTEGBI 117"}]
  List<Course> integbi_117lf_list [{"INTEGBI 117LF"}]
  List<Course> integbi_117_matches filter(courses, (c) {
    boolean return one_common_course([c], integbi_117_list)
  })
  List<Course> integbi_117lf_matches filter(courses, (c) {
    boolean return one_common_course([c], integbi_117lf_list)
  })
  boolean has_117 greater_than(length(integbi_117_matches), 0)
  boolean has_117lf greater_than(length(integbi_117lf_matches), 0)

  // 117LF may only count when paired with 117
  BooleanRequirement integbi_117lf_pairing_check {or([not(has_117lf), and([has_117lf, has_117])]), "INTEGBI 117LF must be paired with INTEGBI 117"}

  // Collapse pair to one slot in the adjusted pool
  List<Course> adjusted_upper_div_matches filter(upper_div_matches, (c) {
    string number get_attr(c, "number")
    boolean is_117 equal([number, "117"])
    boolean is_117lf equal([number, "117LF"])
    boolean is_pair_course or([is_117, is_117lf])
    boolean has_both and([has_117, has_117lf])
    boolean is_valid_pair and([is_pair_course, has_both])
    boolean is_non_pair not(is_pair_course)
    boolean return or([is_non_pair, is_valid_pair])
  })

  NCoursesRequirement upper_div {adjusted_upper_div_matches, 2, "Upper Division"}

  // Only one of INTEGBI 141 or 164 may count
  List<Course> integbi_141_164_list [{"INTEGBI 141"}, {"INTEGBI 164"}]
  List<Course> integbi_141_164_consumed filter(upper_div_matches, (c) {
    boolean return one_common_course([c], integbi_141_164_list)
  })
  BooleanRequirement integbi_141_164_check {not(greater_than(length(integbi_141_164_consumed), 1)), "Max 1: INTEGBI 141, 164"}

  // Only one of INTEGBI 160 or 167 may count
  List<Course> integbi_160_167_list [{"INTEGBI 160"}, {"INTEGBI 167"}]
  List<Course> integbi_160_167_consumed filter(upper_div_matches, (c) {
    boolean return one_common_course([c], integbi_160_167_list)
  })
  BooleanRequirement integbi_160_167_check {not(greater_than(length(integbi_160_167_consumed), 1)), "Max 1: INTEGBI 160, 167"}

  AndRequirement return AndRequirement([lower_div, upper_div, integbi_117lf_pairing_check, integbi_141_164_check, integbi_160_167_check], "Evolution and Biodiversity")
}



Function<boolean>(Course) geospatial_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_civeng_cyplan_c88 and([or([equal([subject, "CIVENG"]), equal([subject, "CYPLAN"])]), equal([number, "C88"])])
  boolean is_espm_72 and([equal([subject, "ESPM"]), equal([number, "72"])])
  boolean is_espm_88a and([equal([subject, "ESPM"]), equal([number, "88A"])])
  boolean is_eps_50 and([equal([subject, "EPS"]), equal([number, "50"])])
  boolean is_eps_88 and([equal([subject, "EPS"]), equal([number, "88"])])
  boolean is_geog_80 and([equal([subject, "GEOG"]), equal([number, "80"])])
  boolean is_geog_88 and([equal([subject, "GEOG"]), equal([number, "88"])]) 

  boolean return or([is_civeng_cyplan_c88, is_espm_72, is_espm_88a, is_eps_50, is_eps_88, is_geog_80, is_geog_88])
}

Function<boolean>(Course) geospatial_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_geog_183 and([equal([subject, "GEOG"]), equal([number, "183"])])
  boolean is_geog_185 and([equal([subject, "GEOG"]), equal([number, "185"])])
  boolean is_geog_186 and([equal([subject, "GEOG"]), equal([number, "186"])])
  boolean is_geog_187 and([equal([subject, "GEOG"]), equal([number, "187"])])
  boolean is_geog_ldarch_c188 and([or([equal([subject, "GEOG"]), equal([subject, "LDARCH"])]), equal([number, "C188"])])
  boolean is_eps_101 and([equal([subject, "EPS"]), equal([number, "101"])])
  boolean is_eps_115 and([equal([subject, "EPS"]), equal([number, "115"])])
  boolean is_espm_137 and([equal([subject, "ESPM"]), equal([number, "137"])])
  boolean is_espm_164 and([equal([subject, "ESPM"]), equal([number, "164"])])
  boolean is_espm_civeng_c172 and([or([equal([subject, "ESPM"]), equal([subject, "CIVENG"])]), equal([number, "C172"])])
  boolean is_espm_173 and([equal([subject, "ESPM"]), equal([number, "173"])])
  boolean is_espm_ldarch_c177 and([or([equal([subject, "ESPM"]), equal([subject, "LDARCH"])]), equal([number, "C177"])])
  boolean is_pbhlth_177a and([equal([subject, "PBHLTH"]), equal([number, "177A"])])

  boolean return or([is_geog_183, is_geog_185, is_geog_186, is_geog_187, is_geog_ldarch_c188, is_eps_101, is_eps_115, is_espm_137, is_espm_164, is_espm_civeng_c172, is_espm_173, is_espm_ldarch_c177, is_pbhlth_177a])
}

Function<AndRequirement>() eval_geospatial (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, geospatial_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, geospatial_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Geospatial Information and Technology")
}



Function<boolean>(Course) human_population_health_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_bio_1a and([equal([subject, "BIOLOGY"]), equal([number, "1A"])])
  boolean is_bio_1b and([equal([subject, "BIOLOGY"]), equal([number, "1B"])])
  boolean is_mcellbi_50 and([equal([subject, "MCELLBI"]), equal([number, "50"])])

  boolean return or([is_bio_1a, is_bio_1b, is_mcellbi_50])
}

Function<boolean>(Course) human_population_health_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_demog_110 and([equal([subject, "DEMOG"]), equal([number, "110"])])
  boolean is_demog_130 and([equal([subject, "DEMOG"]), equal([number, "130"])])
  boolean is_integbi_114 and([equal([subject, "INTEGBI"]), equal([number, "114"])])
  boolean is_integbi_116l and([equal([subject, "INTEGBI"]), equal([number, "116L"])])
  boolean is_integbi_132 and([equal([subject, "INTEGBI"]), equal([number, "132"])])
  boolean is_integbi_137 and([equal([subject, "INTEGBI"]), equal([number, "137"])])
  boolean is_integbi_140 and([equal([subject, "INTEGBI"]), equal([number, "140"])])
  boolean is_mcb_132 and([equal([subject, "MCB"]), equal([number, "132"])])
  boolean is_nusctx_110 and([equal([subject, "NUSCTX"]), equal([number, "110"])]) 
  boolean is_nusctx_121 and([equal([subject, "NUSCTX"]), equal([number, "121"])]) 
  boolean is_nusctx_160 and([equal([subject, "NUSCTX"]), equal([number, "160"])])
  boolean is_nusctx_espm_c159 and([or([equal([subject, "NUSCTX"]), equal([subject, "ESPM"])]), equal([number, "C159"])]) 
  boolean is_pbhlth_132 and([equal([subject, "PBHLTH"]), equal([number, "132"])])
  boolean is_pbhlth_150a and([equal([subject, "PBHLTH"]), equal([number, "150A"])])
  boolean is_pbhlth_150b and([equal([subject, "PBHLTH"]), equal([number, "150B"])])
  boolean is_pbhlth_162a and([equal([subject, "PBHLTH"]), equal([number, "162A"])])
  boolean is_pbhlth_181 and([equal([subject, "PBHLTH"]), equal([number, "181"])])

  boolean return or([is_demog_110, is_demog_130, is_integbi_114, is_integbi_116l, is_integbi_132, is_integbi_137, is_integbi_140, is_mcb_132, is_nusctx_110, is_nusctx_121, is_nusctx_160, is_nusctx_espm_c159, is_pbhlth_132, is_pbhlth_150a, is_pbhlth_150b, is_pbhlth_162a, is_pbhlth_181])
}

Function<AndRequirement>() eval_human_population_health (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, human_population_health_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, human_population_health_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Human and Population Health")
}



Function<boolean>(Course) human_behavior_psychology_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_cogsci_1 and([equal([subject, "COGSCI"]), equal([number, "1"])])
  boolean is_cogsci_1b_n1 and([equal([subject, "COGSCI"]), or([equal([number, "1B"]), equal([number, "N1"])])])
  boolean is_psych_1 and([equal([subject, "PSYCH"]), equal([number, "1"])])
  boolean is_psych_2 and([equal([subject, "PSYCH"]), equal([number, "2"])])

  boolean return or([is_cogsci_1, is_cogsci_1b_n1, is_psych_1, is_psych_2])
}

Function<boolean>(Course) human_behavior_psychology_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_cogsci_131_c131 and([equal([subject, "COGSCI"]), or([equal([number, "131"]), equal([number, "C131"])])])
  boolean is_econ_polsci_c110_c135 and([or([equal([subject, "ECON"]), equal([subject, "POLSCI"])]), or([equal([number, "C110"]), equal([number, "C135"])])])
  boolean is_econ_119 and([equal([subject, "ECON"]), equal([number, "119"])])
  boolean is_psych_101d and([equal([subject, "PSYCH"]), equal([number, "101D"])])
  boolean is_psych_110 and([equal([subject, "PSYCH"]), equal([number, "110"])])
  boolean is_psych_124 and([equal([subject, "PSYCH"]), equal([number, "124"])])
  boolean is_psych_130 and([equal([subject, "PSYCH"]), equal([number, "130"])])
  boolean is_psych_134_n134 and([equal([subject, "PSYCH"]), or([equal([number, "134"]), equal([number, "N134"])])])
  boolean is_psych_140 and([equal([subject, "PSYCH"]), equal([number, "140"])])
  boolean is_psych_150 and([equal([subject, "PSYCH"]), equal([number, "150"])])
  boolean is_psych_156 and([equal([subject, "PSYCH"]), equal([number, "156"])])
  // only one of PSYCH 160 or SOCIOL 150 may count 
  boolean is_psych_160 and([equal([subject, "PSYCH"]), equal([number, "160"])])
  boolean is_sociol_150 and([equal([subject, "SOCIOL"]), equal([number, "150"])])
  boolean is_psych_167ac and([equal([subject, "PSYCH"]), equal([number, "167AC"])])
  boolean is_ugba_160 and([equal([subject, "UGBA"]), equal([number, "160"])])

  boolean return or([is_cogsci_131_c131, is_econ_polsci_c110_c135, is_econ_119, is_psych_101d, is_psych_110, is_psych_124, is_psych_130, is_psych_134_n134, is_psych_140, is_psych_150, is_psych_156, is_psych_160, is_sociol_150, is_psych_167ac, is_ugba_160])
}

Function<AndRequirement>() eval_human_behavior_psychology (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, human_behavior_psychology_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, human_behavior_psychology_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  // Only one of PSYCH 160 or SOCIOL 150 may count
  List<Course> psych_sociol_150_160_list [{"PSYCH 160"}, {"SOCIOL 150"}]
  List<Course> psych_sociol_150_160_consumed filter(upper_div_matches, (c) {
    boolean return one_common_course([c], psych_sociol_150_160_list)
  })
  BooleanRequirement psych_sociol_check {not(greater_than(length(psych_sociol_150_160_consumed), 1)), "Max 1: PSYCH 160, SOCIOL 150"}

  AndRequirement return AndRequirement([lower_div, upper_div, psych_sociol_check], "Human Behavior and Psychology")
}



Function<boolean>(Course) inequalities_in_society_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_4ac and([equal([subject, "DATA"]), equal([number, "4AC"])])
  boolean is_sociol_1 and([equal([subject, "SOCIOL"]), equal([number, "1"])])
  boolean is_sociol_3ac and([equal([subject, "SOCIOL"]), equal([number, "3AC"])])

  boolean return or([is_data_4ac, is_sociol_1, is_sociol_3ac])
}

Function<boolean>(Course) inequalities_in_society_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  // only one of AFRICAM 101 or ETH STD 101A may count 
  boolean is_africam_101 and([equal([subject, "AFRICAM"]), equal([number, "101"])])
  boolean is_ethstd_101a and([equal([subject, "ETH STD"]), equal([number, "101A"])])
  boolean is_africam_111 and([equal([subject, "AFRICAM"]), equal([number, "111"])])
  // formerly AFRICAN C155/GEOG C155
  boolean is_geog_155 and([equal([subject, "GEOG"]), equal([number, "155"])]) 
  boolean is_africam_geog_c155 and([or([equal([subject, "AFRICAM"]), equal([subject, "GEOG"])]), equal([number, "C155"])])
  boolean is_gws_131 and([equal([subject, "GWS"]), equal([number, "131"])])
  boolean is_philos_117ac and([equal([subject, "PHILOS"]), equal([number, "117AC"])])
  boolean is_polsci_132c and([equal([subject, "POLSCI"]), equal([number, "132C"])])
  boolean is_polsci_167 and([equal([subject, "POLSCI"]), equal([number, "167"])])
  boolean is_psych_167 and([equal([subject, "PSYCH"]), equal([number, "167"])])
  boolean is_pubpol_c103 and([equal([subject, "PUBPOL"]), equal([number, "C103"])])
  boolean is_pubpol_117ac and([equal([subject, "PUBPOL"]), equal([number, "117AC"])])
  boolean is_sociol_111ac and([equal([subject, "SOCIOL"]), equal([number, "111AC"])])
  // only one of SOCIOL 113 or 113AC may count 
  boolean is_sociol_113 and([equal([subject, "SOCIOL"]), equal([number, "113"])])
  boolean is_sociol_113ac and([equal([subject, "SOCIOL"]), equal([number, "113AC"])])
  boolean is_sociol_124 and([equal([subject, "SOCIOL"]), equal([number, "124"])])
  boolean is_sociol_127 and([equal([subject, "SOCIOL"]), equal([number, "127"])])
  // only one of SOCIOL 130 or 130AC may count 
  boolean is_sociol_130 and([equal([subject, "SOCIOL"]), equal([number, "130"])])
  boolean is_sociol_130ac and([equal([subject, "SOCIOL"]), equal([number, "130AC"])])
  boolean is_sociol_131ac and([equal([subject, "SOCIOL"]), equal([number, "131AC"])])
  boolean is_sociol_133 and([equal([subject, "SOCIOL"]), equal([number, "133"])])
  boolean is_sociol_180e and([equal([subject, "SOCIOL"]), equal([number, "180E"])])
  boolean is_sociol_180i and([equal([subject, "SOCIOL"]), equal([number, "180I"])])
  boolean is_sociol_182 and([equal([subject, "SOCIOL"]), equal([number, "182"])])

  boolean return or([is_africam_101, is_ethstd_101a, is_africam_111, is_geog_155, is_gws_131, is_philos_117ac, is_polsci_132c, is_polsci_167, is_psych_167, is_pubpol_c103, is_pubpol_117ac, is_sociol_111ac, is_sociol_113, is_sociol_113ac, is_sociol_124, is_sociol_127, is_sociol_130, is_sociol_130ac, is_sociol_131ac, is_sociol_133, is_sociol_180e, is_sociol_180i, is_sociol_182])
}

Function<AndRequirement>() eval_inequalities_in_society (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, inequalities_in_society_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, inequalities_in_society_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  // Only one of AFRICAM 101 or ETH STD 101A may count
  List<Course> methods_group_list [{"AFRICAM 101"}, {"ETH STD 101A"}]
  List<Course> methods_group_consumed filter(upper_div_matches, (c) {
    boolean return one_common_course([c], methods_group_list)
  })
  BooleanRequirement methods_group_check {not(greater_than(length(methods_group_consumed), 1)), "Max 1: AFRICAM 101, ETH STD 101A"}

  // Only one of SOCIOL 113 or 113AC may count
  List<Course> sociol_113_list [{"SOCIOL 113"}, {"SOCIOL 113AC"}]
  List<Course> sociol_113_consumed filter(upper_div_matches, (c) {
    boolean return one_common_course([c], sociol_113_list)
  })
  BooleanRequirement sociol_113_check {not(greater_than(length(sociol_113_consumed), 1)), "Max 1: SOCIOL 113, 113AC"}

  // Only one of SOCIOL 130 or 130AC may count
  List<Course> sociol_130_list [{"SOCIOL 130"}, {"SOCIOL 130AC"}]
  List<Course> sociol_130_consumed filter(upper_div_matches, (c) {
    boolean return one_common_course([c], sociol_130_list)
  })
  BooleanRequirement sociol_130_check {not(greater_than(length(sociol_130_consumed), 1)), "Max 1: SOCIOL 130, 130AC"}

  AndRequirement return AndRequirement([lower_div, upper_div, methods_group_check, sociol_113_check, sociol_130_check], "Inequalities in Society")
}



Function<boolean>(Course) linguistic_sciences_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_philos_12a and([equal([subject, "PHILOS"]), equal([number, "12A"])])
  // LINGUIS 100 may count as lower OR upper div but not both; handled in main()
  boolean is_linguis_100 and([equal([subject, "LINGUIS"]), equal([number, "100"])])

  boolean return or([is_philos_12a, is_linguis_100])
}

Function<boolean>(Course) linguistic_sciences_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  // LINGUIS 100 may count as lower OR upper div but not both
  boolean is_linguis_100 and([equal([subject, "LINGUIS"]), equal([number, "100"])])
  boolean is_linguis_108 and([equal([subject, "LINGUIS"]), equal([number, "108"])])
  boolean is_linguis_110 and([equal([subject, "LINGUIS"]), equal([number, "110"])])
  boolean is_linguis_111 and([equal([subject, "LINGUIS"]), equal([number, "111"])])
  boolean is_linguis_113 and([equal([subject, "LINGUIS"]), equal([number, "113"])])
  boolean is_linguis_115 and([equal([subject, "LINGUIS"]), equal([number, "115"])])
  boolean is_linguis_120 and([equal([subject, "LINGUIS"]), equal([number, "120"])])
  boolean is_linguis_121 and([equal([subject, "LINGUIS"]), equal([number, "121"])])
  boolean is_linguis_cogsci_c142 and([or([equal([subject, "LINGUIS"]), equal([subject, "COGSCI"])]), equal([number, "C142"])])
  boolean is_linguis_150a and([equal([subject, "LINGUIS"]), equal([number, "150A"])])
  boolean is_linguis_cogsci_c160_c140 and([or([equal([subject, "LINGUIS"]), equal([subject, "COGSCI"])]), or([equal([number, "C160"]), equal([number, "C140"])])])
  boolean is_linguis_188 and([equal([subject, "LINGUIS"]), equal([number, "188"])])
  // LINGUIS C189 approved if taken in Spring 2026
  boolean is_linguis_c189 and([equal([subject, "LINGUIS"]), equal([number, "C189"])])
  boolean is_info_159 and([equal([subject, "INFO"]), equal([number, "159"])])
  boolean is_philos_133 and([equal([subject, "PHILOS"]), equal([number, "133"])])

  boolean return or([is_linguis_100, is_linguis_108, is_linguis_110, is_linguis_111, is_linguis_113, is_linguis_115, is_linguis_120, is_linguis_121, is_linguis_cogsci_c142, is_linguis_150a, is_linguis_cogsci_c160_c140, is_linguis_188, is_linguis_c189, is_info_159, is_philos_133])
}

Function<AndRequirement>() eval_linguistic_sciences (){
  List<Course> courses get_attr(this, "allCourses")

  // LINGUIS 100 special rule: may count as lower OR upper div but not both
  List<Course> linguis_100_list [{"LINGUIS 100"}]
  List<Course> linguis_100_matches filter(courses, (c) {
    boolean return one_common_course([c], linguis_100_list)
  })
  boolean has_linguis_100 greater_than(length(linguis_100_matches), 0)

  List<Course> philos_12a_list [{"PHILOS 12A"}]
  List<Course> philos_12a_matches filter(courses, (c) {
    boolean return one_common_course([c], philos_12a_list)
  })
  boolean has_philos_12a greater_than(length(philos_12a_matches), 0)

  // LINGUIS 100 is used for lower div only if no other lower div course is present
  boolean linguis_100_used_for_lower_div and([has_linguis_100, not(has_philos_12a)])

  List<Course> lower_div_matches filter(courses, linguistic_sciences_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  // When LINGUIS 100 fills lower div, exclude it from upper div pool
  List<Course> upper_div_pool filter(courses, (c) {
    boolean is_in_linguis_100 contains(linguis_100_matches, c)
    boolean should_exclude and([linguis_100_used_for_lower_div, is_in_linguis_100])
    boolean is_valid not(should_exclude)
    boolean is_upper_div linguistic_sciences_upper_div_finder(c)
    boolean return and([is_valid, is_upper_div])
  })
  NCoursesRequirement upper_div {upper_div_pool, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Linguistic Sciences")
}



Function<boolean>(Course) neuroscience_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_neu_c61 and([or([equal([subject, "NEU"]), equal([subject, "MCELLBI"]), equal([subject, "PSYCH"])]), or([equal([number, "C61"]), equal([number, "61"])])])
  boolean is_neu_psych_c64 and([or([equal([subject, "NEU"]), equal([subject, "PSYCH"]), equal([subject, "MCELLBI"])]), equal([number, "C64"])])

  boolean return or([is_neu_c61, is_neu_psych_c64])
}

Function<boolean>(Course) neuroscience_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_anthro_107 and([equal([subject, "ANTHRO"]), equal([number, "107"])])
  boolean is_bioeng_neu_c171_c124 and([or([equal([subject, "BIOENG"]), equal([subject, "NEU"])]), or([equal([number, "C171"]), equal([number, "C124"])])])
  boolean is_cogsci_psych_c127 and([or([equal([subject, "COGSCI"]), equal([subject, "PSYCH"])]), equal([number, "C127"])])
  boolean is_integbi_139 and([equal([subject, "INTEGBI"]), equal([number, "139"])])
  // formerly MCELLBI 160
  boolean is_neu_100a and([equal([subject, "NEU"]), equal([number, "100A"])])
  // formerly MCELLBI 161 
  boolean is_neu_100b and([equal([subject, "NEU"]), equal([number, "100B"])]) 
  boolean is_neu_128 and([equal([subject, "NEU"]), equal([number, "128"])])
  boolean is_neu_151 and([equal([subject, "NEU"]), equal([number, "151"])])
  // formerly MCELLBI 165
  boolean is_neu_165 and([equal([subject, "NEU"]), equal([number, "165"])]) 
  boolean is_mcellbi and([equal([subject, "MCELLBI"]), or([equal([number, "160"]), equal([number, "161"]), equal([number, "165"]), equal([number, "166"])])])
  boolean is_psych_integbi_c113_c143a and([or([equal([subject, "PSYCH"]), equal([subject, "INTEGBI"])]), or([equal([number, "C113"]), equal([number, "C143A"])])])
  boolean is_psych_117 and([equal([subject, "PSYCH"]), equal([number, "117"])])
  boolean is_psych_125 and([equal([subject, "PSYCH"]), equal([number, "125"])])

  boolean return or([is_anthro_107, is_bioeng_neu_c171_c124, is_cogsci_psych_c127, is_integbi_139, is_neu_100a, is_neu_100b, is_neu_128, is_neu_151, is_neu_165, is_mcellbi, is_psych_integbi_c113_c143a, is_psych_117, is_psych_125])
}

Function<AndRequirement>() eval_neuroscience (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, neuroscience_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, neuroscience_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Neuroscience")
}



Function<boolean>(Course) organizations_economy_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_4ac and([equal([subject, "DATA"]), equal([number, "4AC"])])
  boolean is_sociol_1 and([equal([subject, "SOCIOL"]), equal([number, "1"])])
  boolean is_sociol_3ac and([equal([subject, "SOCIOL"]), equal([number, "3AC"])])

  boolean return or([is_data_4ac, is_sociol_1, is_sociol_3ac])
}

Function<boolean>(Course) organizations_economy_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_econ_121 and([equal([subject, "ECON"]), equal([number, "121"])])
  boolean is_econ_131 and([equal([subject, "ECON"]), equal([number, "131"])])
  boolean is_envecon_142 and([equal([subject, "ENVECON"]), equal([number, "142"])])
  boolean is_geog_110 and([equal([subject, "GEOG"]), equal([number, "110"])])
  boolean is_gws_139 and([equal([subject, "GWS"]), equal([number, "139"])])
  boolean is_polsci_132c and([equal([subject, "POLSCI"]), equal([number, "132C"])])
  boolean is_sociol_110 and([equal([subject, "SOCIOL"]), equal([number, "110"])])
  boolean is_sociol_116 and([equal([subject, "SOCIOL"]), equal([number, "116"])])
  boolean is_sociol_119s and([equal([subject, "SOCIOL"]), equal([number, "119S"])])
  boolean is_sociol_120 and([equal([subject, "SOCIOL"]), equal([number, "120"])])
  boolean is_sociol_121 and([equal([subject, "SOCIOL"]), equal([number, "121"])])
  boolean is_ugba_105 and([equal([subject, "UGBA"]), equal([number, "105"])])
  boolean is_ugba_107 and([equal([subject, "UGBA"]), equal([number, "107"])])

  boolean return or([is_econ_121, is_econ_131, is_envecon_142, is_geog_110, is_gws_139, is_polsci_132c, is_sociol_110, is_sociol_116, is_sociol_119s, is_sociol_120, is_sociol_121, is_ugba_105, is_ugba_107])
}

Function<AndRequirement>() eval_organizations_economy (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, organizations_economy_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, organizations_economy_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Organizations and the Economy")
}



Function<boolean>(Course) phil_foundations_evidence_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_ls_22 and([equal([subject, "LNS"]), equal([number, "22"])])
  boolean is_math_55 and([equal([subject, "MATH"]), equal([number, "55"])])
  boolean is_philos_4 and([equal([subject, "PHILOS"]), equal([number, "4"])])
  boolean is_philos_5 and([equal([subject, "PHILOS"]), equal([number, "5"])])
  boolean is_philos_12a and([equal([subject, "PHILOS"]), equal([number, "12A"])])

  boolean return or([is_ls_22, is_math_55, is_philos_4, is_philos_5, is_philos_12a])
}

Function<boolean>(Course) phil_foundations_evidence_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_math_125a and([equal([subject, "MATH"]), equal([number, "125A"])])
  boolean is_math_135 and([equal([subject, "MATH"]), equal([number, "135"])])
  boolean is_math_136 and([equal([subject, "MATH"]), equal([number, "136"])])
  boolean is_philos_122 and([equal([subject, "PHILOS"]), equal([number, "122"])])
  boolean is_philos_125 and([equal([subject, "PHILOS"]), equal([number, "125"])])
  boolean is_philos_128 and([equal([subject, "PHILOS"]), equal([number, "128"])])
  boolean is_philos_134 and([equal([subject, "PHILOS"]), equal([number, "134"])])
  boolean is_philos_140a and([equal([subject, "PHILOS"]), equal([number, "140A"])])
  boolean is_philos_140b and([equal([subject, "PHILOS"]), equal([number, "140B"])])
  boolean is_philos_142 and([equal([subject, "PHILOS"]), equal([number, "142"])])
  boolean is_philos_143 and([equal([subject, "PHILOS"]), equal([number, "143"])])
  boolean is_philos_146 and([equal([subject, "PHILOS"]), equal([number, "146"])])
  boolean is_philos_148 and([equal([subject, "PHILOS"]), equal([number, "148"])])
  boolean is_philos_149 and([equal([subject, "PHILOS"]), equal([number, "149"])])
  boolean is_rhetor_107 and([equal([subject, "RHETOR"]), equal([number, "107"])])

  boolean return or([is_math_125a, is_math_135, is_math_136, is_philos_122, is_philos_125, is_philos_128, is_philos_134, is_philos_140a, is_philos_140b, is_philos_142, is_philos_143, is_philos_146, is_philos_148, is_philos_149, is_rhetor_107])
}

Function<AndRequirement>() eval_phil_foundations_evidence (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, phil_foundations_evidence_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, phil_foundations_evidence_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Philosophical Foundations: Evidence and Inference")
}



Function<boolean>(Course) phil_foundations_minds_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_cogsci_1 and([equal([subject, "COGSCI"]), equal([number, "1"])])
  boolean is_cogsci_1b_n1 and([equal([subject, "COGSCI"]), or([equal([number, "1B"]), equal([number, "N1"])])])
  boolean is_philos_2 and([equal([subject, "PHILOS"]), equal([number, "2"])])
  boolean is_philos_3 and([equal([subject, "PHILOS"]), equal([number, "3"])])
  boolean is_philos_14 and([equal([subject, "PHILOS"]), equal([number, "14"])])

  boolean return or([is_cogsci_1, is_cogsci_1b_n1, is_philos_2, is_philos_3, is_philos_14])
}

Function<boolean>(Course) phil_foundations_minds_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_cogsci_psych_c100_c120 and([or([equal([subject, "COGSCI"]), equal([subject, "PSYCH"])]), or([equal([number, "C100"]), equal([number, "C120"])])])
  boolean is_cogsci_linguis_c101 and([or([equal([subject, "COGSCI"]), equal([subject, "LINGUIS"])]), equal([number, "C101"])])
  boolean is_cogsci_psych_c102_c129 and([or([equal([subject, "COGSCI"]), equal([subject, "PSYCH"])]), or([equal([number, "C102"]), equal([number, "C129"])])])
  boolean is_cogsci_psych_131_c131_c123 and([or([equal([subject, "COGSCI"]), equal([subject, "PSYCH"])]), or([equal([number, "131"]), equal([number, "C131"]), equal([number, "C123"])])])
  boolean is_cogsci_linguis_c142 and([or([equal([subject, "COGSCI"]), equal([subject, "LINGUIS"])]), equal([number, "C142"])])
  boolean is_econ_polsci_c110_c135 and([or([equal([subject, "ECON"]), equal([subject, "POLSCI"])]), or([equal([number, "C110"]), equal([number, "C135"])])])
  boolean is_stat_155 and([equal([subject, "STAT"]), equal([number, "155"])])
  boolean is_philos_104 and([equal([subject, "PHILOS"]), equal([number, "104"])])
  boolean is_philos_115 and([equal([subject, "PHILOS"]), equal([number, "115"])])
  boolean is_philos_132 and([equal([subject, "PHILOS"]), equal([number, "132"])])
  boolean is_philos_133 and([equal([subject, "PHILOS"]), equal([number, "133"])])
  boolean is_philos_135 and([equal([subject, "PHILOS"]), equal([number, "135"])])
  boolean is_philos_136 and([equal([subject, "PHILOS"]), equal([number, "136"])])
  boolean is_philos_141 and([equal([subject, "PHILOS"]), equal([number, "141"])])

  boolean return or([is_cogsci_psych_c100_c120, is_cogsci_linguis_c101, is_cogsci_psych_c102_c129, is_cogsci_psych_131_c131_c123, is_cogsci_linguis_c142, is_econ_polsci_c110_c135, is_stat_155, is_philos_104, is_philos_115, is_philos_132, is_philos_133, is_philos_135, is_philos_136, is_philos_141])
}

Function<AndRequirement>() eval_phil_foundations_minds (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, phil_foundations_minds_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, phil_foundations_minds_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Philosophical Foundations: Minds, Morals, and Machines")
}



Function<boolean>(Course) physical_science_analytics_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  // PHYSICS 5BL + 5CL are a paired 2+2 unit combo; treated as individual courses, pairing enforced externally
  boolean is_physics_5bl and([equal([subject, "PHYSICS"]), equal([number, "5BL"])])
  boolean is_physics_5cl and([equal([subject, "PHYSICS"]), equal([number, "5CL"])])
  boolean is_physics_77 and([equal([subject, "PHYSICS"]), equal([number, "77"])])
  boolean is_physics_7a and([equal([subject, "PHYSICS"]), equal([number, "7A"])])

  boolean return or([is_physics_5bl, is_physics_5cl, is_physics_77, is_physics_7a])
}

Function<boolean>(Course) physical_science_analytics_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_astron_120 and([equal([subject, "ASTRON"]), equal([number, "120"])])
  boolean is_astron_121 and([equal([subject, "ASTRON"]), equal([number, "121"])])
  boolean is_astron_128 and([equal([subject, "ASTRON"]), equal([number, "128"])])
  boolean is_astron_c161 and([equal([subject, "ASTRON"]), equal([number, "C161"])])
  boolean is_astron_c162 and([equal([subject, "ASTRON"]), equal([number, "C162"])])
  boolean is_civeng_meceng_c133_c180 and([or([equal([subject, "CIVENG"]), equal([subject, "MECENG"])]), or([equal([number, "C133"]), equal([number, "C180"])])])
  boolean is_engin_150 and([equal([subject, "ENGIN"]), equal([number, "150"])])
  boolean is_eps_108 and([equal([subject, "EPS"]), equal([number, "108"])])
  boolean is_eps_109 and([equal([subject, "EPS"]), equal([number, "109"])])
  boolean is_eps_122 and([equal([subject, "EPS"]), equal([number, "122"])])
  boolean is_eps_espm_c183_c170 and([or([equal([subject, "EPS"]), equal([subject, "ESPM"])]), or([equal([number, "C183"]), equal([number, "C170"])])])
  boolean is_geog_eps_c136_c130 and([or([equal([subject, "GEOG"]), equal([subject, "ESPM"])]), or([equal([number, "C136"]), equal([number, "C130"])])])
  boolean is_geog_eps_c139_c181 and([or([equal([subject, "GEOG"]), equal([subject, "EPS"])]), or([equal([number, "C139"]), equal([number, "C181"])])])
  boolean is_nuceng_101 and([equal([subject, "NUCENG"]), equal([number, "101"])])
  boolean is_nuceng_130 and([equal([subject, "NUCENG"]), equal([number, "130"])])
  boolean is_nuceng_155 and([equal([subject, "NUCENG"]), equal([number, "155"])])
  boolean is_physics_105 and([equal([subject, "PHYSICS"]), equal([number, "105"])])
  boolean is_physics_111a and([equal([subject, "PHYSICS"]), equal([number, "111A"])])
  boolean is_physics_112 and([equal([subject, "PHYSICS"]), equal([number, "112"])])
  boolean is_physics_129 and([equal([subject, "PHYSICS"]), equal([number, "129"])])
  // formerly PHYSICS 151
  boolean is_physics_188 and([equal([subject, "PHYSICS"]), equal([number, "188"])]) 

  boolean return or([is_astron_120, is_astron_121, is_astron_128, is_astron_c161, is_astron_c162, is_civeng_meceng_c133_c180, is_engin_150, is_eps_108, is_eps_109, is_eps_122, is_eps_espm_c183_c170, is_geog_eps_c136_c130, is_geog_eps_c139_c181, is_nuceng_101, is_nuceng_130, is_nuceng_155, is_physics_105, is_physics_111a, is_physics_112, is_physics_129, is_physics_188])
}

Function<AndRequirement>() eval_physical_science_analytics (){
  List<Course> courses get_attr(this, "allCourses")

  // PHYSICS 5BL + 5CL paired lower div: both required together as one slot
  List<Course> physics_5bl_list [{"PHYSICS 5BL"}]
  List<Course> physics_5cl_list [{"PHYSICS 5CL"}]
  List<Course> physics_5bl_matches filter(courses, (c) {
    boolean return one_common_course([c], physics_5bl_list)
  })
  List<Course> physics_5cl_matches filter(courses, (c) {
    boolean return one_common_course([c], physics_5cl_list)
  })
  boolean has_5bl greater_than(length(physics_5bl_matches), 0)
  boolean has_5cl greater_than(length(physics_5cl_matches), 0)
  boolean has_5bl_5cl_pair and([has_5bl, has_5cl])

  List<Course> lower_div_solo_list [{"PHYSICS 77"}, {"PHYSICS 7A"}]
  List<Course> lower_div_solo_matches filter(courses, (c) {
    boolean return one_common_course([c], lower_div_solo_list)
  })
  boolean has_solo_lower_div greater_than(length(lower_div_solo_matches), 0)

  boolean lower_div_satisfied or([has_solo_lower_div, has_5bl_5cl_pair])
  BooleanRequirement lower_div {lower_div_satisfied, "Lower Division"}

  List<Course> upper_div_matches filter(courses, physical_science_analytics_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Physical Science Analytics")
}



Function<boolean>(Course) quantitative_social_science_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_econ_1 and([equal([subject, "ECON"]), equal([number, "1"])])
  boolean is_econ_2 and([equal([subject, "ECON"]), equal([number, "2"])])
  boolean is_sociol_1 and([equal([subject, "SOCIOL"]), equal([number, "1"])])
  boolean is_sociol_3ac and([equal([subject, "SOCIOL"]), equal([number, "3AC"])])
  boolean is_sociol_5 and([equal([subject, "SOCIOL"]), equal([number, "5"])])
  boolean is_polsci_3 and([equal([subject, "POL SCI"]), equal([number, "3"])])
  boolean is_polsci_88 and([equal([subject, "POL SCI"]), equal([number, "88"])])

  boolean return or([is_econ_1, is_econ_2, is_sociol_1, is_sociol_3ac, is_sociol_5, is_polsci_3, is_polsci_88])
}

Function<boolean>(Course) quantitative_social_science_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_demog_110 and([equal([subject, "DEMOG"]), equal([number, "110"])])
  boolean is_demog_sociol_c126 and([or([equal([subject, "DEMOG"]), equal([subject, "SOCIOL"])]), equal([number, "C126"])])
  boolean is_demog_130 and([equal([subject, "DEMOG"]), equal([number, "130"])])
  boolean is_demog_econ_c175 and([or([equal([subject, "DEMOG"]), equal([subject, "ECON"])]), equal([number, "C175"])])
  boolean is_demog_180 and([equal([subject, "DEMOG"]), equal([number, "180"])])
  boolean is_econ_polsci_c110_c135 and([or([equal([subject, "ECON"]), equal([subject, "POLSCI"]), equal([subject, "POL SCI"])]), or([equal([number, "C110"]), equal([number, "C135"]), equal([number, "W135"])])])
  boolean is_envecon_ias_c118 and([or([equal([subject, "ENVECON"]), equal([subject, "IAS"])]), equal([number, "C118"])])
  boolean is_mediast_130 and([equal([subject, "MEDIAST"]), equal([number, "130"])]) 
  boolean is_polsci_132b and([equal([subject, "POLSCI"]), equal([number, "132B"])])
  boolean is_polsci_132c and([equal([subject, "POLSCI"]), equal([number, "132C"])])
  boolean is_polsci_133 and([equal([subject, "POLSCI"]), equal([number, "133"])])
  boolean is_sociol_106 and([equal([subject, "SOCIOL"]), equal([number, "106"])])

  boolean return or([is_demog_110, is_demog_sociol_c126, is_demog_130, is_demog_econ_c175, is_demog_180, is_econ_polsci_c110_c135, is_envecon_ias_c118, is_mediast_130, is_polsci_132b, is_polsci_132c, is_polsci_133, is_sociol_106])
}

Function<AndRequirement>() eval_quantitative_social_science (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, quantitative_social_science_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, quantitative_social_science_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Quantitative Social Science")
}



Function<boolean>(Course) robotics_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_math_53 and([equal([subject, "MATH"]), equal([number, "53"])])

  boolean return is_math_53
}

Function<boolean>(Course) robotics_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_bioeng_101 and([equal([subject, "BIOENG"]), equal([number, "101"])])
  boolean is_bioeng_105 and([equal([subject, "BIOENG"]), equal([number, "105"])])
  boolean is_bioeng_eecs_c106a and([or([equal([subject, "BIOENG"]), equal([subject, "EECS"])]), equal([number, "C106A"])])
  boolean is_bioeng_eecs_c106b and([or([equal([subject, "BIOENG"]), equal([subject, "EECS"])]), equal([number, "C106B"])])
  boolean is_compsci_188 and([equal([subject, "COMPSCI"]), equal([number, "188"])])
  boolean is_eecs_149 and([equal([subject, "EECS"]), equal([number, "149"])])
  boolean is_eleng_143 and([equal([subject, "ELENG"]), equal([number, "143"])])
  boolean is_eleng_147 and([equal([subject, "ELENG"]), equal([number, "147"])])
  boolean is_eleng_192 and([equal([subject, "ELENG"]), equal([number, "192"])])
  boolean is_integbi_c135l and([equal([subject, "INTEGBI"]), equal([number, "C135L"])])
  boolean is_meceng_100 and([equal([subject, "MECENG"]), equal([number, "100"])])
  boolean is_meceng_102b and([equal([subject, "MECENG"]), equal([number, "102B"])])
  boolean is_meceng_119 and([equal([subject, "MECENG"]), equal([number, "119"])])
  boolean is_meceng_131 and([equal([subject, "MECENG"]), equal([number, "131"])])
  boolean is_meceng_132 and([equal([subject, "MECENG"]), equal([number, "132"])])
  boolean is_meceng_eleng_c134_c128 and([or([equal([subject, "MECENG"]), equal([subject, "ELENG"])]), or([equal([number, "C134"]), equal([number, "C128"])])])
  boolean is_meceng_135 and([equal([subject, "MECENG"]), equal([number, "135"])])
  boolean is_meceng_139 and([equal([subject, "MECENG"]), equal([number, "139"])])
  boolean is_meceng_150 and([equal([subject, "MECENG"]), equal([number, "150"])])

  boolean return or([is_bioeng_101, is_bioeng_105, is_bioeng_eecs_c106a, is_bioeng_eecs_c106b, is_compsci_188, is_eecs_149, is_eleng_143, is_eleng_147, is_eleng_192, is_integbi_c135l, is_meceng_100, is_meceng_102b, is_meceng_119, is_meceng_131, is_meceng_132, is_meceng_eleng_c134_c128, is_meceng_135, is_meceng_139, is_meceng_150])
}

Function<AndRequirement>() eval_robotics (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, robotics_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, robotics_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Robotics")
}



Function<boolean>(Course) sts_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_4ac and([equal([subject, "DATA"]), equal([number, "4AC"])])
  boolean is_geog_80 and([equal([subject, "GEOG"]), equal([number, "80"])])
  boolean is_history_30 and([equal([subject, "HISTORY"]), equal([number, "30"])])
  boolean is_isf_60 and([equal([subject, "ISF"]), equal([number, "60"])])

  boolean return or([is_data_4ac, is_geog_80, is_history_30, is_isf_60])
}

Function<boolean>(Course) sts_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_anthro_115 and([equal([subject, "ANTHRO"]), equal([number, "115"])])
  boolean is_anthro_119 and([equal([subject, "ANTHRO"]), equal([number, "119"])])
  boolean is_anthro_168 and([equal([subject, "ANTHRO"]), equal([number, "168"])])
  boolean is_engin_ias_157ac and([or([equal([subject, "ENGIN"]), equal([subject, "IAS"])]), equal([number, "157AC"])])
  boolean is_english_180z and([equal([subject, "ENGLISH"]), equal([number, "180Z"])])
  boolean is_envecon_143 and([equal([subject, "ENVECON"]), equal([number, "143"])])
  boolean is_espm_161 and([equal([subject, "ESPM"]), equal([number, "161"])])
  boolean is_espm_162 and([equal([subject, "ESPM"]), equal([number, "162"])])
  boolean is_espm_sociol_163ac_137ac and([or([equal([subject, "ESPM"]), equal([subject, "SOCIOL"])]), or([equal([number, "163AC"]), equal([number, "137AC"])])])
  boolean is_film_155 and([equal([subject, "FILM"]), equal([number, "155"])])
  boolean is_geog_130 and([equal([subject, "GEOG"]), or([equal([number, "130"]), equal([number, "N130"])])])
  boolean is_gws_130ac and([equal([subject, "GWS"]), equal([number, "130AC"])])
  boolean is_history_100s and([equal([subject, "HISTORY"]), or([equal([number, "100S"]), equal([number, "100ST"])])])
  boolean is_history_103s and([equal([subject, "HISTORY"]), equal([number, "103S"])])
  boolean is_history_138 and([equal([subject, "HISTORY"]), or([equal([number, "138"]), equal([number, "138T"])])])
  boolean is_history_180 and([equal([subject, "HISTORY"]), or([equal([number, "180"]), equal([number, "180T"])])])
  boolean is_history_182a and([equal([subject, "HISTORY"]), or([equal([number, "182A"]), equal([number, "182AT"])])]) 
  boolean is_info_103 and([equal([subject, "INFO"]), equal([number, "103"])]) 
  boolean is_isf_100d and([equal([subject, "ISF"]), equal([number, "100D"])])
  boolean is_isf_100g and([equal([subject, "ISF"]), equal([number, "100G"])])
  boolean is_polsci_132c and([equal([subject, "POLSCI"]), equal([number, "132C"])])
  boolean is_rhetor_107 and([equal([subject, "RHETOR"]), equal([number, "107"])])
  boolean is_rhetor_115 and([equal([subject, "RHETOR"]), equal([number, "115"])])
  boolean is_rhetor_145 and([equal([subject, "RHETOR"]), equal([number, "145"])])
  boolean is_sociol_pbhlth_c115_c155 and([or([equal([subject, "SOCIOL"]), equal([subject, "PBHLTH"])]), or([equal([number, "C115"]), equal([number, "C155"])])])
  boolean is_sociol_166 and([equal([subject, "SOCIOL"]), equal([number, "166"])])
  boolean is_sociol_167 and([equal([subject, "SOCIOL"]), equal([number, "167"])])
  boolean is_sts_history_isf_c100_c182c_c100g and([or([equal([subject, "STS"]), equal([subject, "HISTORY"]), equal([subject, "ISF"])]), or([equal([number, "C100"]), equal([number, "C182C"]), equal([number, "C100G"])])])
  boolean is_ugis_110 and([equal([subject, "UGIS"]), equal([number, "110"])])
  // HCE crossover courses: may count toward STS DE but NOT also toward HCE requirement
  boolean is_amerstd_africam_134 and([or([equal([subject, "AMERSTD"]), equal([subject, "AFRICAM"])]), or([equal([number, "134"]), equal([number, "C134"])])])
  boolean is_cyplan_101 and([equal([subject, "CYPLAN"]), equal([number, "101"])])
  boolean is_data_history_sts_c104 and([or([equal([subject, "DATA"]), equal([subject, "HISTORY"]), equal([subject, "STS"])]), equal([number, "C104"])])
  boolean is_dighum_100 and([equal([subject, "DIGHUM"]), equal([number, "100"])])
  boolean is_espm_pbhlth_c167_c160 and([or([equal([subject, "ESPM"]), equal([subject, "PBHLTH"])]), or([equal([number, "C167"]), equal([number, "C160"])])])
  boolean is_info_188 and([equal([subject, "INFO"]), equal([number, "188"])])
  boolean is_isf_100j and([equal([subject, "ISF"]), equal([number, "100J"])])
  boolean is_nwmedia_151ac and([equal([subject, "NWMEDIA"]), equal([number, "151AC"])])
  boolean is_philos_121 and([equal([subject, "PHILOS"]), equal([number, "121"])])
  boolean is_polecon_159 and([equal([subject, "POLECON"]), equal([number, "159"])])

  boolean return or([is_anthro_115, is_anthro_119, is_anthro_168, is_engin_ias_157ac, is_english_180z, is_envecon_143, is_espm_161, is_espm_162, is_espm_sociol_163ac_137ac, is_film_155, is_geog_130, is_gws_130ac, is_history_100s, is_history_103s, is_history_138, is_history_180, is_history_182a, is_info_103, is_isf_100d, is_isf_100g, is_polsci_132c, is_rhetor_107, is_rhetor_115, is_rhetor_145, is_sociol_pbhlth_c115_c155, is_sociol_166, is_sociol_167, is_sts_history_isf_c100_c182c_c100g, is_ugis_110, is_amerstd_africam_134, is_cyplan_101, is_data_history_sts_c104, is_dighum_100, is_espm_pbhlth_c167_c160, is_info_188, is_isf_100j, is_nwmedia_151ac, is_philos_121, is_polecon_159])
}

Function<AndRequirement>() eval_sts (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, sts_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, sts_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  // TODO: add cross-check against HCE consumed courses 

  AndRequirement return AndRequirement([lower_div, upper_div], "Science, Technology, and Society")
}



Function<boolean>(Course) social_welfare_health_poverty_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_4ac and([equal([subject, "DATA"]), equal([number, "4AC"])])
  boolean is_sociol_1 and([equal([subject, "SOCIOL"]), equal([number, "1"])])
  boolean is_sociol_3ac and([equal([subject, "SOCIOL"]), equal([number, "3AC"])])

  boolean return or([is_data_4ac, is_sociol_1, is_sociol_3ac])
}

Function<boolean>(Course) social_welfare_health_poverty_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_envecon_153 and([equal([subject, "ENVECON"]), equal([number, "153"])])
  boolean is_gpp_105 and([equal([subject, "GPP"]), equal([number, "105"])])
  boolean is_gpp_115 and([equal([subject, "GPP"]), equal([number, "115"])])
  boolean is_global_102 and([equal([subject, "GLOBAL"]), equal([number, "102"])])
  boolean is_gws_130ac and([equal([subject, "GWS"]), equal([number, "130AC"])])
  boolean is_polsci_132c and([equal([subject, "POLSCI"]), equal([number, "132C"])])
  boolean is_pbhlth_112 and([equal([subject, "PBHLTH"]), equal([number, "112"])])
  boolean is_pbhlth_126 and([equal([subject, "PBHLTH"]), equal([number, "126"])])
  boolean is_pbhlth_150d and([equal([subject, "PBHLTH"]), equal([number, "150D"])])
  boolean is_pbhlth_150e and([equal([subject, "PBHLTH"]), equal([number, "150E"])])
  boolean is_pbhlth_sociol_c155_c115 and([or([equal([subject, "PBHLTH"]), equal([subject, "SOCIOL"])]), or([equal([number, "C155"]), equal([number, "C115"])])])
  boolean is_pbhlth_espm_c160_c167 and([or([equal([subject, "PBHLTH"]), equal([subject, "ESPM"])]), or([equal([number, "C160"]), equal([number, "C167"])])])
  boolean is_pbhlth_181 and([equal([subject, "PBHLTH"]), equal([number, "181"])])
  boolean is_polecon_111 and([equal([subject, "POLECON"]), equal([number, "111"])])
  boolean is_sociol_115g and([equal([subject, "SOCIOL"]), equal([number, "115G"])])
  boolean is_sociol_127 and([equal([subject, "SOCIOL"]), equal([number, "127"])])
  boolean is_socwel_112 and([equal([subject, "SOC WEL"]), equal([number, "112"])])

  boolean return or([is_envecon_153, is_gpp_105, is_gpp_115, is_global_102, is_gws_130ac, is_polsci_132c, is_pbhlth_112, is_pbhlth_126, is_pbhlth_150d, is_pbhlth_150e, is_pbhlth_sociol_c155_c115, is_pbhlth_espm_c160_c167, is_pbhlth_181, is_polecon_111, is_sociol_115g, is_sociol_127, is_socwel_112])
}

Function<AndRequirement>() eval_social_welfare_health_poverty (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, social_welfare_health_poverty_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, social_welfare_health_poverty_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Social Welfare, Health, and Poverty")
}



Function<boolean>(Course) social_policy_law_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_4ac and([equal([subject, "DATA"]), equal([number, "4AC"])])
  boolean is_sociol_1 and([equal([subject, "SOCIOL"]), equal([number, "1"])])
  boolean is_sociol_3ac and([equal([subject, "SOCIOL"]), equal([number, "3AC"])])

  boolean return or([is_data_4ac, is_sociol_1, is_sociol_3ac])
}

Function<boolean>(Course) social_policy_law_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_gws_132ac and([equal([subject, "GWS"]), equal([number, "132AC"])])
  boolean is_legalst_100 and([equal([subject, "LEGALST"]), equal([number, "100"])])
  boolean is_legalst_102 and([equal([subject, "LEGALST"]), equal([number, "102"])])
  boolean is_legalst_122 and([equal([subject, "LEGALST"]), equal([number, "122"])])
  boolean is_legalst_123 and([equal([subject, "LEGALST"]), equal([number, "123"])])
  boolean is_legalst_158 and([equal([subject, "LEGALST"]), equal([number, "158"])])
  boolean is_legalst_160 and([equal([subject, "LEGALST"]), equal([number, "160"])])
  boolean is_pbhlth_150d and([equal([subject, "PBHLTH"]), equal([number, "150D"])])
  boolean is_polecon_111 and([equal([subject, "POLECON"]), equal([number, "111"])])
  boolean is_polsci_132c and([or([equal([subject, "POLSCI"]), equal([subject, "POL SCI"])]), equal([number, "132C"])])
  boolean is_polsci_186 and([or([equal([subject, "POLSCI"]), equal([subject, "POL SCI"])]), equal([number, "186"])])
  boolean is_pubpol_101 and([equal([subject, "PUBPOL"]), equal([number, "101"])])
  boolean is_socwel_112 and([equal([subject, "SOC WEL"]), equal([number, "112"])])
  boolean is_socwel_181 and([equal([subject, "SOC WEL"]), equal([number, "181"])])
  boolean is_sociol_114 and([equal([subject, "SOCIOL"]), equal([number, "114"])])
  boolean is_sociol_148 and([equal([subject, "SOCIOL"]), equal([number, "148"])])

  boolean return or([is_gws_132ac, is_legalst_100, is_legalst_102, is_legalst_122, is_legalst_123, is_legalst_158, is_legalst_160, is_pbhlth_150d, is_polecon_111, is_polsci_132c, is_polsci_186, is_pubpol_101, is_socwel_112, is_socwel_181, is_sociol_114, is_sociol_148])
}

Function<AndRequirement>() eval_social_policy_law (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, social_policy_law_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, social_policy_law_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Social Policy and Law")
}



Function<boolean>(Course) sustainable_development_engineering_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_civeng_11 and([equal([subject, "CIVENG"]), equal([number, "11"])])
  boolean is_ldarch_12 and([equal([subject, "LDARCH"]), equal([number, "12"])])

  boolean return or([is_civeng_11, is_ldarch_12])
}

Function<boolean>(Course) sustainable_development_engineering_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_arch_140 and([equal([subject, "ARCH"]), equal([number, "140"])])
  boolean is_civeng_107 and([equal([subject, "CIVENG"]), equal([number, "107"])])
  boolean is_civeng_110 and([equal([subject, "CIVENG"]), equal([number, "110"])])
  boolean is_civeng_111 and([equal([subject, "CIVENG"]), equal([number, "111"])])
  boolean is_civeng_155 and([equal([subject, "CIVENG"]), equal([number, "155"])])
  boolean is_civeng_191 and([equal([subject, "CIVENG"]), equal([number, "191"])])
  // formerly ENERES 190C
  boolean is_eneres_131 and([equal([subject, "ENERES"]), or([equal([number, "131"]), equal([number, "190C"])])]) 
  // formerly ESPM C133/GEOG C135
  boolean is_geog_135 and([equal([subject, "GEOG"]), or([equal([number, "135"]), equal([number, "C135"])])]) 
  boolean is_espm_c133 and([equal([subject, "ESPM"]), equal([number, "C133"])])
  boolean is_espm_ldarch_c177 and([or([equal([subject, "ESPM"]), equal([subject, "LDARCH"])]), equal([number, "C177"])])
  boolean is_ldarch_122 and([equal([subject, "LDARCH"]), equal([number, "122"])])

  boolean return or([is_arch_140, is_civeng_107, is_civeng_110, is_civeng_111, is_civeng_155, is_civeng_191, is_eneres_131, is_geog_135, is_espm_c133, is_espm_ldarch_c177, is_ldarch_122])
}

Function<AndRequirement>() eval_sustainable_dev_engineering (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, sustainable_development_engineering_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, sustainable_development_engineering_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Sustainable Development and Engineering")
}



Function<boolean>(Course) urban_science_lower_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_civeng_88 and([equal([subject, "CIVENG"]), equal([number, "88"])])
  boolean is_envdes_4b and([equal([subject, "ENV DES"]), equal([number, "4B"])])
  boolean is_geog_70ac and([equal([subject, "GEOG"]), equal([number, "70AC"])])

  boolean return or([is_civeng_88, is_envdes_4b, is_geog_70ac])
}

Function<boolean>(Course) urban_science_upper_div_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_arch_110ac and([equal([subject, "ARCH"]), equal([number, "110AC"])])
  boolean is_cyplan_110 and([equal([subject, "CYPLAN"]), equal([number, "110"])])
  boolean is_cyplan_113a and([equal([subject, "CYPLAN"]), equal([number, "113A"])])
  boolean is_cyplan_114 and([equal([subject, "CYPLAN"]), equal([number, "114"])])
  boolean is_cyplan_119 and([equal([subject, "CYPLAN"]), equal([number, "119"])])
  boolean is_cyplan_140 and([equal([subject, "CYPLAN"]), equal([number, "140"])])
  boolean is_eneres_131 and([equal([subject, "ENERES"]), equal([number, "131"])])
  boolean is_envdes_100 and([equal([subject, "ENVDES"]), equal([number, "100"])])
  boolean is_envdes_102 and([equal([subject, "ENVDES"]), equal([number, "102"])])
  boolean is_geog_181 and([equal([subject, "GEOG"]), equal([number, "181"])])
  boolean is_geog_182 and([equal([subject, "GEOG"]), equal([number, "182"])])
  boolean is_ldarch_130 and([equal([subject, "LDARCH"]), equal([number, "130"])])
  boolean is_ldarch_geog_c188 and([or([equal([subject, "LDARCH"]), equal([subject, "GEOG"])]), equal([number, "C188"])])
  boolean is_ldarch_187 and([equal([subject, "LDARCH"]), equal([number, "187"])])
  boolean is_sociol_136 and([equal([subject, "SOCIOL"]), equal([number, "136"])])

  boolean return or([is_arch_110ac, is_cyplan_110, is_cyplan_113a, is_cyplan_114, is_cyplan_119, is_cyplan_140, is_eneres_131, is_envdes_100, is_envdes_102, is_geog_181, is_geog_182, is_ldarch_130, is_ldarch_geog_c188, is_ldarch_187, is_sociol_136])
}

Function<AndRequirement>() eval_urban_science (){
  List<Course> courses get_attr(this, "allCourses")

  List<Course> lower_div_matches filter(courses, urban_science_lower_div_finder)
  NCoursesRequirement lower_div {lower_div_matches, 1, "Lower Division"}

  List<Course> upper_div_matches filter(courses, urban_science_upper_div_finder)
  NCoursesRequirement upper_div {upper_div_matches, 2, "Upper Division"}

  AndRequirement return AndRequirement([lower_div, upper_div], "Urban Science")
}

// Ensures a course isn't double-counted for Probability and C&ID
Function<boolean>(Course) cid_only_finder (course) {
  boolean is_cid computational_inferential_depth_finder(course)
  boolean is_prob probability_finder(course)
  boolean return and([is_cid, not(is_prob)])
}

// Checks if it's one of the mutually exclusive courses AND is being used in Prob or C&ID
Function<boolean>(Course) ds_mutex_finder (course) {
  List<Course> mutex_list [{"EECS 126"}, {"INDENG 173"}, {"STAT 150"}]
  boolean is_mutex one_common_course([course], mutex_list)
  boolean is_prob probability_finder(course)
  boolean is_cid cid_only_finder(course)
  boolean return and([is_mutex, or([is_prob, is_cid])])
}

Function<boolean>(Course) any_ds_upper_div_finder (course) {
  boolean is_c100 data_c100_finder(course)
  boolean is_prob probability_finder(course)
  boolean is_mod modeling_finder(course)
  boolean is_hc human_contexts_finder(course)
  boolean is_cid cid_only_finder(course)
  boolean return or([is_c100, is_prob, is_mod, is_hc, is_cid])
}


Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  // Lower Division
  
  // Foundations of Data Science
  List<Course> foundations_list [{"DATA C8"}, {"STAT C8"}, {"COMPSCI C8"}, {"STAT 20"}]
  List<Course> foundations_matches filter(courses, (c) { boolean return one_common_course([c], foundations_list) })
  NCoursesRequirement foundations {foundations_matches, 1, "Foundations of Data Science"}

  // Calculus I 
  List<Course> calc1_list [{"MATH 51"}, {"MATH 1A"}, {"MATH N1A"}, {"MATH 10A"}, {"MATH 16A"}]
  List<Course> calc1_matches filter(courses, (c) { boolean return one_common_course([c], calc1_list) })
  NCoursesRequirement calc1 {calc1_matches, 1, "Calculus I"}

  // Calculus II
  List<Course> calc2_list [{"DATA 89"}, {"MATH 52"}, {"MATH 1B"}, {"MATH N1B"}]
  List<Course> calc2_matches filter(courses, (c) { boolean return one_common_course([c], calc2_list) })
  NCoursesRequirement calc2 {calc2_matches, 1, "Calculus II"}

  // Linear Algebra
  List<Course> linalg_solo_list [{"MATH 54"}, {"MATH N54"}, {"MATH W54"}, {"MATH 56"}, {"PHYSICS 89"}, {"STAT 89A"}]
  List<Course> linalg_solo_matches filter(courses, (c) { boolean return one_common_course([c], linalg_solo_list) })
  boolean has_solo_linalg greater_than(length(linalg_solo_matches), 0)

  List<Course> linalg_16a_list [{"EECS 16A"}]
  List<Course> linalg_16b_list [{"EECS 16B"}]
  List<Course> linalg_16a_matches filter(courses, (c) { boolean return one_common_course([c], linalg_16a_list) })
  List<Course> linalg_16b_matches filter(courses, (c) { boolean return one_common_course([c], linalg_16b_list) })
  boolean has_16a greater_than(length(linalg_16a_matches), 0)
  boolean has_16b greater_than(length(linalg_16b_matches), 0)
  boolean has_16ab and([has_16a, has_16b])

  boolean linalg_satisfied or([has_solo_linalg, has_16ab])
  BooleanRequirement linalg {linalg_satisfied, "Linear Algebra"}

  // Program Structures
  List<Course> prog_structures_list [{"COMPSCI 61A"}, {"COMPSCI C88C"}, {"DATA C88C"}, {"ENGIN 7"}]
  List<Course> prog_structures_matches filter(courses, (c) { boolean return one_common_course([c], prog_structures_list) })
  NCoursesRequirement prog_structures {prog_structures_matches, 1, "Program Structures"}

  // Data Structures
  List<Course> data_structures_list [{"COMPSCI 61B"}, {"COMPSCI 61BL"}]
  List<Course> data_structures_matches filter(courses, (c) { boolean return one_common_course([c], data_structures_list) })
  NCoursesRequirement data_structures {data_structures_matches, 1, "Data Structures"}
  
  // Stat 20 / Engin 7 Conflict Check
  List<Course> engin_7_list [{"ENGIN 7"}]
  List<Course> engin_7_matches filter(courses, (c) { boolean return one_common_course([c], engin_7_list) })
  boolean used_engin_7 greater_than(length(engin_7_matches), 0)

  List<Course> stat_20_list [{"STAT 20"}]
  List<Course> stat_20_matches filter(courses, (c) { boolean return one_common_course([c], stat_20_list) })
  boolean used_stat_20 greater_than(length(stat_20_matches), 0)

  List<Course> data_c8_list [{"DATA C8"}, {"STAT C8"}, {"COMPSCI C8"}]
  List<Course> data_c8_matches filter(courses, (c) { boolean return one_common_course([c], data_c8_list) })
  boolean has_data_c8 greater_than(length(data_c8_matches), 0)

  boolean stat_20_used_for_foundations and([used_stat_20, not(has_data_c8)])
  boolean stat_20_substitution_invalid and([stat_20_used_for_foundations, used_engin_7])
  BooleanRequirement stat_20_engin_7_conflict {not(stat_20_substitution_invalid), "STAT 20 & ENGIN 7 Conflict Rule"}

  // Upper Division

  // Data Principles
  List<Course> data_c100_matches filter(courses, data_c100_finder)
  NCoursesRequirement data_c100 {data_c100_matches, 1, "Principles and Techniques of Data Science"}

  List<Course> probability_matches filter(courses, probability_finder)
  NCoursesRequirement probability {probability_matches, 1, "Probability"}

  List<Course> modeling_matches filter(courses, modeling_finder)
  NCoursesRequirement modeling {modeling_matches, 1, "Modeling, Learning, and Decision-Making"}

  List<Course> human_contexts_matches filter(courses, human_contexts_finder)
  NCoursesRequirement human_contexts {human_contexts_matches, 1, "Human Contexts and Ethics"}

  // Computational & Inferential Depth: 2 courses totaling 7+ units
  List<Course> cid_matches filter(courses, cid_only_finder)
  number cid_units reduce(cid_matches, add_course_units, 0)
  number cid_course_count length(cid_matches)
  BooleanRequirement cid_min_courses {not(less_than(cid_course_count, 2)), "Computational & Inferential Depth"}
  BooleanRequirement cid_min_units {not(less_than(cid_units, 7)), "Computational & Inferential Depth Units"}

  // Mutex Checks
  List<Course> mutex_matches filter(courses, ds_mutex_finder)
  BooleanRequirement mutex_check {not(greater_than(length(mutex_matches), 1)), "EECS 126, IND ENG 173, STAT 150 Conflict Rule"}

  // COMPSCI 169L Check
  List<Course> cs_169a_list [{"COMPSCI 169A"}, {"COMPSCI W169A"}]
  List<Course> cs_169l_list [{"COMPSCI 169L"}]
  List<Course> cs_169_list [{"COMPSCI 169"}, {"COMPSCI W169"}]
  boolean cid_has_169l greater_than(length(filter(cid_matches, (c) { boolean return one_common_course([c], cs_169l_list) })), 0)
  boolean cid_has_169a greater_than(length(filter(cid_matches, (c) { boolean return one_common_course([c], cs_169a_list) })), 0)
  boolean cid_has_169 greater_than(length(filter(cid_matches, (c) { boolean return one_common_course([c], cs_169_list) })), 0)
  
  boolean cs_169l_invalid and([cid_has_169l, cid_has_169, not(cid_has_169a)])
  BooleanRequirement cs_169l_check {not(cs_169l_invalid), "COMPSCI 169L Pairing Rule"}

  // ECON 140 / 141 Check
  List<Course> econ_140_list [{"ECON 140"}]
  List<Course> econ_141_list [{"ECON 141"}]
  boolean cid_has_econ140 greater_than(length(filter(cid_matches, (c) { boolean return one_common_course([c], econ_140_list) })), 0)
  boolean cid_has_econ141 greater_than(length(filter(cid_matches, (c) { boolean return one_common_course([c], econ_141_list) })), 0)
  BooleanRequirement econ_140_141_check {not(and([cid_has_econ140, cid_has_econ141])), "ECON 140 & 141 Conflict Rule"}

  // Total Upper Division Unit Check (Using combined finder to guarantee unique elements)
  List<Course> any_ud_matches filter(courses, any_ds_upper_div_finder)
  number total_ud_units reduce(any_ud_matches, add_course_units, 0)
  BooleanRequirement upper_div_min_courses {not(less_than(length(any_ud_matches), 8)), "Upper Division Courses"}
  BooleanRequirement upper_div_min_units {not(less_than(total_ud_units, 28)), "Upper Division Units"}

  // Domain Emphasis
  AndRequirement de_applied_math eval_applied_math()
  AndRequirement de_bioinformatics eval_bioinformatics()
  AndRequirement de_business_analytics eval_business_analytics()
  AndRequirement de_cognition eval_cognition()
  AndRequirement de_data_arts_humanities eval_data_arts_humanities()
  AndRequirement de_ecology_environment eval_ecology_environment()
  AndRequirement de_economics eval_economics()
  AndRequirement de_education eval_education()
  AndRequirement de_environment_resource_society eval_environment_resource_society()
  AndRequirement de_evolution_biodiversity eval_evolution_biodiversity()
  AndRequirement de_geospatial eval_geospatial()
  AndRequirement de_human_population_health eval_human_population_health()
  AndRequirement de_human_behavior_psychology eval_human_behavior_psychology()
  AndRequirement de_inequalities_in_society eval_inequalities_in_society()
  AndRequirement de_linguistic_sciences eval_linguistic_sciences()
  AndRequirement de_neuroscience eval_neuroscience()
  AndRequirement de_organizations_economy eval_organizations_economy()
  AndRequirement de_phil_foundations_evidence eval_phil_foundations_evidence()
  AndRequirement de_phil_foundations_minds eval_phil_foundations_minds()
  AndRequirement de_physical_science_analytics eval_physical_science_analytics()
  AndRequirement de_quantitative_social_science eval_quantitative_social_science()
  AndRequirement de_robotics eval_robotics()
  AndRequirement de_sts eval_sts()
  AndRequirement de_social_welfare_health_poverty eval_social_welfare_health_poverty()
  AndRequirement de_social_policy_law eval_social_policy_law()
  AndRequirement de_sustainable_dev_engineering eval_sustainable_dev_engineering()
  AndRequirement de_urban_science eval_urban_science()
  
  OrRequirement domain_emphasis {[de_applied_math, de_bioinformatics, de_business_analytics, de_cognition, de_data_arts_humanities, de_ecology_environment, de_economics, de_education, de_environment_resource_society, de_evolution_biodiversity, de_geospatial, de_human_population_health, de_human_behavior_psychology, de_inequalities_in_society, de_linguistic_sciences, de_neuroscience, de_organizations_economy, de_phil_foundations_evidence, de_phil_foundations_minds, de_physical_science_analytics, de_quantitative_social_science, de_robotics, de_sts, de_social_welfare_health_poverty, de_social_policy_law, de_sustainable_dev_engineering, de_urban_science], "Domain Emphasis"}
  
  List<Requirement> return [foundations, calc1, calc2, linalg, prog_structures, data_structures, stat_20_engin_7_conflict, data_c100, probability, modeling, human_contexts, cid_min_courses, cid_min_units, mutex_check, cs_169l_check, econ_140_141_check, upper_div_min_courses, upper_div_min_units, domain_emphasis]
}
`;
