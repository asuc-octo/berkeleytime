import { createTestClient } from "apollo-server-testing";
import { ApolloServer, gql } from "apollo-server-express";
import { buildSchema } from "../../utils";
import mongoose from "mongoose";

import { resolvers } from "../../modules";
import { TodoMongooseModel } from "../../modules/todo/model";

import {
  connect,
  clearDatabase,
  closeDatabase,
  populateDatabase,
} from "../utils";

beforeAll(async () => connect());

// You can populate de DB before each test
beforeEach(async () => {
  await populateDatabase(TodoMongooseModel, [
    {
      content: "todo 1",
    },
    {
      content: "todo 2",
    },
  ]);
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async (done) => {
  await closeDatabase();
  done();
});

/**
 * Prompt test suite.
 */
describe("Todo", () => {
  it(`should create a todo`, async () => {
    // We build the schema
    const graphQLSchema = await buildSchema();

    // We create the Apollo Server
    const server = new ApolloServer({
      schema: graphQLSchema,
    }) as any;

    // use the test server to create a query function
    const { mutate } = createTestClient(server);

    // We define the query and the variables as you would do from your front-end
    const variables = {
      createTodoData: {
        content: `Test todo.`,
      },
    };

    const CREATE_TODO = gql`
      mutation createTodo($createTodoData: NewTodoInput!) {
        createTodo(createTodoData: $createTodoData) {
          content
        }
      }
    `;

    // run query against the server and snapshot the output
    const res = await mutate({
      mutation: CREATE_TODO,
      variables,
    });

    expect(res).toMatchSnapshot();
  });

  it(`should get a todo`, async () => {
    // We generate a todo ID
    const todoId = new mongoose.Types.ObjectId().toHexString().toString();

    // Add a todo with the generated ID in the database
    await populateDatabase(TodoMongooseModel, [
      {
        _id: todoId,
        content: "todo 1",
      },
    ]);

    // We build the schema
    const graphQLSchema = await buildSchema();

    // We create the Apollo Server
    const server = new ApolloServer({
      schema: graphQLSchema,
    }) as any;

    // use the test server to create a query function
    const { query } = createTestClient(server);

    const variables = {
      id: todoId,
    };

    const GET_TODO = gql`
      query getTodo($id: ObjectId!) {
        getTodo(id: $id) {
          content
        }
      }
    `;

    // run query against the server and snapshot the output
    const res = await query({
      query: GET_TODO,
      variables,
    });

    expect(res).toMatchSnapshot();
  });
});
