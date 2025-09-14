// Simple test script to verify GraphQL endpoint
const fetch = require('node-fetch');

const GRAPHQL_ENDPOINT = 'http://localhost:8080/api/graphql';

async function testEndpoint() {
  console.log('🧪 Testing GraphQL endpoint...');
  
  // Test 1: Simple introspection
  console.log('\n1. Testing introspection...');
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query { __schema { types { name } } }'
      })
    });
    
    const data = await response.json();
    console.log('✅ Introspection successful');
    console.log('Available types:', data.data.__schema.types.map(t => t.name).filter(name => 
      name.includes('Discussion') || name.includes('Comment')
    ));
  } catch (error) {
    console.error('❌ Introspection failed:', error.message);
  }

  // Test 2: Try to create a comment
  console.log('\n2. Testing create comment...');
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation {
            createDiscussionComment(input: {
              subject: "Test Subject"
              content: "Test content"
            }) {
              id
              subject
              content
            }
          }
        `
      })
    });
    
    const data = await response.json();
    if (data.errors) {
      console.log('❌ Create comment failed:', data.errors[0].message);
    } else {
      console.log('✅ Create comment successful:', data.data.createDiscussionComment);
    }
  } catch (error) {
    console.error('❌ Create comment request failed:', error.message);
  }

  // Test 3: Try to query comments
  console.log('\n3. Testing query comments...');
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            discussionComments {
              id
              subject
              content
            }
          }
        `
      })
    });
    
    const data = await response.json();
    if (data.errors) {
      console.log('❌ Query comments failed:', data.errors[0].message);
    } else {
      console.log('✅ Query comments successful:', data.data.discussionComments);
    }
  } catch (error) {
    console.error('❌ Query comments request failed:', error.message);
  }
}

testEndpoint();
