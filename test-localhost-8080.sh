#!/bin/bash

# Test script specifically for http://localhost:8080/api/graphql
echo "🚀 Testing Discussion Comments at http://localhost:8080/api/graphql"
echo "=================================================================="

GRAPHQL_ENDPOINT="http://localhost:8080/api/graphql"

# Function to make GraphQL requests
make_request() {
    local query="$1"
    local variables="$2"
    local auth_header="$3"
    
    echo "📤 Making request..."
    echo "Query: $query"
    echo "Variables: $variables"
    echo "Auth: $auth_header"
    echo "---"
    
    if [ -n "$auth_header" ]; then
        curl -X POST \
            -H "Content-Type: application/json" \
            -H "$auth_header" \
            -d "{\"query\":\"$query\",\"variables\":$variables}" \
            "$GRAPHQL_ENDPOINT"
    else
        curl -X POST \
            -H "Content-Type: application/json" \
            -d "{\"query\":\"$query\",\"variables\":$variables}" \
            "$GRAPHQL_ENDPOINT"
    fi
    echo -e "\n"
}

# Test 1: Check if the endpoint is accessible
echo "🔍 Test 1: Checking endpoint accessibility"
introspection_query='query IntrospectionQuery { __schema { types { name } } }'
make_request "$introspection_query" "{}"

# Test 2: Try to create a comment without authentication (should fail)
echo "📝 Test 2: Attempting to create comment without authentication (should fail)"
create_mutation='
mutation CreateComment {
  createDiscussionComment(input: {
    subject: "CS 61A"
    content: "Testing comment creation without auth"
  }) {
    id
    subject
    userId
    content
    createdAt
  }
}
'

make_request "$create_mutation" "{}"

# Test 3: Try with a dummy auth header
echo "🔐 Test 3: Attempting to create comment with dummy auth"
make_request "$create_mutation" "{}" "Authorization: Bearer dummy-token"

# Test 4: Query existing comments (should work without auth)
echo "🔍 Test 4: Querying existing comments"
query_comments='
query GetComments {
  discussionComments {
    id
    subject
    content
    userId
    createdAt
  }
}
'

make_request "$query_comments" "{}"

# Test 5: Test with specific user ID filter
echo "🎯 Test 5: Testing user filter"
query_user_filter='
query GetCommentsByUser {
  discussionComments(filter: { userId: "test-user" }) {
    id
    subject
    content
  }
}
'

make_request "$query_user_filter" "{}"

echo "✅ Tests completed!"
echo ""
echo "💡 Next steps:"
echo "1. If you have a valid auth token, replace 'dummy-token' with it"
echo "2. If authentication is not required, you may need to modify the resolver"
echo "3. Check the responses above to see what works and what doesn't"
