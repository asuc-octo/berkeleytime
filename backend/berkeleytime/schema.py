import graphene

from catalog.schema import Query as CatalogQuery
from enrollment.schema import Query as EnrollmentQuery
from forms.schema import Query as FormsQuery
from grades.schema import Query as GradesQuery
from playlist.schema import Query as PlaylistQuery
from user.schema import Query as UserQuery
from user.schema import Mutation as UserMutation
from scheduler.schema import Query as SchedulerQuery
from scheduler.schema import Mutation as SchedulerMutation

class Query(
    CatalogQuery, EnrollmentQuery, FormsQuery,
    GradesQuery, PlaylistQuery, UserQuery, SchedulerQuery
):
    pass

class Mutation(
    UserMutation, SchedulerMutation
):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
