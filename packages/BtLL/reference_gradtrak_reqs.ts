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
  NumberRequirement pre_senior_units_req {pre_senior_units, 90, "Minimum 90 units in pre-senior columns"}
  NumberRequirement senior_units_req {senior_units, 24, "Minimum 24 units in senior columns"}
  AndRequirement senior_residence {[pre_senior_units_req, senior_units_req], "Senior Residence"}

  List<Requirement> return [elw, ah, ac, total_units_req, senior_residence]
}
`;

export const RNC_BTLL = `
Function<List<Requirement>>(List<Course>) rc_requirements (courses){
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

  List<Requirement> return [rca, rcb]
}
`;

export const SEVEN_BREADTHS_BTLL = `
Function<List<Requirement>>(List<Course>) seven_breadths_requirements (courses){
  // Collect all eligible courses per breadth category (unfiltered)
  List<Course> arts_and_lit_eligible filter(courses, (c) {
    List<string> br get_attr(c, "breadthRequirements")
    boolean return contains(br, "Arts & Literature")
  })
  List<Course> biological_sciences_eligible filter(courses, (c) {
    List<string> br get_attr(c, "breadthRequirements")
    boolean return or([contains(br, "Biological Sciences"), contains(br, "Biological Science")])
  })
  List<Course> historical_studies_eligible filter(courses, (c) {
    List<string> br get_attr(c, "breadthRequirements")
    boolean return contains(br, "Historical Studies")
  })
  List<Course> international_studies_eligible filter(courses, (c) {
    List<string> br get_attr(c, "breadthRequirements")
    boolean return contains(br, "International Studies")
  })
  List<Course> philosophy_and_values_eligible filter(courses, (c) {
    List<string> br get_attr(c, "breadthRequirements")
    boolean return contains(br, "Philosophy & Values")
  })
  List<Course> physical_sciences_eligible filter(courses, (c) {
    List<string> br get_attr(c, "breadthRequirements")
    boolean return or([contains(br, "Physical Sciences"), contains(br, "Physical Science")])
  })
  List<Course> social_and_behavioral_sciences_eligible filter(courses, (c) {
    List<string> br get_attr(c, "breadthRequirements")
    boolean return or([contains(br, "Social & Behavioral Sciences"), contains(br, "Social and Behavioral Sciences")])
  })

  // Greedy deduplication: assign courses to categories in order, excluding already-used ones
  // 1. Arts & Literature
  List<Course> arts_and_lit_courses slice(arts_and_lit_eligible, 0, 1)
  NCoursesRequirement arts_and_lit {arts_and_lit_eligible, length(arts_and_lit_courses), 1, "Arts & Literature"}

  // 2. Biological Sciences
  List<Course> biological_sciences_pool filter(biological_sciences_eligible, (c) {
    boolean return not(one_common_course([c], arts_and_lit_courses))
  })
  List<Course> biological_sciences_courses slice(biological_sciences_pool, 0, 1)
  NCoursesRequirement biological_sciences {biological_sciences_eligible, length(biological_sciences_courses), 1, "Biological Sciences"}

  // 3. Historical Studies
  List<Course> historical_studies_pool filter(historical_studies_eligible, (c) {
    boolean used_arts one_common_course([c], arts_and_lit_courses)
    boolean used_bio one_common_course([c], biological_sciences_courses)
    boolean return not(or([used_arts, used_bio]))
  })
  List<Course> historical_studies_courses slice(historical_studies_pool, 0, 1)
  NCoursesRequirement historical_studies {historical_studies_eligible, length(historical_studies_courses), 1, "Historical Studies"}

  // 4. International Studies
  List<Course> international_studies_pool filter(international_studies_eligible, (c) {
    boolean used_arts one_common_course([c], arts_and_lit_courses)
    boolean used_bio one_common_course([c], biological_sciences_courses)
    boolean used_hist one_common_course([c], historical_studies_courses)
    boolean return not(or([used_arts, used_bio, used_hist]))
  })
  List<Course> international_studies_courses slice(international_studies_pool, 0, 1)
  NCoursesRequirement international_studies {international_studies_eligible, length(international_studies_courses), 1, "International Studies"}

  // 5. Philosophy & Values
  List<Course> philosophy_and_values_pool filter(philosophy_and_values_eligible, (c) {
    boolean used_arts one_common_course([c], arts_and_lit_courses)
    boolean used_bio one_common_course([c], biological_sciences_courses)
    boolean used_hist one_common_course([c], historical_studies_courses)
    boolean used_intl one_common_course([c], international_studies_courses)
    boolean return not(or([used_arts, used_bio, used_hist, used_intl]))
  })
  List<Course> philosophy_and_values_courses slice(philosophy_and_values_pool, 0, 1)
  NCoursesRequirement philosophy_and_values {philosophy_and_values_eligible, length(philosophy_and_values_courses), 1, "Philosophy & Values"}

  // 6. Physical Sciences
  List<Course> physical_sciences_pool filter(physical_sciences_eligible, (c) {
    boolean used_arts one_common_course([c], arts_and_lit_courses)
    boolean used_bio one_common_course([c], biological_sciences_courses)
    boolean used_hist one_common_course([c], historical_studies_courses)
    boolean used_intl one_common_course([c], international_studies_courses)
    boolean used_phv one_common_course([c], philosophy_and_values_courses)
    boolean return not(or([used_arts, used_bio, used_hist, used_intl, used_phv]))
  })
  List<Course> physical_sciences_courses slice(physical_sciences_pool, 0, 1)
  NCoursesRequirement physical_sciences {physical_sciences_eligible, length(physical_sciences_courses), 1, "Physical Sciences"}

  // 7. Social & Behavioral Sciences
  List<Course> social_and_behavioral_sciences_pool filter(social_and_behavioral_sciences_eligible, (c) {
    boolean used_arts one_common_course([c], arts_and_lit_courses)
    boolean used_bio one_common_course([c], biological_sciences_courses)
    boolean used_hist one_common_course([c], historical_studies_courses)
    boolean used_intl one_common_course([c], international_studies_courses)
    boolean used_phv one_common_course([c], philosophy_and_values_courses)
    boolean used_phys one_common_course([c], physical_sciences_courses)
    boolean return not(or([used_arts, used_bio, used_hist, used_intl, used_phv, used_phys]))
  })
  List<Course> social_and_behavioral_sciences_courses slice(social_and_behavioral_sciences_pool, 0, 1)
  NCoursesRequirement social_and_behavioral_sciences {social_and_behavioral_sciences_eligible, length(social_and_behavioral_sciences_courses), 1, "Social & Behavioral Sciences"}

  List<Requirement> return [arts_and_lit, biological_sciences, historical_studies, international_studies, philosophy_and_values, physical_sciences, social_and_behavioral_sciences]
}
`;

export const COE_REQ_BTLL = `${RNC_BTLL}
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

  List<Requirement> rc_reqs rc_requirements(courses)
  Requirement rca get_element(rc_reqs, 0)
  Requirement rcb get_element(rc_reqs, 1)

  List<Requirement> return [hss, hss_upper_div, rca, rcb]
}
`;

export const CDSS_REQ_BTLL = `${SEVEN_BREADTHS_BTLL}${RNC_BTLL}
Function<List<Requirement>>() main (){
  // 7 course breadth & essential skills matcher
  List<Course> courses get_attr(this, "allCourses")

  List<Requirement> breadth7 seven_breadths_requirements(courses)
  Requirement arts_and_lit get_element(breadth7, 0)
  Requirement biological_sciences get_element(breadth7, 1)
  Requirement historical_studies get_element(breadth7, 2)
  Requirement international_studies get_element(breadth7, 3)
  Requirement philosophy_and_values get_element(breadth7, 4)
  Requirement physical_sciences get_element(breadth7, 5)
  Requirement social_and_behavioral_sciences get_element(breadth7, 6)

  List<Requirement> rc_reqs rc_requirements(courses)
  Requirement rca get_element(rc_reqs, 0)
  Requirement rcb get_element(rc_reqs, 1)

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

export const LNS_QR_BTLL = `
Function<List<Requirement>>(List<Course>) lns_qr_requirements (courses){
  // pulled from https://lsadvising.berkeley.edu/quantitative-reasoning
  List<Course> qr_courses filter(courses, (c) {
    List<Course> qr_req [
      {"COMPSCI C8"},
      {"COMPSCI 10"},
      {"COMPSCI W10"},
      {"COMPSCI 61A"},
      {"COMPSCI 61B"},
      {"COMPSCI 61C"},
      {"COMPSCI 70"},
      {"DATA C8"},
      {"INFO C8"},
      {"STAT C8"},
      {"MATH 1A"},
      {"MATH N1A"},
      {"MATH 1B"},
      {"MATH N1B"},
      {"MATH 3"},
      {"MATH 10A"},
      {"MATH N10A"},
      {"MATH 10B"},
      {"MATH N10B"},
      {"MATH X11"},
      {"MATH X12"},
      {"MATH 16A"},
      {"MATH N16A"},
      {"MATH 16B"},
      {"MATH N16B"},
      {"MATH 32"},
      {"MATH N32"},
      {"MATH 51"},
      {"MATH 52"},
      {"MATH 53"},
      {"MATH H53"},
      {"MATH N53"},
      {"MATH W53"},
      {"MATH 54"},
      {"MATH H54"},
      {"MATH N54"},
      {"MATH W54"},
      {"MATH 55"},
      {"MATH N55"},
      {"MATH 56"},
      {"MATH 74"},
      {"STAT 2"},
      {"STAT X10"},
      {"STAT 20"},
      {"STAT 21"},
      {"STAT W21"}
    ]
    boolean return one_common_course([c], qr_req)
  })
  NCoursesRequirement quantitative_reasoning {qr_courses, 1, "Quantitative Reasoning"}
  List<Requirement> return [quantitative_reasoning]
}
`;

export const LNS_LANG_BTLL = `
Function<List<Requirement>>(List<Course>) lns_language_requirements (courses){
  // Language Requirement: second-semester college level or equivalent
  // pulled from https://lsadvising.berkeley.edu/ls-language-requirement
  // SIS attribute code "FL" (Foreign Language); value codes: BEG1, BEG2, INT1, INT2, ADV1, ADV2
  // BEG1 (Beginning 1st semester) does not satisfy; all others do
  List<Course> language_courses filter(courses, (c) {
    string lang_level get_attr(c, "languageLevel")
    boolean has_language not(equal([lang_level, ""]))
    boolean not_first_semester not(equal([lang_level, "BEG1"]))
    boolean return and([has_language, not_first_semester])
  })
  NCoursesRequirement language_req {language_courses, 1, "Language Requirement"}
  List<Requirement> return [language_req]
}
`;

// R&C, Quantitative Reasoning, L&S Language Requirement, 7 Breadths
export const LNS_REQ_BTLL = `${SEVEN_BREADTHS_BTLL}${RNC_BTLL}${LNS_QR_BTLL}${LNS_LANG_BTLL}
Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")
  
  List<Requirement> breadth7 seven_breadths_requirements(courses)
  Requirement arts_and_lit get_element(breadth7, 0)
  Requirement biological_sciences get_element(breadth7, 1)
  Requirement historical_studies get_element(breadth7, 2)
  Requirement international_studies get_element(breadth7, 3)
  Requirement philosophy_and_values get_element(breadth7, 4)
  Requirement physical_sciences get_element(breadth7, 5)
  Requirement social_and_behavioral_sciences get_element(breadth7, 6)

  List<Requirement> rc_reqs rc_requirements(courses)
  Requirement rca get_element(rc_reqs, 0)
  Requirement rcb get_element(rc_reqs, 1)

  List<Requirement> qr_reqs lns_qr_requirements(courses)
  Requirement quantitative_reasoning get_element(qr_reqs, 0)

  List<Requirement> lang_reqs lns_language_requirements(courses)
  Requirement language_req get_element(lang_reqs, 0)

  List<Requirement> return [arts_and_lit, biological_sciences, historical_studies, international_studies, philosophy_and_values, physical_sciences, social_and_behavioral_sciences, rca, rcb, quantitative_reasoning, language_req]
}
`;

export const EDU_REQ_BTLL = `${SEVEN_BREADTHS_BTLL}
Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")
  
  List<Requirement> breadth7 seven_breadths_requirements(courses)
  Requirement arts_and_lit get_element(breadth7, 0)
  Requirement biological_sciences get_element(breadth7, 1)
  Requirement historical_studies get_element(breadth7, 2)
  Requirement international_studies get_element(breadth7, 3)
  Requirement philosophy_and_values get_element(breadth7, 4)
  Requirement physical_sciences get_element(breadth7, 5)
  Requirement social_and_behavioral_sciences get_element(breadth7, 6)

  List<Requirement> return [arts_and_lit, biological_sciences, historical_studies, international_studies, philosophy_and_values, physical_sciences, social_and_behavioral_sciences]
}
`;

export const ENVDES_REQ_BTLL = `
`;

export const CHEMISTRY_REQ_BTLL = `
`;

export const RCNR_REQ_BTLL = `${RNC_BTLL}
Function<boolean>(Course) is_upper_div_course (course){
  string number get_attr(course, "number")
  boolean return or([regex_match(number, "^1[0-9][0-9]"), regex_match(number, "^2[0-9][0-9]"), regex_match(number, "^C1[0-9][0-9]"), regex_match(number, "^C2[0-9][0-9]"), regex_match(number, "^W1[0-9][0-9]"), regex_match(number, "^W2[0-9][0-9]"), regex_match(number, "^N1[0-9][0-9]"), regex_match(number, "^N2[0-9][0-9]")])
}

Function<boolean>(Course) is_rcnr_dept_course (course){
  string subject get_attr(course, "subject")
  boolean is_envecon equal([subject, "ENVECON"])
  boolean is_espm equal([subject, "ESPM"])
  boolean is_eneres equal([subject, "ENERES"])
  boolean is_nusctx equal([subject, "NUSCTX"])
  boolean is_plantbi equal([subject, "PLANTBI"])
  boolean return or([is_envecon, is_espm, is_eneres, is_nusctx, is_plantbi])
}

Function<number>(number, Course) add_course_units (acc, course){
  number units get_attr(course, "units")
  number return add([acc, units])
}

Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  // Reading & Composition
  List<Requirement> rc_reqs rc_requirements(courses)
  Requirement rca get_element(rc_reqs, 0)
  Requirement rcb get_element(rc_reqs, 1)

  // At least 36 upper-division units total
  List<Course> upper_div_courses filter(courses, (c) {
    boolean return is_upper_div_course(c)
  })
  number upper_div_units reduce(upper_div_courses, add_course_units, 0)
  NumberRequirement upper_div_total {upper_div_units, 36, "Total Upper Division Units"}

  // At least 15 of those 36 upper division units must be in Rausser departments
  List<Course> rcnr_upper_div_courses filter(courses, (c) {
    boolean is_upper is_upper_div_course(c)
    boolean is_rcnr is_rcnr_dept_course(c)
    boolean return and([is_upper, is_rcnr])
  })
  number rcnr_upper_div_units reduce(rcnr_upper_div_courses, add_course_units, 0)
  NumberRequirement rcnr_upper_div {rcnr_upper_div_units, 15, "Rausser Upper Division Units"}

  List<Requirement> return [rca, rcb, upper_div_total, rcnr_upper_div]
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
  boolean is_upper_div or([regex_match(number, "^1[0-9][0-9]"), regex_match(number, "^2[0-9][0-9]"), regex_match(number, "^C1[0-9][0-9]"), regex_match(number, "^C2[0-9][0-9]"), regex_match(number, "^W1[0-9][0-9]"), regex_match(number, "^W2[0-9][0-9]"), regex_match(number, "^N1[0-9][0-9]"), regex_match(number, "^N2[0-9][0-9]")])  
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
  boolean is_data_101 and([equal([subject, "DATA"]), or([equal([number, "101"]), equal([number, "C101"])])])
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
  boolean is_data_101 and([equal([subject, "DATA"]), or([equal([number, "101"]), equal([number, "C101"])])])
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
  boolean is_upper_div or([regex_match(number, "^1[0-9][0-9]"), regex_match(number, "^2[0-9][0-9]"), regex_match(number, "^C1[0-9][0-9]"), regex_match(number, "^C2[0-9][0-9]"), regex_match(number, "^W1[0-9][0-9]"), regex_match(number, "^W2[0-9][0-9]"), regex_match(number, "^N1[0-9][0-9]"), regex_match(number, "^N2[0-9][0-9]")])
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
  NCoursesRequirement math_1a {math_1a_51_matches, 1, "Calculus I"}

  List<Course> math_1b_52_list [{"MATH 1B"}, {"MATH 52"}]
  List<Course> math_1b_52_matches filter(courses, (c) {
    boolean return one_common_course([c], math_1b_52_list)
  })
  NCoursesRequirement math_1b {math_1b_52_matches, 1, "Calculus II"}

  // TODO: change this to only accept EECS 16A if taken before Fall 2026
  List<Course> math_54_56_list [{"MATH 54"}, {"MATH 56"}, {"EECS 16A"}]
  List<Course> math_54_56_matches filter(courses, (c) {
    boolean return one_common_course([c], math_54_56_list)
  })
  NCoursesRequirement math_54 {math_54_56_matches, 1, "Linear Algebra"}  

  // TODO: change this to only accept MATH 55 for Math/CS double majors
  List<Course> math_55_compsci_70_list [{"MATH 55"}, {"COMPSCI 70"}]
  List<Course> math_55_compsci_70_matches filter(courses, (c) {
    boolean return one_common_course([c], math_55_compsci_70_list)
  })
  NCoursesRequirement compsci_70 {math_55_compsci_70_matches, 1, "Discrete Math"}

  AndRequirement math_lower_div {[math_1a, math_1b, math_54, compsci_70], "Lower Division Mathematics"}

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
  List<Course> design_used take_until_units(design_eligible, 4)
  number design_units reduce(design_used, add_course_units, 0)
  NumberRequirement design_upper_div {design_eligible, design_units, 4, "Design Upper Division Units"}
  
  // CS: 8 units
  List<Course> cs_eligible filter(courses, cs_upper_div_finder)
  List<Course> cs_pool filter(cs_eligible, (c) {
    boolean is_used one_common_course([c], design_used)
    boolean return not(is_used)
  })
  List<Course> cs_used take_until_units(cs_pool, 8)
  number cs_units reduce(cs_used, add_course_units, 0)
  NumberRequirement cs_upper_div {cs_pool, cs_units, 8, "CS Upper Division Units"}

  // CS/EE/EECS: 8 units
  List<Course> eecs_eligible filter(courses, eecs_upper_div_finder)
  List<Course> eecs_pool filter(eecs_eligible, (c) {
    boolean used_design one_common_course([c], design_used)
    boolean used_cs one_common_course([c], cs_used)
    boolean return not(or([used_design, used_cs]))
  })
  List<Course> eecs_used take_until_units(eecs_pool, 8)
  number eecs_units reduce(eecs_used, add_course_units, 0)
  NumberRequirement eecs_upper_div {eecs_pool, eecs_units, 8, "CS/EE/EECS Upper Division Units"}

  // Technical elective: 4 units
  List<Course> tech_elec_eligible filter(courses, technical_elective_finder)
  List<Course> tech_pool filter(tech_elec_eligible, (c) {
    boolean used_design one_common_course([c], design_used)
    boolean used_cs one_common_course([c], cs_used)
    boolean used_eecs one_common_course([c], eecs_used)
    boolean return not(or([used_design, used_cs, used_eecs]))
  })
  List<Course> tech_used take_until_units(tech_pool, 4)
  number tech_units reduce(tech_used, add_course_units, 0)
  NumberRequirement tech_elec_upper_div {tech_pool, tech_units, 4, "Upper Division Technical Elective"}

  // min 24 total units
  number total_tech_units add([design_units, cs_units, eecs_units, tech_units])
  NumberRequirement total_units_check {total_tech_units, 24, "Total Upper Division Technical Units"}

  List<Requirement> return [math_lower_div, cs_lower_div, design_upper_div, cs_upper_div, eecs_upper_div, tech_elec_upper_div, total_units_check]
}
`;

export const DATASCI_REQ_BTLL = `
Function<boolean>(Course) data_c100_finder (course){
  string subject get_attr(course, "subject")
  string number get_attr(course, "number")

  boolean is_data_c100 and([equal([subject, "DATA"]), or([equal([number, "C100"]), equal([number, "100"])])])
  boolean is_compsci_c100 and([equal([subject, "COMPSCI"]), or([equal([number, "C100"]), equal([number, "100"])])])
  boolean is_stat_c100 and([equal([subject, "STAT"]), or([equal([number, "C100"]), equal([number, "100"])])])

  boolean return or([is_data_c100, is_compsci_c100, is_stat_c100])
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
  List<Course> list [{"MATH 53"}, {"MATH 55"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) applied_math_upper_div_finder (course){
  List<Course> list [
    {"CIVENG C133"}, {"CIVENG C180"}, {"MECENG C133"}, {"MECENG C180"},
    {"EECS 127"}, {"ENGIN 150"}, {"INDENG 160"}, {"INDENG 162"},
    {"MATH 104"}, {"MATH 110"}, {"MATH 113"}, {"MATH 118"},
    {"MATH 126"}, {"MATH 128A"}, {"MATH 128B"}, {"MATH 156"},
    {"COMPSCI C267"}, {"COMPSCI C233"}, {"ENGIN C267"}, {"ENGIN C233"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"BIOLOGY 1A"}, {"BIOLOGY 1B"}, {"MATH 53"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) bioinformatics_upper_div_finder (course){
  List<Course> list [
    {"BIOENG 131"}, {"BIOENG C131"}, {"CMPBIO 131"}, {"CMPBIO C131"},
    {"BIOENG 134"}, {"BIOENG 144"}, {"BIOENG 145"},
    {"BIOENG C149"}, {"CMPBIO C149"},
    {"CHEM 135"}, {"CMPBIO 156"},
    {"CMPBIO C176"}, {"COMPSCI C176"},
    {"INTEGBI 120"}, {"INTEGBI 134L"}, {"INTEGBI 141"}, {"INTEGBI 161"}, {"INTEGBI 164"},
    {"MATH 127"},
    {"MCELLBI C100A"}, {"CHEM C100A"},
    {"MCELLBI 102"}, {"MCELLBI 104"}, {"MCELLBI 130"}, {"MCELLBI 132"},
    {"MCELLBI 137L"}, {"MCELLBI 140"}, {"MCELLBI 143"}, {"MCELLBI 146"},
    {"MCELLBI C148"}, {"PLANTBI C148"},
    {"MCELLBI 149"}, {"MCELLBI 153"}, {"PLANTBI 160"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"ECON 1"}, {"ECON 2"}, {"MATH 53"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) business_analytics_upper_div_finder (course){
  List<Course> list [
    {"ENGIN 183"}, {"ENGIN 183C"}, {"ENGIN 183D"},
    {"INDENG 115"}, {"INDENG 120"}, {"INDENG 130"}, {"INDENG 153"}, {"INDENG 156"}, {"INDENG 166"},
    {"INDENG 185"},
    {"LEGALST 122"},
    {"UGBA 104"}, {"UGBA 134"}, {"UGBA 141"}, {"UGBA 142"}, {"UGBA 147"}, {"UGBA 161"},
    {"UGBA 167"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"COGSCI 1"}, {"COGSCI 1B"}, {"COGSCI N1"}, {"PSYCH C61"}, {"PSYCH C64"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) cognition_upper_div_finder (course){
  List<Course> list [
    {"COGSCI C100"}, {"COGSCI C120"}, {"PSYCH C100"}, {"PSYCH C120"},
    {"COGSCI C101"}, {"COGSCI C105"}, {"LINGUIS C101"}, {"LINGUIS C105"},
    {"COGSCI C126"}, {"PSYCH C126"},
    {"COGSCI C127"}, {"PSYCH C127"},
    {"COGSCI 131"}, {"COGSCI C131"}, {"COGSCI C123"}, {"PSYCH 131"}, {"PSYCH C131"}, {"PSYCH C123"},
    {"COGSCI 132"}, {"COGSCI 150"}, {"COGSCI 180"}, {"COGSCI 190"},
    {"COMPSCI 188"},
    {"MUSIC 108"}, {"MUSIC 108M"},
    {"PSYCH 114"}, {"PSYCH 117"}, {"PSYCH 131"},
    {"PSYCH C143"}, {"PSYCH C146"}, {"LINGUIS C143"}, {"LINGUIS C146"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [
    {"ART 23AC"}, {"ART W23AC"}, {"HISTORY 88"},
    {"LNS 88"},
    {"MUSIC 29"}, {"MUSIC 30"}, {"RHETOR 10"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) data_arts_humanities_upper_div_finder (course){
  List<Course> list [
    {"ART 172"}, {"ART 173"},
    {"DIGHUM 100"}, {"DIGHUM 101"}, {"DIGHUM 150A"}, {"DIGHUM 150B"}, {"DIGHUM 150C"}, {"DIGHUM 160"},
    {"GLOBAL 140"}, {"GLOBAL 121"}, {"JEWISH 140"}, {"JEWISH 121"},
    {"HISTORY 133D"},
    {"HISTART C109"}, {"HISTART C181"}, {"ENGLISH C109"}, {"ENGLISH C181"},
    {"HISTART 190T"},
    {"HISTART 192DH"}, {"INFO 103"}, {"INFO 159"},
    {"INFO 190-1"},
    {"MUSIC 107"}, {"MUSIC 158A"}, {"MUSIC 158B"}, {"MUSIC 159"},
    {"MELC 110"},
    {"RHETOR 107"}, {"RHETOR 114"}, {"RHETOR 115"}, {"RHETOR 137"}, {"RHETOR 145"}, {"RHETOR 170"},
    {"AMERSTD H110"},
    {"ENGLISH 166"},
    {"HISTORY 100S"},
    {"HISTORY 104"},
    {"THEATER 166"}, {"THEATER 190"}, {"NWMEDIA 166"}, {"NWMEDIA 190"},
    {"MELC 114"},
    {"NE STUD 190A"},
    {"SPANISH 135"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"ESPM 2"}, {"ESPM 6"}, {"ESPM 15"}, {"GEOG 40"}, {"ESPM C46"}, {"LNS C46"}, {"ESPM 88B"}, {"EPS 80"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) ecology_environment_upper_div_finder (course){
  List<Course> list [
    {"ENERES 102"},
    {"ESPM 102B"}, {"ESPM 102BL"},
    {"ESPM C103"}, {"ESPM C156"}, {"INTEGBI C103"}, {"INTEGBI C156"},
    {"ESPM 111"},
    {"EPS C129"}, {"ESPM C129"},
    {"ESPM 130A"}, {"ESPM 152"}, {"ESPM 157"},
    {"ESPM C170"}, {"ESPM C183"}, {"EPS C170"}, {"EPS C183"},
    {"ESPM 174A"},
    {"CIVENG C106"}, {"CIVENG C180"}, {"EPS C106"}, {"EPS C180"}, {"ESPM C106"}, {"ESPM C180"},
    {"INTEGBI C153"}, {"ESPM C153"},
    {"INTEGBI 170LF"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [
    {"ECON 1"}, {"ECON 2"},
    {"DATA 88E"}, {"DATA 88"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) economics_upper_div_finder (course){
  List<Course> list [
    {"ECON 100A"}, {"ECON 101A"}, {"ECON 100B"}, {"ECON 101B"},
    {"ECON C103"}, {"MATH C103"},
    {"ECON 104"},
    {"ECON C110"}, {"ECON C135"}, {"POLSCI C110"}, {"POLSCI C135"},
    {"ECON 119"}, {"ECON 121"},
    {"ECON C125"}, {"ECON C101"}, {"ENVECON C125"}, {"ENVECON C101"},
    {"ECON 127"}, {"ECON 131"}, {"ECON 134"}, {"ECON 136"}, {"ECON 139"},
    {"ECON 140"}, {"ECON 141"},
    {"ECON C142"}, {"ECON C131A"}, {"PUBPOL C142"}, {"PUBPOL C131A"}, {"POLSCI C142"}, {"POLSCI C131A"},
    {"ECON 143"}, {"ECON 144"},
    {"ECON C147"}, {"ECON C177"}, {"COMPSCI C147"}, {"COMPSCI C177"},
    {"ECON 148"}, {"ECON 151"}, {"ECON 152"}, {"ECON 165"}, {"ECON 172"}, {"ECON 174"},
    {"ECON C175"}, {"DEMOG C175"},
    {"ECON C184"}, {"ECON C132"}, {"ENVECON C184"}, {"ENVECON C132"},
    {"ENVECON C118"}, {"IAS C118"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [
    {"EDUC 40AC"},
    {"EDUC W161"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) education_upper_div_finder (course){
  List<Course> list [
    {"COMPSCI 194"}, {"DATA 144"},
    {"EDUC C122"}, {"EDSTEM C122"},
    {"EDUC 130"},
    {"EDUC C142"}, {"EDUC C129"}, {"GLOBAL C142"}, {"GLOBAL C129"},
    {"EDUC W153"},
    {"EDUC W161"},
    {"EDUC 161C"}, {"EDUC 168"}, {"EDUC 170"},
    {"SOCIOL 113"}, {"SOCIOL 113AC"}, {"SOCIOL 180E"},
    {"EDUC 260"}, {"EDUC 274A"}, {"EDUC 274B"}, {"EDUC 275B"}, {"EDUC 275G"}, {"EDUC 276A"}, {"EDUC 293A"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"ECON C3"}, {"ECON C1"}, {"ENVECON C3"}, {"ENVECON C1"}, {"ESPM 50AC"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) environment_resource_society_upper_div_finder (course){
  List<Course> list [
    {"ENVECON 100"},
    {"ENVECON C101"}, {"ENVECON C125"}, {"ECON C101"}, {"ECON C125"},
    {"ENVECON C102"},
    {"ENVECON C115"}, {"ENVECON C104"}, {"ESPM C115"}, {"ESPM C104"},
    {"ENVECON 141"}, {"ENVECON 142"}, {"ENVECON 145"}, {"ENVECON 147"}, {"ENVECON 153"},
    {"ENERES C100"}, {"ENERES W100"}, {"ENERES C184"}, {"ENERES W184"}, {"PUBPOL C100"}, {"PUBPOL W100"}, {"PUBPOL C184"}, {"PUBPOL W184"},
    {"ENERES 131"},
    {"ENERES C176"}, {"ENVECON C176"}, {"IAS C176"},
    {"ESPM 102C"}, {"ESPM 102D"}, {"ESPM 151"}, {"ESPM 155AC"}, {"ESPM 157"}, {"ESPM 168"}, {"ESPM 186"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"BIOLOGY 1A"}, {"BIOLOGY 1B"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) evolution_biodiversity_upper_div_finder (course){
  List<Course> list [
    {"ESPM C105"}, {"INTEGBI C105"},
    {"ESPM 108B"},
    {"ESPM C125"}, {"ESPM C148"}, {"ESPM C166"}, {"GEOG C125"}, {"GEOG C148"}, {"GEOG C166"}, {"INTEGBI C125"}, {"INTEGBI C148"}, {"INTEGBI C166"},
    {"ESPM 152"},
    {"INTEGBI C109"}, {"PLANTBI C109"},
    {"INTEGBI 113L"},
    {"INTEGBI 117"}, {"INTEGBI 117LF"},
    {"INTEGBI 141"}, {"INTEGBI 164"},
    {"INTEGBI 160"}, {"INTEGBI 167"},
    {"INTEGBI 161"}, {"INTEGBI 162"}, {"INTEGBI 169"}, {"INTEGBI 172"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [
    {"CIVENG C88"}, {"CYPLAN C88"},
    {"ESPM 72"}, {"ESPM 88A"},
    {"EPS 50"}, {"EPS 88"},
    {"GEOG 80"}, {"GEOG 88"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) geospatial_upper_div_finder (course){
  List<Course> list [
    {"GEOG 183"}, {"GEOG 185"}, {"GEOG 186"}, {"GEOG 187"},
    {"GEOG C188"}, {"LDARCH C188"},
    {"EPS 101"}, {"EPS 115"},
    {"ESPM 137"}, {"ESPM 164"},
    {"ESPM C172"}, {"CIVENG C172"},
    {"ESPM 173"},
    {"ESPM C177"}, {"LDARCH C177"},
    {"PBHLTH 177A"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"BIOLOGY 1A"}, {"BIOLOGY 1B"}, {"MCELLBI 50"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) human_population_health_upper_div_finder (course){
  List<Course> list [
    {"DEMOG 110"}, {"DEMOG 130"},
    {"INTEGBI 114"}, {"INTEGBI 116L"}, {"INTEGBI 132"}, {"INTEGBI 137"}, {"INTEGBI 140"},
    {"MCB 132"},
    {"NUSCTX 110"}, {"NUSCTX 121"}, {"NUSCTX 160"},
    {"NUSCTX C159"}, {"ESPM C159"},
    {"PBHLTH 132"}, {"PBHLTH 150A"}, {"PBHLTH 150B"}, {"PBHLTH 162A"}, {"PBHLTH 181"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"COGSCI 1"}, {"COGSCI 1B"}, {"COGSCI N1"}, {"PSYCH 1"}, {"PSYCH 2"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) human_behavior_psychology_upper_div_finder (course){
  List<Course> list [
    {"COGSCI 131"}, {"COGSCI C131"},
    {"ECON C110"}, {"ECON C135"}, {"POLSCI C110"}, {"POLSCI C135"},
    {"ECON 119"},
    {"PSYCH 101D"}, {"PSYCH 110"}, {"PSYCH 124"}, {"PSYCH 130"},
    {"PSYCH 134"}, {"PSYCH N134"},
    {"PSYCH 140"}, {"PSYCH 150"}, {"PSYCH 156"},
    {"PSYCH 160"}, {"SOCIOL 150"},
    {"PSYCH 167AC"}, {"UGBA 160"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"DATA 4AC"}, {"SOCIOL 1"}, {"SOCIOL 3AC"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) inequalities_in_society_upper_div_finder (course){
  List<Course> list [
    {"AFRICAM 101"}, {"ETH STD 101A"},
    {"AFRICAM 111"},
    {"GEOG 155"}, {"AFRICAM C155"}, {"GEOG C155"},
    {"GWS 131"}, {"PHILOS 117AC"}, {"POLSCI 132C"}, {"POLSCI 167"}, {"PSYCH 167"},
    {"PUBPOL C103"}, {"PUBPOL 117AC"}, {"SOCIOL 111AC"},
    {"SOCIOL 113"}, {"SOCIOL 113AC"},
    {"SOCIOL 124"}, {"SOCIOL 127"},
    {"SOCIOL 130"}, {"SOCIOL 130AC"},
    {"SOCIOL 131AC"}, {"SOCIOL 133"}, {"SOCIOL 180E"}, {"SOCIOL 180I"}, {"SOCIOL 182"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [
    {"PHILOS 12A"},
    {"LINGUIS 100"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) linguistic_sciences_upper_div_finder (course){
  List<Course> list [
    {"LINGUIS 100"},
    {"LINGUIS 108"}, {"LINGUIS 110"}, {"LINGUIS 111"}, {"LINGUIS 113"}, {"LINGUIS 115"},
    {"LINGUIS 120"}, {"LINGUIS 121"},
    {"LINGUIS C142"}, {"COGSCI C142"},
    {"LINGUIS 150A"},
    {"LINGUIS C160"}, {"LINGUIS C140"}, {"COGSCI C160"}, {"COGSCI C140"},
    {"LINGUIS 188"},
    {"LINGUIS C189"},
    {"INFO 159"}, {"PHILOS 133"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [
    {"NEU C61"}, {"NEU 61"}, {"MCELLBI C61"}, {"MCELLBI 61"}, {"PSYCH C61"}, {"PSYCH 61"},
    {"NEU C64"}, {"PSYCH C64"}, {"MCELLBI C64"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) neuroscience_upper_div_finder (course){
  List<Course> list [
    {"ANTHRO 107"},
    {"BIOENG C171"}, {"BIOENG C124"}, {"NEU C171"}, {"NEU C124"},
    {"COGSCI C127"}, {"PSYCH C127"},
    {"INTEGBI 139"},
    {"NEU 100A"},
    {"NEU 100B"},
    {"NEU 128"}, {"NEU 151"},
    {"NEU 165"},
    {"MCELLBI 160"}, {"MCELLBI 161"}, {"MCELLBI 165"}, {"MCELLBI 166"},
    {"PSYCH C113"}, {"PSYCH C143A"}, {"INTEGBI C113"}, {"INTEGBI C143A"},
    {"PSYCH 117"}, {"PSYCH 125"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"DATA 4AC"}, {"SOCIOL 1"}, {"SOCIOL 3AC"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) organizations_economy_upper_div_finder (course){
  List<Course> list [
    {"ECON 121"}, {"ECON 131"}, {"ENVECON 142"}, {"GEOG 110"}, {"GWS 139"},
    {"POLSCI 132C"},
    {"SOCIOL 110"}, {"SOCIOL 116"}, {"SOCIOL 119S"}, {"SOCIOL 120"}, {"SOCIOL 121"},
    {"UGBA 105"}, {"UGBA 107"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"LNS 22"}, {"MATH 55"}, {"PHILOS 4"}, {"PHILOS 5"}, {"PHILOS 12A"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) phil_foundations_evidence_upper_div_finder (course){
  List<Course> list [
    {"MATH 125A"}, {"MATH 135"}, {"MATH 136"},
    {"PHILOS 122"}, {"PHILOS 125"}, {"PHILOS 128"}, {"PHILOS 134"},
    {"PHILOS 140A"}, {"PHILOS 140B"}, {"PHILOS 142"}, {"PHILOS 143"}, {"PHILOS 146"}, {"PHILOS 148"}, {"PHILOS 149"},
    {"RHETOR 107"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"COGSCI 1"}, {"COGSCI 1B"}, {"COGSCI N1"}, {"PHILOS 2"}, {"PHILOS 3"}, {"PHILOS 14"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) phil_foundations_minds_upper_div_finder (course){
  List<Course> list [
    {"COGSCI C100"}, {"COGSCI C120"}, {"PSYCH C100"}, {"PSYCH C120"},
    {"COGSCI C101"}, {"LINGUIS C101"},
    {"COGSCI C102"}, {"COGSCI C129"}, {"PSYCH C102"}, {"PSYCH C129"},
    {"COGSCI 131"}, {"COGSCI C131"}, {"COGSCI C123"}, {"PSYCH 131"}, {"PSYCH C131"}, {"PSYCH C123"},
    {"COGSCI C142"}, {"LINGUIS C142"},
    {"ECON C110"}, {"ECON C135"}, {"POLSCI C110"}, {"POLSCI C135"},
    {"STAT 155"},
    {"PHILOS 104"}, {"PHILOS 115"}, {"PHILOS 132"}, {"PHILOS 133"}, {"PHILOS 135"}, {"PHILOS 136"}, {"PHILOS 141"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [
    {"PHYSICS 5BL"}, {"PHYSICS 5CL"},
    {"PHYSICS 77"}, {"PHYSICS 7A"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) physical_science_analytics_upper_div_finder (course){
  List<Course> list [
    {"ASTRON 120"}, {"ASTRON 121"}, {"ASTRON 128"}, {"ASTRON C161"}, {"ASTRON C162"},
    {"CIVENG C133"}, {"CIVENG C180"}, {"MECENG C133"}, {"MECENG C180"},
    {"ENGIN 150"},
    {"EPS 108"}, {"EPS 109"}, {"EPS 122"},
    {"EPS C183"}, {"EPS C170"}, {"ESPM C183"}, {"ESPM C170"},
    {"GEOG C136"}, {"GEOG C130"}, {"ESPM C136"}, {"ESPM C130"},
    {"GEOG C139"}, {"GEOG C181"}, {"EPS C139"}, {"EPS C181"},
    {"NUCENG 101"}, {"NUCENG 130"}, {"NUCENG 155"},
    {"PHYSICS 105"}, {"PHYSICS 111A"}, {"PHYSICS 112"}, {"PHYSICS 129"},
    {"PHYSICS 188"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [
    {"ECON 1"}, {"ECON 2"},
    {"SOCIOL 1"}, {"SOCIOL 3AC"}, {"SOCIOL 5"},
    {"POL SCI 3"}, {"POL SCI 88"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) quantitative_social_science_upper_div_finder (course){
  List<Course> list [
    {"DEMOG 110"},
    {"DEMOG C126"}, {"SOCIOL C126"},
    {"DEMOG 130"},
    {"DEMOG C175"}, {"ECON C175"},
    {"DEMOG 180"},
    {"ECON C110"}, {"ECON C135"}, {"ECON W135"}, {"POLSCI C110"}, {"POLSCI C135"}, {"POLSCI W135"}, {"POL SCI C110"}, {"POL SCI C135"}, {"POL SCI W135"},
    {"ENVECON C118"}, {"IAS C118"},
    {"MEDIAST 130"},
    {"POLSCI 132B"}, {"POLSCI 132C"}, {"POLSCI 133"}, {"SOCIOL 106"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"MATH 53"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) robotics_upper_div_finder (course){
  List<Course> list [
    {"BIOENG 101"}, {"BIOENG 105"},
    {"BIOENG C106A"}, {"EECS C106A"},
    {"BIOENG C106B"}, {"EECS C106B"},
    {"COMPSCI 188"}, {"EECS 149"},
    {"ELENG 143"}, {"ELENG 147"}, {"ELENG 192"},
    {"INTEGBI C135L"},
    {"MECENG 100"}, {"MECENG 102B"}, {"MECENG 119"}, {"MECENG 131"}, {"MECENG 132"},
    {"MECENG C134"}, {"MECENG C128"}, {"ELENG C134"}, {"ELENG C128"},
    {"MECENG 135"}, {"MECENG 139"}, {"MECENG 150"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"DATA 4AC"}, {"GEOG 80"}, {"HISTORY 30"}, {"ISF 60"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) sts_upper_div_finder (course){
  List<Course> list [
    {"ANTHRO 115"}, {"ANTHRO 119"}, {"ANTHRO 168"},
    {"ENGIN 157AC"}, {"IAS 157AC"},
    {"ENGLISH 180Z"},
    {"ENVECON 143"},
    {"ESPM 161"}, {"ESPM 162"},
    {"ESPM 163AC"}, {"ESPM 137AC"}, {"SOCIOL 163AC"}, {"SOCIOL 137AC"},
    {"FILM 155"},
    {"GEOG 130"}, {"GEOG N130"},
    {"GWS 130AC"},
    {"HISTORY 100S"}, {"HISTORY 100ST"},
    {"HISTORY 103S"},
    {"HISTORY 138"}, {"HISTORY 138T"},
    {"HISTORY 180"}, {"HISTORY 180T"},
    {"HISTORY 182A"}, {"HISTORY 182AT"},
    {"INFO 103"},
    {"ISF 100D"}, {"ISF 100G"},
    {"POLSCI 132C"},
    {"RHETOR 107"}, {"RHETOR 115"}, {"RHETOR 145"},
    {"SOCIOL C115"}, {"SOCIOL C155"}, {"PBHLTH C115"}, {"PBHLTH C155"},
    {"SOCIOL 166"}, {"SOCIOL 167"},
    {"STS C100"}, {"STS C182C"}, {"STS C100G"}, {"HISTORY C100"}, {"HISTORY C182C"}, {"HISTORY C100G"}, {"ISF C100"}, {"ISF C182C"}, {"ISF C100G"},
    {"UGIS 110"},
    {"AMERSTD 134"}, {"AMERSTD C134"}, {"AFRICAM 134"}, {"AFRICAM C134"},
    {"CYPLAN 101"},
    {"DATA C104"}, {"HISTORY C104"}, {"STS C104"},
    {"DIGHUM 100"},
    {"ESPM C167"}, {"ESPM C160"}, {"PBHLTH C167"}, {"PBHLTH C160"},
    {"INFO 188"},
    {"ISF 100J"},
    {"NWMEDIA 151AC"},
    {"PHILOS 121"},
    {"POLECON 159"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"DATA 4AC"}, {"SOCIOL 1"}, {"SOCIOL 3AC"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) social_welfare_health_poverty_upper_div_finder (course){
  List<Course> list [
    {"ENVECON 153"}, {"GPP 105"}, {"GPP 115"}, {"GLOBAL 102"}, {"GWS 130AC"}, {"POLSCI 132C"},
    {"PBHLTH 112"}, {"PBHLTH 126"}, {"PBHLTH 150D"}, {"PBHLTH 150E"},
    {"PBHLTH C155"}, {"PBHLTH C115"}, {"SOCIOL C155"}, {"SOCIOL C115"},
    {"PBHLTH C160"}, {"PBHLTH C167"}, {"ESPM C160"}, {"ESPM C167"},
    {"PBHLTH 181"}, {"POLECON 111"},
    {"SOCIOL 115G"}, {"SOCIOL 127"},
    {"SOC WEL 112"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"DATA 4AC"}, {"SOCIOL 1"}, {"SOCIOL 3AC"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) social_policy_law_upper_div_finder (course){
  List<Course> list [
    {"GWS 132AC"},
    {"LEGALST 100"}, {"LEGALST 102"}, {"LEGALST 122"}, {"LEGALST 123"}, {"LEGALST 158"}, {"LEGALST 160"},
    {"PBHLTH 150D"}, {"POLECON 111"},
    {"POLSCI 132C"}, {"POLSCI 186"}, {"POL SCI 132C"}, {"POL SCI 186"},
    {"PUBPOL 101"}, {"SOC WEL 112"}, {"SOC WEL 181"},
    {"SOCIOL 114"}, {"SOCIOL 148"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"CIVENG 11"}, {"LDARCH 12"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) sustainable_development_engineering_upper_div_finder (course){
  List<Course> list [
    {"ARCH 140"}, {"CIVENG 107"}, {"CIVENG 110"}, {"CIVENG 111"}, {"CIVENG 155"}, {"CIVENG 191"},
    {"ENERES 131"}, {"ENERES 190C"},
    {"GEOG 135"}, {"GEOG C135"}, {"ESPM C133"},
    {"ESPM C177"}, {"LDARCH C177"},
    {"LDARCH 122"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> list [{"CIVENG 88"}, {"ENV DES 4B"}, {"GEOG 70AC"}]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) urban_science_upper_div_finder (course){
  List<Course> list [
    {"ARCH 110AC"},
    {"CYPLAN 110"}, {"CYPLAN 113A"}, {"CYPLAN 114"}, {"CYPLAN 119"}, {"CYPLAN 140"},
    {"ENERES 131"},
    {"ENVDES 100"}, {"ENVDES 102"},
    {"GEOG 181"}, {"GEOG 182"},
    {"LDARCH 130"},
    {"LDARCH C188"}, {"GEOG C188"},
    {"LDARCH 187"}, {"SOCIOL 136"}
  ]
  boolean return one_common_course([course], list)
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
  List<Course> linalg_16ab_list [{"EECS 16A"}, {"EECS 16B"}]
  List<Course> linalg_16ab_matches filter(courses, (c) { 
    boolean return one_common_course([c], linalg_16ab_list) 
  })

  List<Course> linalg_matches if_else(has_solo_linalg, linalg_solo_matches, linalg_16ab_matches)
  NCoursesRequirement linalg {linalg_matches, if_else(not(has_solo_linalg), 2, 1), "Linear Algebra"}

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
  BooleanRequirement stat_20_engin_7_conflict {not(stat_20_substitution_invalid), "Max 1: STAT 20, ENGIN 7"}

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
  NumberRequirement cid_min_units {cid_matches, cid_units, 7, "Computational & Inferential Depth"}

  // Mutex Checks
  List<Course> mutex_matches filter(courses, ds_mutex_finder)
  BooleanRequirement mutex_check {not(greater_than(length(mutex_matches), 1)), "Max 1: EECS 126, IND ENG 173, STAT 15"}

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
  BooleanRequirement econ_140_141_check {not(and([cid_has_econ140, cid_has_econ141])), "Max 1: ECON 140, ECON 141"}

  // Total Upper Division Unit Check (Using combined finder to guarantee unique elements)
  List<Course> any_ud_matches filter(courses, any_ds_upper_div_finder)
  number total_ud_units reduce(any_ud_matches, add_course_units, 0)
  NumberRequirement upper_div_min_units {any_ud_matches, total_ud_units, 28, "Total Upper Division Units"}

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
  
  List<Requirement> return [foundations, calc1, calc2, linalg, prog_structures, data_structures, data_c100, probability, cid_min_units, modeling, human_contexts, upper_div_min_units, domain_emphasis, stat_20_engin_7_conflict, mutex_check, cs_169l_check, econ_140_141_check]
}
`;

export const APPLIED_MATH_REQ_BTLL = `
Function<NCoursesRequirement>() eval_actuarial_science (){
  List<Course> courses get_attr(this, "allCourses")
  // Pool: MATH 128B, STAT 134 or 140, STAT 135, STAT 151A, ECON 141
  List<Course> pool filter(courses, (c) {
    List<Course> cluster [{"MATH 128B"}, {"STAT 134"}, {"STAT 140"}, {"STAT 135"}, {"STAT 151A"}, {"ECON 141"}]
    boolean return one_common_course([c], cluster)
  })
  NCoursesRequirement return NCoursesRequirement(pool, 3, "Actuarial Science")
}

Function<NCoursesRequirement>() eval_classical_mechanics (){
  List<Course> courses get_attr(this, "allCourses")
  // Pool: MATH 123, 189, PHYSICS 105, MECENG 104
  List<Course> pool filter(courses, (c) {
    List<Course> cluster [{"MATH 123"}, {"MATH 189"}, {"PHYSICS 105"}, {"MECENG 104"}]
    boolean return one_common_course([c], cluster)
  })
  NCoursesRequirement return NCoursesRequirement(pool, 3, "Classical Mechanics")
}

Function<NCoursesRequirement>() eval_data_science_cluster (){
  List<Course> courses get_attr(this, "allCourses")
  // DATA C100 = STAT C100 = COMPSCI C100 (cross-listed)
  List<Course> pool filter(courses, (c) {
    List<Course> cluster [
      {"DATA C100"}, {"COMPSCI C100"}, {"STAT C100"},
      {"COMPSCI 188"}, {"COMPSCI 189"}, {"MATH 170"},
      {"STAT 133"}, {"STAT 134"}, {"STAT 140"}, {"STAT 154"}
    ]
    boolean return one_common_course([c], cluster)
  })
  NCoursesRequirement return NCoursesRequirement(pool, 3, "Data Science")
}

Function<NCoursesRequirement>() eval_economics_cluster (){
  List<Course> courses get_attr(this, "allCourses")
  // MATH C103 = ECON C103 (cross-listed)
  List<Course> pool filter(courses, (c) {
    List<Course> cluster [
      {"ECON 103"}, {"ECON 104"}, {"ECON 141"},
      {"MATH C103"}, {"ECON C103"},
      {"MATH 170"}, {"STAT 134"}, {"STAT 140"}, {"STAT 155"}
    ]
    boolean return one_common_course([c], cluster)
  })
  NCoursesRequirement return NCoursesRequirement(pool, 3, "Economics")
}

Function<AndRequirement>() eval_fluid_mechanics (){
  List<Course> courses get_attr(this, "allCourses")
  // MECENG 106 is required
  List<Course> meceng106_list [{"MECENG 106"}]
  List<boolean> meceng106_status common_course_matches(meceng106_list, courses)
  CourseListRequirement meceng106_req {meceng106_list, meceng106_status, "MECENG 106"}
  // Choose 2 from: MECENG 163, CHMENG 141, ENGIN 115, MATH 126, MATH 128B
  List<Course> elective_pool filter(courses, (c) {
    List<Course> choices [{"MECENG 163"}, {"CHMENG 141"}, {"ENGIN 115"}, {"MATH 126"}, {"MATH 128B"}]
    boolean return one_common_course([c], choices)
  })
  NCoursesRequirement elective_req {elective_pool, 2, "Electives"}
  AndRequirement return AndRequirement([meceng106_req, elective_req], "Fluid Mechanics")
}

Function<AndRequirement>() eval_geophysics (){
  List<Course> courses get_attr(this, "allCourses")
  // EPS 108 is required
  List<Course> eps108_list [{"EPS 108"}]
  List<boolean> eps108_status common_course_matches(eps108_list, courses)
  CourseListRequirement eps108_req {eps108_list, eps108_status, "EPS 108"}
  // Choose 2 from: EPS 104, 122, 130
  List<Course> elective_pool filter(courses, (c) {
    List<Course> choices [{"EPS 104"}, {"EPS 122"}, {"EPS 130"}]
    boolean return one_common_course([c], choices)
  })
  NCoursesRequirement elective_req {elective_pool, 2, "Electives"}
  AndRequirement return AndRequirement([eps108_req, elective_req], "Geophysics")
}

Function<AndRequirement>() eval_life_physical_sciences (){
  List<Course> courses get_attr(this, "allCourses")
  // All 3 required: MATH 123, 126, 128B
  List<Course> cluster_list [{"MATH 123"}, {"MATH 126"}, {"MATH 128B"}]
  List<boolean> cluster_status common_course_matches(cluster_list, courses)
  CourseListRequirement cluster_req {cluster_list, cluster_status, "MATH 123, 126, 128B"}
  AndRequirement return AndRequirement([cluster_req], "Life and Physical Sciences")
}

Function<AndRequirement>() eval_mathematical_biology (){
  List<Course> courses get_attr(this, "allCourses")
  // Required: choose 1 from COMPSCI/CMPBIO C176, MATH 127, MCELLBI 160, MCELLBI 166
  List<Course> required_pool filter(courses, (c) {
    List<Course> required [{"COMPSCI C176"}, {"CMPBIO C176"}, {"MATH 127"}, {"MCELLBI 160"}, {"MCELLBI 166"}]
    boolean return one_common_course([c], required)
  })
  NCoursesRequirement required_req {required_pool, 1, "Required"}
  // Choose 2 from: MATH 123, 126, 128B, 170, 172
  List<Course> elective_pool filter(courses, (c) {
    List<Course> choices [{"MATH 123"}, {"MATH 126"}, {"MATH 128B"}, {"MATH 170"}, {"MATH 172"}]
    boolean return one_common_course([c], choices)
  })
  NCoursesRequirement elective_req {elective_pool, 2, "Electives"}
  AndRequirement return AndRequirement([required_req, elective_req], "Mathematical Biology")
}

Function<AndRequirement>() eval_numerical_analysis (){
  List<Course> courses get_attr(this, "allCourses")
  // All 3 required: MATH 123, 126, 128B
  List<Course> cluster_list [{"MATH 123"}, {"MATH 126"}, {"MATH 128B"}]
  List<boolean> cluster_status common_course_matches(cluster_list, courses)
  CourseListRequirement cluster_req {cluster_list, cluster_status, "MATH 123, 126, 128B"}
  AndRequirement return AndRequirement([cluster_req], "Numerical Analysis")
}

Function<NCoursesRequirement>() eval_operations_research (){
  List<Course> courses get_attr(this, "allCourses")
  // Pool: STAT 134 or 140, INDENG 130, 160, 161, 162
  List<Course> pool filter(courses, (c) {
    List<Course> cluster [{"STAT 134"}, {"STAT 140"}, {"INDENG 130"}, {"INDENG 160"}, {"INDENG 161"}, {"INDENG 162"}]
    boolean return one_common_course([c], cluster)
  })
  NCoursesRequirement return NCoursesRequirement(pool, 3, "Operations Research")
}

Function<NCoursesRequirement>() eval_probability_theory (){
  List<Course> courses get_attr(this, "allCourses")
  // Pool: MATH 105, STAT 134 or 140, STAT 150
  List<Course> pool filter(courses, (c) {
    List<Course> cluster [{"MATH 105"}, {"STAT 134"}, {"STAT 140"}, {"STAT 150"}]
    boolean return one_common_course([c], cluster)
  })
  NCoursesRequirement return NCoursesRequirement(pool, 3, "Probability Theory")
}

Function<NCoursesRequirement>() eval_quantum_mechanics (){
  List<Course> courses get_attr(this, "allCourses")
  // Pool: MATH 126, 189, PHYSICS 137A, 137B
  List<Course> pool filter(courses, (c) {
    List<Course> cluster [{"MATH 126"}, {"MATH 189"}, {"PHYSICS 137A"}, {"PHYSICS 137B"}]
    boolean return one_common_course([c], cluster)
  })
  NCoursesRequirement return NCoursesRequirement(pool, 3, "Quantum Mechanics")
}

Function<AndRequirement>() eval_relativity (){
  List<Course> courses get_attr(this, "allCourses")
  // MATH 140 and PHYSICS 139 are required
  List<Course> required_list [{"MATH 140"}, {"PHYSICS 139"}]
  List<boolean> required_status common_course_matches(required_list, courses)
  CourseListRequirement required_req {required_list, required_status, "MATH 140 and PHYSICS 139"}
  // Choose 1 from: MATH 126 or MATH 141
  List<Course> elective_pool filter(courses, (c) {
    List<Course> choices [{"MATH 126"}, {"MATH 141"}]
    boolean return one_common_course([c], choices)
  })
  NCoursesRequirement elective_req {elective_pool, 1, "Elective"}
  AndRequirement return AndRequirement([required_req, elective_req], "Relativity")
}

Function<NCoursesRequirement>() eval_social_sciences (){
  List<Course> courses get_attr(this, "allCourses")
  // Pool: STAT 134 or 140, 135, 150, 151A, 151B, 153
  List<Course> pool filter(courses, (c) {
    List<Course> cluster [{"STAT 134"}, {"STAT 140"}, {"STAT 135"}, {"STAT 150"}, {"STAT 151A"}, {"STAT 151B"}, {"STAT 153"}]
    boolean return one_common_course([c], cluster)
  })
  NCoursesRequirement return NCoursesRequirement(pool, 3, "Social Sciences")
}

Function<NCoursesRequirement>() eval_statistics_cluster (){
  List<Course> courses get_attr(this, "allCourses")
  // Pool: MATH 128B, STAT 134 or 140, 135, 150, 153, 154, 155, 156
  List<Course> pool filter(courses, (c) {
    List<Course> cluster [{"MATH 128B"}, {"STAT 134"}, {"STAT 140"}, {"STAT 135"}, {"STAT 150"}, {"STAT 153"}, {"STAT 154"}, {"STAT 155"}, {"STAT 156"}]
    boolean return one_common_course([c], cluster)
  })
  NCoursesRequirement return NCoursesRequirement(pool, 3, "Statistics")
}

Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  // Lower Division

  // Calculus I: MATH 1A or MATH 51 (old numbering)
  List<Course> calc1_list [{"MATH 1A"}, {"MATH 51"}]
  List<Course> calc1_matches filter(courses, (c) {
    boolean return one_common_course([c], calc1_list)
  })
  NCoursesRequirement calc1 {calc1_matches, 1, "Calculus I"}

  // Calculus II: MATH 1B or MATH 52 (old numbering)
  List<Course> calc2_list [{"MATH 1B"}, {"MATH 52"}]
  List<Course> calc2_matches filter(courses, (c) {
    boolean return one_common_course([c], calc2_list)
  })
  NCoursesRequirement calc2 {calc2_matches, 1, "Calculus II"}

  // Multivariable Calculus: MATH 53
  List<Course> math53_list [{"MATH 53"}]
  List<boolean> math53_status common_course_matches(math53_list, courses)
  CourseListRequirement math53 {math53_list, math53_status, "Multivariable Calculus"}

  // Linear Algebra & Differential Equations: MATH 54 or MATH 56
  // TODO: change this to only accept PHYSICS 89, or EECS 16A+16B for approved double majors
  List<Course> linalg_solo_list [{"MATH 54"}, {"MATH 56"}, {"PHYSICS 89"}]
  List<Course> linalg_solo_matches filter(courses, (c) {
    boolean return one_common_course([c], linalg_solo_list)
  })
  boolean has_solo_linalg greater_than(length(linalg_solo_matches), 0)

  List<Course> linalg_16ab_list [{"EECS 16A"}, {"EECS 16B"}]
  List<Course> linalg_16ab_matches filter(courses, (c) {
    boolean return one_common_course([c], linalg_16ab_list)
  })

  List<Course> linalg_matches if_else(has_solo_linalg, linalg_solo_matches, linalg_16ab_matches)
  NCoursesRequirement linalg {linalg_matches, if_else(not(has_solo_linalg), 2, 1), "Linear Algebra"}

  // Discrete Mathematics: MATH 55
  // TODO: change this to only accept COMPSCI 70 for approved double majors
  List<Course> discrete_list [{"MATH 55"}, {"COMPSCI 70"}]
  List<Course> discrete_matches filter(courses, (c) {
    boolean return one_common_course([c], discrete_list)
  })
  NCoursesRequirement discrete {discrete_matches, 1, "Discrete Mathematics"}

  AndRequirement lower_div {[calc1, calc2, math53, linalg, discrete], "Lower Division"}

  // Upper Division Required Courses: MATH 104, 110, 113, 128A, 185
  List<Course> upper_div_req_list [{"MATH 104"}, {"MATH 110"}, {"MATH 113"}, {"MATH 128A"}, {"MATH 185"}]
  List<boolean> upper_div_req_status common_course_matches(upper_div_req_list, courses)
  CourseListRequirement upper_div_required {upper_div_req_list, upper_div_req_status, "Upper Division"}

  // Cluster Emphases: satisfy any one of the 15 approved clusters
  NCoursesRequirement de_actuarial_science eval_actuarial_science()
  NCoursesRequirement de_classical_mechanics eval_classical_mechanics()
  NCoursesRequirement de_data_science eval_data_science_cluster()
  NCoursesRequirement de_economics eval_economics_cluster()
  AndRequirement de_fluid_mechanics eval_fluid_mechanics()
  AndRequirement de_geophysics eval_geophysics()
  AndRequirement de_life_physical_sciences eval_life_physical_sciences()
  AndRequirement de_mathematical_biology eval_mathematical_biology()
  AndRequirement de_numerical_analysis eval_numerical_analysis()
  NCoursesRequirement de_operations_research eval_operations_research()
  NCoursesRequirement de_probability_theory eval_probability_theory()
  NCoursesRequirement de_quantum_mechanics eval_quantum_mechanics()
  AndRequirement de_relativity eval_relativity()
  NCoursesRequirement de_social_sciences eval_social_sciences()
  NCoursesRequirement de_statistics eval_statistics_cluster()
  OrRequirement cluster_emphasis {[de_actuarial_science, de_classical_mechanics, de_data_science, de_economics, de_fluid_mechanics, de_geophysics, de_life_physical_sciences, de_mathematical_biology, de_numerical_analysis, de_operations_research, de_probability_theory, de_quantum_mechanics, de_relativity, de_social_sciences, de_statistics], "Cluster Emphasis"}

  List<Requirement> return [lower_div, upper_div_required, cluster_emphasis]
}
`;

export const ECON_REQ_BTLL = `
Function<boolean>(Course) econ_elective_inside_finder (course){
  List<Course> list [
    {"ECON C102"}, {"ENVECON C102"},
    {"ECON C103"}, {"MATH C103"},
    {"ECON 104"}, {"ECON 105"}, {"ECON 106"},
    {"ECON C110"}, {"ECON N110"}, {"POLSCI C135"}, {"POLSCI W135"},
    {"ECON 111"}, {"ECON 113"}, {"ECON 115"},
    {"ECON 119"}, {"ECON 121"}, {"ECON 122"}, {"ECON 123"}, {"ECON 124"},
    {"ECON C125"}, {"ENVECON C101"},
    {"ECON 127"}, {"ECON 130"}, {"ECON 131"}, {"ECON 132"}, {"ECON 133"},
    {"ECON 134"}, {"ECON 135"}, {"ECON 136"}, {"ECON 137"}, {"ECON 138"}, {"ECON 139"},
    {"ECON C142"}, {"PUBPOL C142"}, {"POLSCI C131A"},
    {"ECON 143"}, {"ECON 144"}, {"ECON 145"},
    {"ECON C147"}, {"COMPSCI C177"},
    {"ECON 148"}, {"ECON 151"}, {"ECON 152"}, {"ECON 153"}, {"ECON 154"},
    {"ECON 155"}, {"ECON 155A"}, {"ECON 157"}, {"ECON 158"},
    {"ECON 161"}, {"ECON 162"}, {"ECON 165"},
    {"ECON C171"}, {"ENVECON C151"},
    {"ECON 172"}, {"ECON 173"}, {"ECON 174"},
    {"ECON C175"}, {"DEMOG C175"},
    {"ECON C181"}, {"ENVECON C181"},
    {"ECON 182"}, {"ECON 183"},
    {"ECON C184"}, {"ENVECON C132"},
    {"ECON C188"}, {"ENVECON C188"},
    {"ECON 190"}, {"ECON 191"}, {"ECON H191"}, {"ECON H195B"}, {"ECON 196"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) econ_elective_outside_finder (course){
  List<Course> list [
    {"CYPLAN 113A"}, {"CYPLAN 113B"}, {"CYPLAN 160"},
    {"ENGIN 120"}, {"INDENG 120"},
    {"ENVECON 131"}, {"ENVECON 141"}, {"ENVECON 143"}, {"ENVECON 145"},
    {"ENVECON 152"}, {"ENVECON 153"}, {"ENVECON 162"},
    {"ENVECON C176"}, {"IAS C176"}, {"ENERES C176"},
    {"GEOG 110"},
    {"HISTORY 133A"}, {"HISTORY 159A"},
    {"HISTORY C159A"}, {"POLECON C160"},
    {"HISTORY 159B"}, {"HISTORY 160"},
    {"LEGALST 142"}, {"LEGALST 145"}, {"LEGALST 147"},
    {"PHILOS 141"}, {"PUBPOL 141"},
    {"UGBA 118"}, {"UGBA 131"}, {"UGBA 132"}, {"UGBA 133"}, {"UGBA 136F"}, {"UGBA 180"}
  ]
  boolean return one_common_course([course], list)
}

Function<boolean>(Course) econ_any_elective_finder (course){
  boolean return or([econ_elective_inside_finder(course), econ_elective_outside_finder(course)])
}

Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  // Lower Division

  // Intro to Economics: ECON 1 or ECON 2
  List<Course> intro_list [{"ECON 1"}, {"ECON 2"}]
  List<Course> intro_matches filter(courses, (c) { boolean return one_common_course([c], intro_list) })
  NCoursesRequirement intro_econ {intro_matches, 1, "Intro to Economics"}

  // Calculus I: MATH 1A or 16A
  List<Course> calc1_list [{"MATH 1A"}, {"MATH 16A"}]
  List<Course> calc1_matches filter(courses, (c) { boolean return one_common_course([c], calc1_list) })
  NCoursesRequirement calc1 {calc1_matches, 1, "Calculus I"}

  // Calculus II: MATH 1B or 16B
  List<Course> calc2_list [{"MATH 1B"}, {"MATH 16B"}]
  List<Course> calc2_matches filter(courses, (c) { boolean return one_common_course([c], calc2_list) })
  NCoursesRequirement calc2 {calc2_matches, 1, "Calculus II"}

  // Statistics
  List<Course> stats_list [
    {"STAT 20"}, {"STAT 21"}, {"STAT W21"},
    {"STAT 88"}, {"DATA C88S"},
    {"DATA 89"},
    {"STAT C131A"},
    {"STAT 135"},
    {"STAT 140"}, {"STAT C140"}, {"DATA C140"}
  ]
  List<Course> stats_matches filter(courses, (c) { boolean return one_common_course([c], stats_list) })
  NCoursesRequirement stats {stats_matches, 1, "Statistics"}

  AndRequirement lower_div {[intro_econ, calc1, calc2, stats], "Lower Division"}

  // Upper Division Core

  // Microeconomics: ECON 100A or 101A
  List<Course> micro_list [{"ECON 100A"}, {"ECON 101A"}]
  List<Course> micro_matches filter(courses, (c) { boolean return one_common_course([c], micro_list) })
  NCoursesRequirement micro {micro_matches, 1, "Microeconomics"}

  // Macroeconomics: ECON 100B, 101B, or UGBA 101B
  List<Course> macro_list [{"ECON 100B"}, {"ECON 101B"}, {"UGBA 101B"}]
  List<Course> macro_matches filter(courses, (c) { boolean return one_common_course([c], macro_list) })
  NCoursesRequirement macro {macro_matches, 1, "Macroeconomics"}

  // Econometrics: ECON 140 or 141
  List<Course> metrics_list [{"ECON 140"}, {"ECON 141"}]
  List<Course> metrics_matches filter(courses, (c) { boolean return one_common_course([c], metrics_list) })
  NCoursesRequirement econometrics {metrics_matches, 1, "Econometrics"}

  AndRequirement upper_div_core {[micro, macro, econometrics], "Upper Division Core"}

  // Upper Division Electives
  List<Course> elective_inside_matches filter(courses, econ_elective_inside_finder)
  List<Course> elective_outside_matches filter(courses, econ_elective_outside_finder)
  List<Course> elective_all_matches filter(courses, econ_any_elective_finder)

  NCoursesRequirement electives {elective_all_matches, 5, "Upper Division Electives"}

  // Max 2 courses from outside the Economics Department
  BooleanRequirement outside_dept_limit {not(greater_than(length(elective_outside_matches), 2)), "Max 2: Non-Economics Courses"}

  // Mutex: CYPLAN 113B and CYPLAN 160 (only first counts)
  List<Course> cyplan_mutex_list [{"CYPLAN 113B"}, {"CYPLAN 160"}]
  List<Course> cyplan_mutex_matches filter(elective_outside_matches, (c) {
    boolean return one_common_course([c], cyplan_mutex_list)
  })
  BooleanRequirement cyplan_mutex {not(greater_than(length(cyplan_mutex_matches), 1)), "Max 1: CYPLAN 113B, CYPLAN 160"}

  // Mutex: ECON 136 and ENGIN/INDENG 120 (only first counts)
  List<Course> engin_136_mutex_list [{"ECON 136"}, {"ENGIN 120"}, {"INDENG 120"}]
  List<Course> engin_136_mutex_matches filter(elective_all_matches, (c) {
    boolean return one_common_course([c], engin_136_mutex_list)
  })
  BooleanRequirement engin_136_mutex {not(greater_than(length(engin_136_mutex_matches), 1)), "Max 1: ECON 136, ENGIN 120"}

  // Mutex: ECON 115 and HISTORY 160 (credit exclusive)
  List<Course> hist_mutex_list [{"ECON 115"}, {"HISTORY 160"}]
  List<Course> hist_mutex_matches filter(elective_all_matches, (c) {
    boolean return one_common_course([c], hist_mutex_list)
  })
  BooleanRequirement hist_mutex {not(greater_than(length(hist_mutex_matches), 1)), "Max 1: ECON 115, HISTORY 160"}

  // Mutex: ECON C181/ENVECON C181 and UGBA 118 (credit exclusive)
  List<Course> c181_mutex_list [{"ECON C181"}, {"ENVECON C181"}, {"UGBA 118"}]
  List<Course> c181_mutex_matches filter(elective_all_matches, (c) {
    boolean return one_common_course([c], c181_mutex_list)
  })
  BooleanRequirement c181_mutex {not(greater_than(length(c181_mutex_matches), 1)), "Max 1: ECON C181, UGBA 118"}

  List<Requirement> return [lower_div, upper_div_core, electives, outside_dept_limit, cyplan_mutex, engin_136_mutex, hist_mutex, c181_mutex]
}
`;

export const HAAS_REQ_BTLL = `${SEVEN_BREADTHS_BTLL}${RNC_BTLL}
Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  List<Requirement> breadth7 seven_breadths_requirements(courses)
  Requirement arts_and_lit get_element(breadth7, 0)
  Requirement biological_sciences get_element(breadth7, 1)
  Requirement historical_studies get_element(breadth7, 2)
  Requirement international_studies get_element(breadth7, 3)
  Requirement philosophy_and_values get_element(breadth7, 4)
  Requirement physical_sciences get_element(breadth7, 5)
  Requirement social_and_behavioral_sciences get_element(breadth7, 6)

  List<Requirement> rc_reqs rc_requirements(courses)
  Requirement rca get_element(rc_reqs, 0)
  Requirement rcb get_element(rc_reqs, 1)

  List<Requirement> return [arts_and_lit, biological_sciences, historical_studies, international_studies, philosophy_and_values, physical_sciences, social_and_behavioral_sciences, rca, rcb]
}
`;

export const BUSINESS_REQ_BTLL = `
Function<List<Requirement>>() main (){
  List<Course> courses get_attr(this, "allCourses")

  // Lower Division

  // UGBA 10: required at UC Berkeley
  List<Course> ugba10_list [{"UGBA 10"}, {"UGBA 10X"}]
  List<Course> ugba10_matches filter(courses, (c) { boolean return one_common_course([c], ugba10_list) })
  NCoursesRequirement ugba10 {ugba10_matches, 1, "Principles of Business"}

  // Intro Economics: ECON 1 or ECON 2
  List<Course> intro_list [{"ECON 1"}, {"ECON 2"}]
  List<Course> intro_matches filter(courses, (c) { boolean return one_common_course([c], intro_list) })
  NCoursesRequirement intro_econ {intro_matches, 1, "Intro to Economics"}

  // Statistics: approved solo course, or DATA/CS/STAT/INFO C8 + UGBA 88 / DATA C88S combo
  // Only show combo courses if both halves are present
  List<Course> stats8_list [{"COMPSCI C8"}, {"DATA C8"}, {"STAT C8"}, {"INFO C8"}]
  List<Course> ugba88_list [{"UGBA 88"}, {"DATA C88S"}]
  List<Course> stats_solo_list [
    {"STAT 20"}, {"STAT 21"}, {"STAT W21"},
    {"STAT 131A"}, {"STAT C131A"},
    {"STAT 134"},
    {"STAT 140"}, {"STAT C140"}, {"DATA C140"}
  ]
  boolean has_stats8 greater_than(length(filter(courses, (c) { boolean return one_common_course([c], stats8_list) })), 0)
  boolean has_ugba88 greater_than(length(filter(courses, (c) { boolean return one_common_course([c], ugba88_list) })), 0)
  List<Course> stats_display_matches filter(courses, (c) {
    boolean is_solo one_common_course([c], stats_solo_list)
    boolean is_stats8 one_common_course([c], stats8_list)
    boolean is_ugba88 one_common_course([c], ugba88_list)
    boolean return or([is_solo, and([is_stats8, has_ugba88]), and([is_ugba88, has_stats8])])
  })
  NCoursesRequirement stats {stats_display_matches, 1, "Statistics"}

  // Calculus: valid combo shown only when both semesters present; single courses (53/54/56) always shown
  List<Course> calc1_only_list [{"MATH 1A"}, {"MATH 16A"}]
  List<Course> calc2_only_list [{"MATH 1B"}, {"MATH 16B"}]
  List<Course> calc_single_list [{"MATH 53"}, {"MATH 54"}, {"MATH 56"}]
  boolean has_calc1 greater_than(length(filter(courses, (c) { boolean return one_common_course([c], calc1_only_list) })), 0)
  boolean has_calc2 greater_than(length(filter(courses, (c) { boolean return one_common_course([c], calc2_only_list) })), 0)
  List<Course> calc_display_matches filter(courses, (c) {
    boolean is_calc1 one_common_course([c], calc1_only_list)
    boolean is_calc2 one_common_course([c], calc2_only_list)
    boolean is_single one_common_course([c], calc_single_list)
    boolean return or([and([is_calc1, has_calc2]), and([is_calc2, has_calc1]), is_single])
  })
  NCoursesRequirement calculus {calc_display_matches, 1, "Calculus"}

  AndRequirement lower_div {[ugba10, intro_econ, stats, calculus], "Lower Division"}



  // Upper Division Core

  // UGBA 100: Business Communications
  List<Course> ugba100_list [{"UGBA 100"}]
  List<boolean> ugba100_status common_course_matches(ugba100_list, courses)
  CourseListRequirement ugba100 {ugba100_list, ugba100_status, "Business Communications"}

  // UGBA 101A: Microeconomic Analysis (or alternatives)
  List<Course> micro_list [{"UGBA 101A"}, {"ECON 100A"}, {"ECON 101A"}, {"ENVECON 100"}, {"POLECON 106"}]
  List<Course> micro_matches filter(courses, (c) { boolean return one_common_course([c], micro_list) })
  NCoursesRequirement micro {micro_matches, 1, "Microeconomic Analysis"}

  // UGBA 101B: Macroeconomic Analysis (or alternatives)
  List<Course> macro_list [{"UGBA 101B"}, {"ECON 100B"}, {"ECON 101B"}, {"POLECON 107"}]
  List<Course> macro_matches filter(courses, (c) { boolean return one_common_course([c], macro_list) })
  NCoursesRequirement macro {macro_matches, 1, "Macroeconomic Analysis"}

  // UGBA 102A: Financial Accounting
  List<Course> acctg_list [{"UGBA 102A"}]
  List<boolean> acctg_status common_course_matches(acctg_list, courses)
  CourseListRequirement acctg {acctg_list, acctg_status, "Financial Accounting"}

  // UGBA 102B: Managerial Accounting
  List<Course> mgmt_acctg_list [{"UGBA 102B"}]
  List<boolean> mgmt_acctg_status common_course_matches(mgmt_acctg_list, courses)
  CourseListRequirement mgmt_acctg {mgmt_acctg_list, mgmt_acctg_status, "Managerial Accounting"}

  // UGBA 103: Introduction to Finance
  List<Course> finance_list [{"UGBA 103"}]
  List<boolean> finance_status common_course_matches(finance_list, courses)
  CourseListRequirement finance {finance_list, finance_status, "Introduction to Finance"}

  // UGBA 104: Introduction to Business Analytics
  List<Course> analytics_list [{"UGBA 104"}]
  List<boolean> analytics_status common_course_matches(analytics_list, courses)
  CourseListRequirement analytics {analytics_list, analytics_status, "Business Analytics"}

  // UGBA 105: Leading People
  List<Course> leadership_list [{"UGBA 105"}]
  List<boolean> leadership_status common_course_matches(leadership_list, courses)
  CourseListRequirement leadership {leadership_list, leadership_status, "Leading People"}

  // UGBA 106: Marketing
  List<Course> marketing_list [{"UGBA 106"}]
  List<boolean> marketing_status common_course_matches(marketing_list, courses)
  CourseListRequirement marketing {marketing_list, marketing_status, "Marketing"}

  // UGBA 107: Social, Political, and Ethical Environment of Business
  List<Course> ethics_list [{"UGBA 107"}]
  List<boolean> ethics_status common_course_matches(ethics_list, courses)
  CourseListRequirement ethics {ethics_list, ethics_status, "Social, Political, and Ethical Environment"}

  AndRequirement upper_div_core {[ugba100, micro, macro, acctg, mgmt_acctg, finance, analytics, leadership, marketing, ethics], "Upper Division Core"}

  List<Requirement> return [lower_div, upper_div_core]
}
`;
