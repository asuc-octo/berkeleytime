import Ajv from "ajv"
import ajvErrors from "ajv-errors"
import addFormats from "ajv-formats"

// interface Login {
//   email: string
//   password: string
// }

// interface Register {
//   email: string
//   name: string
//   password: string
//   password_confirm: string
// }

const ajv = new Ajv({ allErrors: true, $data: true })
addFormats(ajv)
ajvErrors(ajv)

// const SchemaLogin: JSONSchemaType<Login> = {
const SchemaLogin = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
    },
    password: {
      type: "string",
    },
  },
}

const SchemaRegister = {
  type: "object",
  required: ["email", "name", "password", "password_confirm"],
  properties: {
    email: {
      type: "string",
      format: "email",
    },
    name: {
      errorMessage: "must provide a name",
      type: "string",
      minLength: 1,
    },
    password: {
      type: "string",
      minLength: 5,
    },
    password_confirm: {
      type: "string",
      errorMessage: "must be equal to constant",
      const: {
        $data:
          "1/password" /* This field must have the exact same value as password */,
      },
    },
  },
}

export const usersValidator = {
  login: ajv.compile(SchemaLogin),
  register: ajv.compile(SchemaRegister),
}
