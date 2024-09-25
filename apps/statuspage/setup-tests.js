import express from "express";
import dotenv from "dotenv"; // future use: currently not using values from .env
import spConfig from "./config.statuspage.json";

export default {
  mochaHooks: {
    beforeAll() {
      dotenv.config();
    },
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
            }
  `,
  },
};
