# Discussion Comments Testing Guide

This guide helps you test the discussion comments functionality that was set up for your GraphQL API.

## Files Created

1. **`test-discussion-queries.graphql`** - Collection of GraphQL queries and mutations for testing
2. **`test-discussion-script.js`** - Node.js script for automated testing
3. **`test-discussion-curl.sh`** - Bash script using curl for quick testing
4. **`DISCUSSION_TESTING.md`** - This guide

## Prerequisites

1. **Backend Server Running**: Make sure your GraphQL backend is running
2. **Database Connection**: Ensure MongoDB is connected and accessible
3. **Authentication**: If authentication is required, you'll need a valid token

## Quick Testing with GraphQL Playground

If you have GraphQL Playground or similar tool available:

1. Open your GraphQL endpoint (usually `http://localhost:4000/graphql`)
2. Use the queries from `test-discussion-queries.graphql`

### Basic Create Comment Test
```graphql
mutation CreateComment {
  createDiscussionComment(
    input: {
      subject: "CS 61A"
      content: "This course is really challenging but the professors are great!"
    }
  ) {
    id
    subject
    userId
    content
    createdAt
    updatedAt
  }
}
```

### Your Original Query Test
```graphql
query ExampleQuery {
  discussionComments {
    id
    content
  }
}
```

## Testing with Curl

Run the bash script for automated curl testing:

```bash
./test-discussion-curl.sh
```

Or manually test with curl:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createDiscussionComment(input: { subject: \"CS 61A\", content: \"Great course!\" }) { id subject content createdAt } }"
  }' \
  http://localhost:4000/graphql
```

## Testing with Node.js Script

1. Install dependencies (if not already installed):
```bash
npm install node-fetch
```

2. Run the test script:
```bash
node test-discussion-script.js
```

## API Endpoints

### Mutation: Create Discussion Comment
```graphql
mutation CreateDiscussionComment($input: CreateDiscussionCommentInput!) {
  createDiscussionComment(input: $input) {
    id
    subject
    userId
    content
    createdAt
    updatedAt
  }
}
```

**Input:**
```graphql
input CreateDiscussionCommentInput {
  subject: String!
  content: String!
}
```

### Query: Get Discussion Comments
```graphql
query GetDiscussionComments($filter: DiscussionCommentFilter, $limit: Int, $offset: Int) {
  discussionComments(filter: $filter, limit: $limit, offset: $offset) {
    id
    subject
    userId
    content
    createdAt
    updatedAt
  }
}
```

**Filter Options:**
```graphql
input DiscussionCommentFilter {
  subject: String
  userId: String
}
```

## Testing Scenarios

### 1. Create Comments
Test creating comments for different subjects:
- CS 61A
- CS 61B
- MATH 1A
- Any other subject

### 2. Query All Comments
Verify that all created comments are returned.

### 3. Filter by Subject
Test filtering comments by specific subjects.

### 4. Filter by User
Test filtering comments by user ID (requires authentication).

### 5. Pagination
Test the limit and offset parameters.

## Troubleshooting

### Common Issues

1. **Authentication Error**: 
   - Make sure you're providing a valid authentication token
   - Check if the user context is properly set up

2. **Database Connection Error**:
   - Verify MongoDB is running
   - Check database connection string

3. **GraphQL Schema Error**:
   - Ensure the discussion module is properly imported in `apps/backend/src/modules/index.ts`
   - Restart the backend server after making changes

4. **CORS Issues**:
   - If testing from a browser, ensure CORS is configured properly

### Debug Tips

1. **Check Server Logs**: Look at your backend server console for error messages
2. **Verify Schema**: Use GraphQL introspection to verify the schema includes discussion types
3. **Test Individual Components**: Test the controller, resolver, and formatter separately

## Expected Behavior

1. **Creating Comments**: Should return the created comment with generated ID and timestamps
2. **Querying Comments**: Should return all comments sorted by creation date (newest first)
3. **Filtering**: Should return only comments matching the filter criteria
4. **Pagination**: Should respect limit and offset parameters

## Next Steps

After successful testing, you can:
1. Integrate the create comment functionality into your frontend
2. Add user authentication to associate comments with users
3. Implement comment editing and deletion features
4. Add real-time updates using subscriptions
5. Implement comment moderation features

## File Locations

- **Backend Module**: `apps/backend/src/modules/discussion/`
- **Model Definition**: `packages/common/src/models/discussion.ts`
- **GraphQL Schema**: `apps/backend/src/modules/discussion/typedefs/discussion.ts`
- **Resolver**: `apps/backend/src/modules/discussion/resolver.ts`
- **Controller**: `apps/backend/src/modules/discussion/controller.ts`
