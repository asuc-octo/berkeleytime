#!/bin/bash

# Test the exact query that the frontend uses
curl -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetDiscussionComments($filter: DiscussionCommentFilter, $limit: Int, $offset: Int) { discussionComments(filter: $filter, limit: $limit, offset: $offset) { id subject userId content createdAt updatedAt } }",
    "variables": {
      "filter": {
        "subject": "AEROENG-10-001-2025-Fall"
      },
      "limit": null,
      "offset": null
    }
  }' | jq '.'
