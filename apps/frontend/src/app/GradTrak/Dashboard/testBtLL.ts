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
