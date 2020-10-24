import graphene

from user.schema import Query as UserQuery
from user.schema import Mutation as UserMutation

class Query(
    UserQuery
):
    pass

class Mutation(
    UserMutation
):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
