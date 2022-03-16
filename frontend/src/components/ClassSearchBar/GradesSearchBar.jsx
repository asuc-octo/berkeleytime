import _ from "lodash";
import hash from "object-hash";
import React, { Component } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";
import Select from "react-select-virtualized";
import { reactSelectCourseSearch } from "utils/courses/search";

import { fetchGradeSelected } from "../../redux/actions";

const sortOptions = [
  { value: "instructor", label: "By Instructor" },
  { value: "semester", label: "By Semester" },
];
class GradesSearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedClass: 0,
      selectType: "instructor",
      selectPrimary: props.selectPrimary,
      selectSecondary: props.selectSecondary,
    };

    this.queryCache = {};

    this.handleClassSelect = this.handleClassSelect.bind(this);
    this.handleSortSelect = this.handleSortSelect.bind(this);
    this.handlePrimarySelect = this.handlePrimarySelect.bind(this);
    this.handleSecondarySelect = this.handleSecondarySelect.bind(this);
    this.buildCoursesOptions = this.buildCoursesOptions.bind(this);
    this.buildPrimaryOptions = this.buildPrimaryOptions.bind(this);
    this.buildSecondaryOptions = this.buildSecondaryOptions.bind(this);
    this.getFilteredSections = this.getFilteredSections.bind(this);
    this.addSelected = this.addSelected.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    const { fromCatalog } = this.props;
    this.setState({
      selectType: "instructor",
    });
    if (fromCatalog) {
      this.handleClassSelect({ value: fromCatalog.id, addSelected: true });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectPrimary !== this.state.selectPrimary) {
      this.setState({
        selectPrimary: nextProps.selectPrimary,
      });
    }
    if (nextProps.selectSecondary !== this.state.selectSecondary) {
      this.setState({
        selectSecondary: nextProps.selectSecondary,
      });
    }
  }

  handleClassSelect(updatedClass) {
    const { fetchGradeSelected } = this.props;
    if (updatedClass === null) {
      this.reset();
      this.setState({
        selectedClass: 0,
        selectPrimary: "",
        selectSecondary: "",
      });
      return;
    }
    this.setState({
      selectedClass: updatedClass.label,
    });
    fetchGradeSelected(updatedClass.label);
  }

  handleSortSelect(sortBy) {
    this.setState({
      selectType: sortBy.value,
      selectPrimary: "",
      selectSecondary: "",
    });
  }

  handlePrimarySelect(primary) {
    const { sis_classes } = this.props;
    const { selectType } = this.state;
    const secondaryOptions = this.buildSecondaryOptions(
      sis_classes,
      selectType,
      primary.value
    );
    this.setState({
      selectPrimary: primary ? primary.value : "",
      selectSecondary:
        secondaryOptions.length === 1 ? secondaryOptions[0].value : "all",
    });
  }

  handleSecondarySelect(secondary) {
    this.setState({
      selectSecondary: secondary ? secondary.value : "",
    });
  }

  buildCoursesOptions(courses) {
    if (!courses) {
      return [];
    }

    const options = courses.map((course) => ({
      value: course,
      label: course,
    }));

    return options;
  }

  buildPrimaryOptions(sis_classes, selectType) {
    let ret = [];
    const set = new Set();
    switch (selectType) {
      case "instructor":
        for (const sis_class of sis_classes) {
          for (const sis_section of sis_class._sections) {
            for (const calanswers_grade of sis_section._grades) {
              for (const instructorName of calanswers_grade.InstructorName) {
                if (!set.has(instructorName)) {
                  set.add(instructorName);
                  ret.push({
                    value: instructorName,
                    label: instructorName,
                  });
                }
              }
            }
          }
        }
        ret = _.chain(ret)
          .filter((o) => o.value != "-")
          .orderBy([(o) => o.label]);
        break;
      case "semester":
        for (const sis_class of sis_classes) {
          for (const sis_section of sis_class._sections) {
            for (const calanswers_grade of sis_section._grades) {
              const term = `${calanswers_grade.term.year} ${calanswers_grade.term.semester}`;
              if (!set.has(term)) {
                set.add(term);
                ret.push({
                  value: term,
                  label: term,
                  calanswers_grade,
                });
              }
            }
          }
        }
        ret = _.orderBy(
          ret,
          [
            (o) => o.calanswers_grade.term.year,
            (o) => o.calanswers_grade.term.month,
          ],
          ["desc", "desc"]
        );
        break;
    }
    return [
      selectType == "instructor"
        ? { value: "all", label: "All Instructors" }
        : { value: "all", label: "All Semesters" },
      ...ret,
    ];
  }

  buildSecondaryOptions(sis_classes, selectType, selectPrimary) {
    let ret = [];
    const set = new Set();
    switch (selectType) {
      case "instructor":
        switch (selectPrimary) {
          case "all":
            for (const sis_class of sis_classes) {
              for (const sis_section of sis_class._sections) {
                for (const calanswers_grade of sis_section._grades) {
                  if (!set.has(sis_section.displayName)) {
                    set.add(sis_section.displayName);
                    ret.push({
                      value: sis_section.displayName,
                      label: sis_section.displayName,
                      sis_class,
                      sis_section,
                      calanswers_grade,
                    });
                  }
                }
              }
            }
            ret = _.orderBy(
              ret,
              [
                (o) => o.calanswers_grade.term.year,
                (o) => o.calanswers_grade.term.month,
                (o) => o.sis_class.displayName,
              ],
              ["desc", "desc", "asc"]
            );
            break;
          default:
            for (const sis_class of sis_classes) {
              for (const sis_section of sis_class._sections) {
                for (const calanswers_grade of sis_section._grades) {
                  if (calanswers_grade.InstructorName.includes(selectPrimary)) {
                    if (!set.has(sis_section.displayName)) {
                      set.add(sis_section.displayName);
                      ret.push({
                        value: sis_section.displayName,
                        label: sis_section.displayName,
                        sis_class,
                        sis_section,
                        calanswers_grade,
                      });
                    }
                  }
                }
              }
            }
            ret = _.orderBy(
              ret,
              [
                (o) => o.calanswers_grade.term.year,
                (o) => o.calanswers_grade.term.month,
                (o) => o.sis_class.displayName,
              ],
              ["desc", "desc", "asc"]
            );
            break;
        }
        break;
      case "semester":
        switch (selectPrimary) {
          case "all":
            for (const sis_class of sis_classes) {
              for (const sis_section of sis_class._sections) {
                for (const calanswers_grade of sis_section._grades) {
                  for (const instructorName of calanswers_grade.InstructorName) {
                    if (!set.has(instructorName)) {
                      set.add(instructorName);
                      ret.push({
                        value: instructorName,
                        label: instructorName,
                        sis_class,
                        sis_section,
                        calanswers_grade,
                      });
                    }
                  }
                }
              }
            }
            ret = _.chain(ret)
              .filter((o) => o.value != "-")
              .orderBy([(o) => o.label]);
            break;
          default:
            for (const sis_class of sis_classes) {
              for (const sis_section of sis_class._sections) {
                for (const calanswers_grade of sis_section._grades) {
                  for (const instructorName of calanswers_grade.InstructorName) {
                    if (
                      selectPrimary ==
                      `${calanswers_grade.term.year} ${calanswers_grade.term.semester}`
                    ) {
                      if (!set.has(instructorName)) {
                        set.add(instructorName);
                        ret.push({
                          value: instructorName,
                          label: instructorName,
                          sis_class,
                          sis_section,
                          calanswers_grade,
                        });
                      }
                    }
                  }
                }
              }
            }
            ret = _.chain(ret)
              .filter((o) => o.value != "-")
              .orderBy([(o) => o.label]);
            break;
        }
    }
    return [
      selectType == "instructor"
        ? { value: "all", label: "All Instructors" }
        : { value: "all", label: "All Semesters" },
      ...ret,
    ];
  }

  getFilteredSections() {
    const { selectType, selectPrimary, selectSecondary } = this.state;
    const { sis_classes } = this.props;
    let semester = selectSecondary;
    let number = -1;
    if (selectSecondary.split(" ").length > 2) {
      semester = selectSecondary.split(" ").slice(0, 2).join(" ");
      number = selectSecondary.split(" ")[3];
    }
    let ret;

    if (selectType === "instructor") {
      ret = sis_classes
        .filter((section) =>
          selectPrimary === "all" ? true : section.instructor === selectPrimary
        )
        .filter((section) =>
          semester === "all"
            ? true
            : this.getSectionSemester(section) === semester
        )
        .filter((section) =>
          number !== -1 ? section.section_number === number : true
        );
    } else {
      ret = sis_classes
        .filter((section) =>
          selectPrimary === "all"
            ? true
            : this.getSectionSemester(section) === selectPrimary
        )
        .filter((section) =>
          semester === "all" ? true : section.instructor === semester
        )
        .filter((section) =>
          number !== -1 ? section.section_number === number : true
        );
    }

    ret = ret.map((s) => s.grade_id);
    return ret;
  }

  addSelected() {
    const { selectedClass, selectType, selectPrimary, selectSecondary } =
      this.state;

    const playlist = {
      courseID: selectedClass,
      instructor: selectType === "instructor" ? selectPrimary : selectSecondary,
      semester: selectType === "semester" ? selectPrimary : selectSecondary,
      sis_classes: this.getFilteredSections(),
    };

    playlist.id = hash(playlist);
    this.props.addCourse(playlist);
    this.reset();
  }

  reset() {
    this.setState({
      selectPrimary: "",
      selectSecondary: "",
    });
  }

  render() {
    const { classes, isFull, isMobile, sis_classes } = this.props;
    const { selectType, selectPrimary, selectSecondary, selectedClass } =
      this.state;
    const primaryOptions = this.buildPrimaryOptions(sis_classes, selectType);
    const secondaryOptions = this.buildSecondaryOptions(
      sis_classes,
      selectType,
      selectPrimary
    );
    const onePrimaryOption =
      primaryOptions && primaryOptions.length === 1 && selectPrimary;
    const oneSecondaryOption =
      secondaryOptions && secondaryOptions.length === 1 && selectSecondary;
    let primaryOption;
    let secondaryOption;

    switch (selectType) {
      case "instructor":
        switch (selectPrimary) {
          case "":
            primaryOption = "";
            break;
          case "all":
            primaryOption = { value: "all", label: "All Instructors" };
            break;
          default:
            primaryOption = { value: selectPrimary, label: selectPrimary };
            break;
        }
        switch (selectSecondary) {
          case "":
            secondaryOption = "";
            break;
          case "all":
            secondaryOption = { value: "all", label: "All Semesters" };
            break;
          default:
            secondaryOption = {
              value: selectSecondary,
              label: selectSecondary,
            };
            break;
        }
        break;
      case "semester":
        switch (selectPrimary) {
          case "":
            primaryOption = "";
            break;
          case "all":
            primaryOption = { value: "all", label: "All Semesters" };
            break;
          default:
            primaryOption = { value: selectPrimary, label: selectPrimary };
            break;
        }
        switch (selectSecondary) {
          case "":
            secondaryOption = "";
            break;
          case "all":
            secondaryOption = { value: "all", label: "All Instructors" };
            break;
          default:
            secondaryOption = {
              value: selectSecondary,
              label: selectSecondary,
            };
            break;
        }
        break;
    }
    const customStyles = {
      clearIndicator: (provided, state) => ({
        ...provided,
        marginRight: 0,
        paddingRight: 0,
      }),
    };

    return (
      <Container fluid className="grades-search-bar">
        <Row style={{ marginBottom: 10 }}>
          <Col lg={3}>
            <Select
              name="selectClass"
              placeholder="Choose a class..."
              options={this.buildCoursesOptions(classes)}
              onChange={this.handleClassSelect}
              filterOption={reactSelectCourseSearch}
              components={{
                IndicatorSeparator: () => null,
              }}
              styles={customStyles}
            />
          </Col>
          <Col lg={2}>
            <Select
              name="sortBy"
              value={
                selectType === "instructor" ? sortOptions[0] : sortOptions[1]
              }
              placeholder="Sort by"
              options={sortOptions}
              isClearable={false}
              onChange={this.handleSortSelect}
              isDisabled={!selectedClass}
              components={{
                IndicatorSeparator: () => null,
              }}
              styles={customStyles}
            />
          </Col>
          <Col xs={6} sm={6} lg={3}>
            <Select
              name="instrSems"
              placeholder={!isMobile ? "Select an option..." : "Select..."}
              value={onePrimaryOption ? primaryOptions[0] : primaryOption}
              options={primaryOptions}
              onChange={this.handlePrimarySelect}
              isDisabled={!selectedClass}
              isClearable={false}
              searchable={false}
              components={{
                IndicatorSeparator: () => null,
              }}
              styles={customStyles}
            />
          </Col>
          <Col xs={6} sm={6} lg={3}>
            <Select
              name="section"
              placeholder={!isMobile ? "Select an option..." : "Select..."}
              value={oneSecondaryOption ? secondaryOptions[0] : secondaryOption}
              options={secondaryOptions}
              onChange={this.handleSecondarySelect}
              isDisabled={!selectedClass}
              isClearable={false}
              searchable={false}
              components={{
                IndicatorSeparator: () => null,
              }}
              styles={customStyles}
            />
          </Col>
          <Col xs={12} sm={12} lg={1}>
            <Button
              onClick={this.addSelected}
              disabled={
                !selectedClass || !(selectPrimary && selectSecondary) || isFull
              }
            >
              Add Class
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  fetchGradeSelected: (selectedClass) =>
    dispatch(fetchGradeSelected(selectedClass)),
});

const mapStateToProps = (state) => {
  const { sis_classes, selectPrimary, selectSecondary } = state.grade;
  return {
    sis_classes,
    selectPrimary,
    selectSecondary,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GradesSearchBar);
