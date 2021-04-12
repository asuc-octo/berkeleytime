const dotenv = require('dotenv');

module.exports = {
    mochaHooks: {
        beforeAll() {
            dotenv.config()
        }
    }, 

    graphql: {
        catalog: `
            query CourseJsonTest {
                allCourses {
                    edges {
                        node {
                            id
                            courseNumber
                            abbreviation
                            title  
                        }
                    }
                }
            }`,
    }
}