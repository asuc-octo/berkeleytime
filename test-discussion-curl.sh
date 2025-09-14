#!/bin/bash

# Test script for Discussion Comments using curl
# Make sure your backend server is running on the specified endpoint

GRAPHQL_ENDPOINT="http://localhost:4000/graphql"
echo "🚀 Testing Discussion Comments with curl"
echo "========================================"

# Function to make GraphQL requests with curl
make_request() {
    local query="$1"
    local variables="$2"
    
    echo "📤 Making request..."
    curl -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer YOUR_TOKEN_HERE" \
        -d "{\"query\":\"$query\",\"variables\":$variables}" \
        "$GRAPHQL_ENDPOINT"
    echo -e "\n"
}

# Test 1: Create a comment
echo "📝 Test 1: Creating a discussion comment"
create_mutation='
mutation {
  createDiscussionComment(input: {
    subject: "CS 61A"
    content: "This course is really challenging but the professors are great!"
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

# Test 2: Create another comment
echo "📝 Test 2: Creating another comment"
create_mutation2='
mutation {
  createDiscussionComment(input: {
    subject: "CS 61B"
    content: "Data structures course is well organized. Lab sections are very helpful."
  }) {
    id
    subject
    content
    createdAt
  }
}
'

make_request "$create_mutation2" "{}"

# Test 3: Query all comments (your original query)
echo "🔍 Test 3: Fetching all comments (your original query)"
query_all='
query ExampleQuery {
  discussionComments {
    id
    content
  }
}
'

make_request "$query_all" "{}"

# Test 4: Query comments with full details
echo "🔍 Test 4: Fetching all comments with full details"
query_full='
query GetAllComments {
  discussionComments {
    id
    subject
    userId
    content
    createdAt
    updatedAt
  }
}
'

make_request "$query_full" "{}"

# Test 5: Filter by subject
echo "🎯 Test 5: Filtering comments by subject"
query_filter='
query GetCommentsBySubject {
  discussionComments(filter: { subject: "CS 61A" }) {
    id
    subject
    content
    createdAt
  }
}
'

make_request "$query_filter" "{}"

# Test 6: Test pagination
echo "📄 Test 6: Testing pagination"
query_pagination='
query GetCommentsWithPagination {
  discussionComments(limit: 1, offset: 0) {
    id
    subject
    content
  }
}
'

make_request "$query_pagination" "{}"

echo "✅ All tests completed!"
echo "💡 Tip: Check the responses above to verify the functionality"
echo "🔧 Adjust the GRAPHQL_ENDPOINT variable if your server runs on a different port"
