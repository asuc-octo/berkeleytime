// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/blob/9b6d4ba96e7f6be80d39d28bbb0aaba7670d04e5/apps/api/src/app/loaders/dependencyInjector.ts
export const dependencyInjector = (
  Container,
  entities: { name: string; model }[]
) => {
  try {
    entities.forEach((m) => {
      Container.set(m.name, m.model)
    })
    return true
  } catch (err) {
    throw new Error(err)
  }
}
