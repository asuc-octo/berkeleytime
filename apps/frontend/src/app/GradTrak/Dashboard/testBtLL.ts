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
  Requirement elw {"Entry Level Writing", greater_than(length(elw_matches), 0)}
  List<Course> ah_matches filter(courses, ah_finder)
  Requirement ah {"American History or American Institutions", greater_than(length(ah_matches), 0)}
  List<Course> ac_matches filter(courses, ac_finder)
  Requirement ac {"American Cultures", greater_than(length(ac_matches), 0)}
  Requirement total_units {"Minimum Total Units", or([greater_than(get_attr(this, "units"), 120), equal([get_attr(this, "units"), 120])])}

  // Senior residence 
  List<Column> columns get_attr(this, "columns")
  List<Column> only_spring_fall filter(columns, spring_fall_column)
  Column divider_column get_element(only_spring_fall, add([length(only_spring_fall), -3]))
  number index findIndex(columns, find_divider_column)
  List<Column> pre_senior_columns slice(columns, 0, add([index, 1]))
  number pre_senior_units reduce(pre_senior_columns, add_units, 0)
  number senior_units reduce(slice(columns, add([index, 1]), length(columns)), add_units, 0)
  Requirement senior_residence {"Senior Residence", and([greater_than(pre_senior_units, 17), equal([senior_units, 0])])}

  List<Requirement> return [elw, ah, ac, total_units, senior_residence]
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
  boolean social_and_behavioral_sciences contains(breadth_requirements, "Social and Behavioral Sciences")
  boolean rca_requirement contains(breadth_requirements, "Reading and Composition A")
  boolean rcb_requirement contains(breadth_requirements, "Reading and Composition B")
  boolean return or([arts_and_lit, historical_studies, international_studies, philosophy_and_values, social_and_behavioral_sciences, rca_requirement, rcb_requirement])
}

Function<List<Requirement>>() main (){
  // H/SS matcher
  List<Course> courses get_attr(this, "allCourses")

  // 6 H/SS
  List<Course> hss_courses filter(courses, hss_finder)
  Requirement hss {"Minimum 6 H/SS Courses", greater_than(length(hss_courses), 5)}

  // 2 H/SS Upper div
  List<Course> hss_upper_div_courses filter(courses, (c) {
    boolean is_hss_course hss_finder(c)
    boolean is_upper_div regex_match(get_attr(c, "number"), "\d\d\d")
    boolean return and([is_hss_course, is_upper_div])
  })
  Requirement hss_upper_div {"Minimum 2 H/SS Upper Div Courses", greater_than(length(hss_upper_div_courses), 1)}

  // R&C A
  List<Course> rca_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Reading and Composition A")
  })
  Requirement rca {"Reading and Composition A", greater_than(length(rca_courses), 0)}

  // R&C B
  List<Course> rcb_courses filter(courses, (c) {
    List<string> breadth_requirements get_attr(c, "breadthRequirements")
    boolean return contains(breadth_requirements, "Reading and Composition B")
  })
  Requirement rcb {"Reading and Composition B", greater_than(length(rcb_courses), 0)}

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

