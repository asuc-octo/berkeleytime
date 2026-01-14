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
