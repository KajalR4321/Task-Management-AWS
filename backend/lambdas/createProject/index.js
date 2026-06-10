const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME || 'taskflow-table';
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id' };

exports.handler = async (event) => {
  try {
    const userId = event.headers?.['x-user-id'] || 'demo-user-001';
    const { name, color } = JSON.parse(event.body || '{}');
    if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: 'name required' }) };
    const projectId = uuidv4();
    const project = { PK: `USER#${userId}`, SK: `PROJECT#${projectId}`, projectId, userId, name, color: color || '#7c6af7', createdAt: new Date().toISOString() };
    await client.send(new PutCommand({ TableName: TABLE, Item: project }));
    const { PK, SK, ...response } = project;
    return { statusCode: 201, headers, body: JSON.stringify(response) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