Function<boolean>(Course) design_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")
  
  // ELENG C128, 130, 140, 143, 192
  boolean is_eleng_c128 and([equal([subject, "ELENG"]), equal([number, "C128"])])
  boolean is_eleng_130 and([equal([subject, "ELENG"]), equal([number, "130"])])
  boolean is_eleng_140 and([equal([subject, "ELENG"]), equal([number, "140"])])
  boolean is_eleng_143 and([equal([subject, "ELENG"]), equal([number, "143"])])
  boolean is_eleng_192 and([equal([subject, "ELENG"]), equal([number, "192"])])
  boolean is_eleng_design or([is_eleng_c128, is_eleng_130, is_eleng_140, is_eleng_143, is_eleng_192])
  
  // COMPSCI 160, 161, 162, 164, 169 (or 169A, 169L, W169A), 180, 182 (or L182, W182), 184, 186 (or W186), 194 (Section 26), 285
  boolean is_compsci_160 and([equal([subject, "COMPSCI"]), equal([number, "160"])])
  boolean is_compsci_161 and([equal([subject, "COMPSCI"]), equal([number, "161"])])
  boolean is_compsci_162 and([equal([subject, "COMPSCI"]), equal([number, "162"])])
  boolean is_compsci_164 and([equal([subject, "COMPSCI"]), equal([number, "164"])])
  boolean is_compsci_169 and([equal([subject, "COMPSCI"]), or([equal([number, "169"]), equal([number, "169A"]), equal([number, "169L"]), equal([number, "W169A"])])])
  boolean is_compsci_180 and([equal([subject, "COMPSCI"]), equal([number, "180"])])
  boolean is_compsci_182 and([equal([subject, "COMPSCI"]), or([equal([number, "182"]), equal([number, "L182"]), equal([number, "W182"])])])
  boolean is_compsci_184 and([equal([subject, "COMPSCI"]), equal([number, "184"])])
  boolean is_compsci_186 and([equal([subject, "COMPSCI"]), or([equal([number, "186"]), equal([number, "W186"])])])
  boolean is_compsci_285_design and([equal([subject, "COMPSCI"]), equal([number, "285"])])
  boolean is_compsci_design or([is_compsci_160, is_compsci_161, is_compsci_162, is_compsci_164, is_compsci_169, is_compsci_180, is_compsci_182, is_compsci_184, is_compsci_186, is_compsci_285_design])
  
  // EECS C106A, C106B, 149 (151 handled separately with 151LA/151LB)
  boolean is_eecs_c106a and([equal([subject, "EECS"]), equal([number, "C106A"])])
  boolean is_eecs_c106b and([equal([subject, "EECS"]), equal([number, "C106B"])])
  boolean is_eecs_149 and([equal([subject, "EECS"]), equal([number, "149"])])
  boolean is_eecs_design or([is_eecs_c106a, is_eecs_c106b, is_eecs_149])
  
  boolean return or([is_eleng_design, is_compsci_design, is_eecs_design])
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
  List<Course> math_lower_div_req ["MATH 51", "MATH 52", "MATH 53", "MATH 54", "COMPSCI 70"]
  boolean math_lower_div_matches all_common_courses(courses, math_lower_div_req)
  Requirement math_lower_div {"Lower Division Mathematics", math_lower_div_matches}
  
  // Lower Division Physics: (PHYSICS 7A OR 5A) AND (PHYSICS 7B OR 5B) OR (PHYSICS 5A AND 5B AND 5BL)
  List<Course> physics7 ["PHYSICS 7A", "PHYSICS 7B"]
  List<Course> physics5 ["PHYSICS 5A", "PHYSICS 5B", "PHYSICS 5BL"]
  boolean has_physics7 all_common_courses(courses, physics7)
  boolean has_physics5 all_common_courses(courses, physics5)
  boolean physics_met or([has_physics7, has_physics5])
  Requirement physics_lower_div {"Lower Division Physics", physics_met}
  
  // Lower Division Computer Science: COMPSCI 61A, (61B OR 61BL), 61C
  List<Course> cs61b ["COMPSCI 61A", "COMPSCI 61B", "COMPSCI 61C"]
  List<Course> cs61bl ["COMPSCI 61A", "COMPSCI 61BL", "COMPSCI 61C"]
  boolean has_cs61 or([all_common_courses(courses, cs61b), all_common_courses(courses, cs61bl)])
  Requirement cs_lower_div {"Lower Division Computer Science", has_cs61}
  
  // Lower Division EECS: EECS 16A, 16B
  List<Course> eecs16 ["EECS 16A", "EECS 16B"]
  boolean has_eecs16 all_common_courses(courses, eecs16)
  Requirement eecs_lower_div {"Lower Division EECS", has_eecs16}
  
  // Upper Division Technical Electives: 20 units from eligible courses
  List<Course> eecs_upper_div_matches filter(courses, eecs_upper_div_finder)
  number eecs_upper_div_units reduce(eecs_upper_div_matches, add_course_units, 0)
  Requirement eecs_upper_div {"Upper Division Technical Electives", or([greater_than(eecs_upper_div_units, 20), equal([eecs_upper_div_units, 20])])}
  
  // Upper Division Design Requirement: At least one design course
  List<Course> design_matches filter(courses, design_finder)
  List<Course> eecs151_la_req ["EECS 151", "EECS 151LA"]
  List<Course> eecs151_lb_req ["EECS 151", "EECS 151LB"]
  boolean has_design greater_than(length(design_matches), 0)
  boolean has_eecs151_la all_common_courses(courses, eecs151_la_req)
  boolean has_eecs151_lb all_common_courses(courses, eecs151_lb_req)
  boolean design_met or([has_design, has_eecs151_la, has_eecs151_lb])
  Requirement design {"Upper Division Design Requirement", design_met}
  
  // Engineering Units: 40 units (EECS lower div except COMPSCI 70 + 20 units upper div)
  List<Course> eecs_lower_div_matches filter(courses, eecs_lower_div_finder)
  number eecs_lower_div_units reduce(eecs_lower_div_matches, add_course_units, 0)
  number total_engineering_units add([eecs_lower_div_units, eecs_upper_div_units])
  Requirement engineering_units {"Engineering Units", or([greater_than(total_engineering_units, 40), equal([total_engineering_units, 40])])}
  
  // Natural Science Elective: Various options with "must take both" requirements
  List<Course> astron7a_req ["ASTRON 7A", "PHYSICS 7A", "PHYSICS 7B"]
  List<Course> astron7b_req ["ASTRON 7B", "PHYSICS 7A", "PHYSICS 7B"]
  List<Course> astron7ab_req ["ASTRON 7AB", "PHYSICS 7A", "PHYSICS 7B"]
  boolean has_astron7a all_common_courses(courses, astron7a_req)
  boolean has_astron7b all_common_courses(courses, astron7b_req)
  boolean has_astron7ab all_common_courses(courses, astron7ab_req)
  boolean astron_met or([has_astron7a, has_astron7b, has_astron7ab])
  
  List<Course> biology1a_req ["BIOLOGY 1A", "BIOLOGY 1AL"]
  List<Course> biology1b_req ["BIOLOGY 1B"]
  boolean has_biology1a all_common_courses(courses, biology1a_req)
  boolean has_biology1b one_common_course(courses, biology1b_req)
  boolean biology_met or([has_biology1a, has_biology1b])
  
  List<Course> chem1a_req ["CHEM 1A", "CHEM 1AL"]
  List<Course> chem1b_req ["CHEM 1B"]
  List<Course> chem3a_req ["CHEM 3A", "CHEM 3AL"]
  List<Course> chem3b_req ["CHEM 3B", "CHEM 3BL"]
  List<Course> chem4a_req ["CHEM 4A"]
  List<Course> chem4b_req ["CHEM 4B"]
  boolean has_chem1a all_common_courses(courses, chem1a_req)
  boolean has_chem1b one_common_course(courses, chem1b_req)
  boolean has_chem3a all_common_courses(courses, chem3a_req)
  boolean has_chem3b all_common_courses(courses, chem3b_req)
  boolean has_chem4a one_common_course(courses, chem4a_req)
  boolean has_chem4b one_common_course(courses, chem4b_req)
  boolean chem_met or([has_chem1a, has_chem1b, has_chem3a, has_chem3b, has_chem4a, has_chem4b])
  
  List<Course> mcellbi32_req ["MCELLBI 32", "MCELLBI 32L"]
  boolean mcellbi32_32l_met all_common_courses(courses, mcellbi32_req)
  
  List<Course> physics7c_req ["PHYSICS 7C"]
  List<Course> physics5c_req ["PHYSICS 5C", "PHYSICS 5CL"]
  boolean has_physics7c one_common_course(courses, physics7c_req)
  boolean has_physics5c all_common_courses(courses, physics5c_req)
  boolean physics_met or([has_physics7c, has_physics5c])
  
  List<Course> natural_science_upper_div_matches filter(courses, natural_science_upper_div_finder)
  boolean has_natural_science_upper_div greater_than(length(natural_science_upper_div_matches), 0)
  
  Requirement natural_science {"Natural Science Elective", or([astron_met, biology_met, chem_met, mcellbi32_32l_met, physics_met, has_natural_science_upper_div])}
  
  // Ethics Requirement: At least one from the list
  List<Course> ethics_req ["BIOENG 100", "COMPSCI H195", "COMPSCI 195", "DATA C104", "ENERES C100", "ENERES W100", "ENGIN 125", "ENGIN 157AC", "ENGIN 185", "HISTORY C184D", "IAS 157AC", "INFO 88A", "ISF 100D", "ISF 100G", "MEDIAST 104D", "NWMEDIA 151AC", "PHILOS 121", "PUBPOL C184", "PUBPOL W184", "STS C104D", "UGBA 107"]
  boolean ethics_met one_common_course(courses, ethics_req)
  Requirement ethics {"Ethics Requirement", ethics_met}
  
  List<Requirement> return [math_lower_div, physics_lower_div, cs_lower_div, eecs_lower_div, eecs_upper_div, design, engineering_units, natural_science, ethics]
}
`;
