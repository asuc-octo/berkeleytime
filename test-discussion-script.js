/**
 * Test script for Discussion Comments functionality
 * 
 * This script demonstrates how to:
 * 1. Create discussion comments
 * 2. Query all comments
 * 3. Filter comments by subject
 * 4. Test pagination
 * 
 * Prerequisites:
 * - Backend server must be running
 * - GraphQL endpoint should be accessible
 * - Authentication should be configured (if required)
 */

const fetch = require('node-fetch');

// Configuration
const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql'; // Adjust this to your backend URL
const TEST_USER_ID = 'test-user-123'; // Replace with actual user ID

// Helper function to make GraphQL requests
async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    return null;
  }
}

// Test data
const testComments = [
  {
    subject: "CS 61A",
    content: "This course is really challenging but the professors are great! The SICP textbook is excellent."
  },
  {
    subject: "CS 61B", 
    content: "Data structures course is well organized. Lab sections are very helpful for understanding the material."
  },
  {
    subject: "CS 61A",
    content: "Office hours are super helpful. Go early in the semester before they get crowded!"
  },
  {
    subject: "MATH 1A",
    content: "Calculus course with good explanations. Practice problems are essential for success."
  },
  {
    subject: "CS 61A",
    content: "The midterm was tough but fair. Study the practice exams thoroughly!"
  }
];

// Test functions
async function testCreateComment(comment) {
  console.log(`\n🧪 Creating comment for subject: ${comment.subject}`);
  
  const mutation = `
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
  `;

  const result = await graphqlRequest(mutation, { input: comment });
  
  if (result) {
    console.log('✅ Comment created successfully:', result.createDiscussionComment);
    return result.createDiscussionComment;
  } else {
    console.log('❌ Failed to create comment');
    return null;
  }
}

async function testGetAllComments() {
  console.log('\n🔍 Fetching all discussion comments...');
  
  const query = `
    query GetAllComments {
      discussionComments {
        id
        subject
        content
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest(query);
  
  if (result) {
    console.log(`✅ Found ${result.discussionComments.length} comments:`);
    result.discussionComments.forEach((comment, index) => {
      console.log(`  ${index + 1}. [${comment.subject}] ${comment.content.substring(0, 50)}...`);
    });
    return result.discussionComments;
  } else {
    console.log('❌ Failed to fetch comments');
    return [];
  }
}

async function testGetCommentsBySubject(subject) {
  console.log(`\n🔍 Fetching comments for subject: ${subject}`);
  
  const query = `
    query GetCommentsBySubject($filter: DiscussionCommentFilter) {
      discussionComments(filter: $filter) {
        id
        subject
        content
        createdAt
      }
    }
  `;

  const result = await graphqlRequest(query, { 
    filter: { subject } 
  });
  
  if (result) {
    console.log(`✅ Found ${result.discussionComments.length} comments for ${subject}:`);
    result.discussionComments.forEach((comment, index) => {
      console.log(`  ${index + 1}. ${comment.content.substring(0, 60)}...`);
    });
    return result.discussionComments;
  } else {
    console.log('❌ Failed to fetch comments by subject');
    return [];
  }
}

async function testPagination() {
  console.log('\n📄 Testing pagination...');
  
  const query = `
    query GetCommentsWithPagination($limit: Int, $offset: Int) {
      discussionComments(limit: $limit, offset: $offset) {
        id
        subject
        content
        createdAt
      }
    }
  `;

  // Test first page
  const page1 = await graphqlRequest(query, { limit: 2, offset: 0 });
  if (page1) {
    console.log(`✅ Page 1 (limit: 2, offset: 0): ${page1.discussionComments.length} comments`);
  }

  // Test second page
  const page2 = await graphqlRequest(query, { limit: 2, offset: 2 });
  if (page2) {
    console.log(`✅ Page 2 (limit: 2, offset: 2): ${page2.discussionComments.length} comments`);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Discussion Comments Tests');
  console.log('=====================================');

  try {
    // Test 1: Create multiple comments
    console.log('\n📝 Test 1: Creating test comments...');
    const createdComments = [];
    for (const comment of testComments) {
      const created = await testCreateComment(comment);
      if (created) {
        createdComments.push(created);
      }
    }

    // Test 2: Get all comments
    console.log('\n📋 Test 2: Fetching all comments...');
    const allComments = await testGetAllComments();

    // Test 3: Get comments by subject
    console.log('\n🎯 Test 3: Testing subject filtering...');
    await testGetCommentsBySubject("CS 61A");
    await testGetCommentsBySubject("CS 61B");

    // Test 4: Test pagination
    console.log('\n📄 Test 4: Testing pagination...');
    await testPagination();

    console.log('\n✅ All tests completed!');
    console.log(`📊 Summary: Created ${createdComments.length} comments, Total comments in DB: ${allComments.length}`);

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Example usage for your original query
async function testOriginalQuery() {
  console.log('\n🎯 Testing your original query...');
  
  const query = `
    query ExampleQuery {
      discussionComments {
        id
        content
      }
    }
  `;

  const result = await graphqlRequest(query);
  
  if (result) {
    console.log('✅ Original query successful:');
    result.discussionComments.forEach((comment, index) => {
      console.log(`  ${index + 1}. ID: ${comment.id}, Content: ${comment.content.substring(0, 40)}...`);
    });
  } else {
    console.log('❌ Original query failed');
  }
}

// Export functions for individual testing
module.exports = {
  runTests,
  testCreateComment,
  testGetAllComments,
  testGetCommentsBySubject,
  testPagination,
  testOriginalQuery,
  graphqlRequest
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests()
    .then(() => testOriginalQuery())
    .then(() => {
      console.log('\n🎉 All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}
