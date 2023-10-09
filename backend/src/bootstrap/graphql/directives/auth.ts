import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

const DIRECTIVE_NAME = 'auth';

// the authentication directive, a sort of middleware between your typedefs and resolvers.
// note: only supports OBJECT and FIELD_DEFINITION locations
// ie:
//    gql`directive @auth on OBJECT | FIELD_DEFINITION`
export default function authDirectiveTransformer(schema: GraphQLSchema) {
  // stores all types (Object) that has @auth
  // will be accessed in [MapperKind.OBJECT_FIELD]
  // ie:
  //    gql`type User @auth { name: String! }`
  //     ---> typeDirectiveArgumentMaps will contain "User"
  //     ---> in [MapperKind.OBJECT_FIELD], if _fieldName === "name", then typeName === "User"
  //          and so typeDirectiveArgumentMaps[typeName] === true
  const typeDirectiveArgumentMaps: Record<string, any> = {};

  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (type) => {
      const authDirective = getDirective(schema, type, DIRECTIVE_NAME)?.[0];

      if (authDirective) {
        typeDirectiveArgumentMaps[type.name] = authDirective;
      }
      return undefined;
    },
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      // check if @auth is on field or if field is of type that has @auth
      const authDirective = getDirective(schema, fieldConfig, DIRECTIVE_NAME)?.[0] ?? typeDirectiveArgumentMaps[typeName];

      // if @auth is on field or type, add a resolver to check if user is authenticated
      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = async function (_parent: any, args: any, contextValue: any, info: any) {
          if (!contextValue.user.isAuthenticated) {
            throw new Error('Not authenticated');
          }

          return resolve.call(this, _parent, args, contextValue, info);
        };
      }
      return fieldConfig;
    }
  });
}
