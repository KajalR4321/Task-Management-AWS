const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME || 'taskflow-table';
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id' };

exports.handler = async (event) => {
  try {
    const userId = event.headers?.['x-user-id'] || 'demo-user-001';
    const { title, description, status, priority, dueDate, projectId, attachmentUrl } = JSON.parse(event.body || '{}');
    if (!title || !projectId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'title and projectId required' }) };
    const taskId = uuidv4();
    const now = new Date().toISOString();
    const task = { PK: `USER#${userId}`, SK: `TASK#${taskId}`, taskId, userId, projectId, title, description: description || '', status: status || 'todo', priority: priority || 'medium', dueDate: dueDate || '', attachmentUrl: attachmentUrl || '', createdAt: now, updatedAt: now };
    await client.send(new PutCommand({ TableName: TABLE, Item: task }));
    const { PK, SK, ...response } = task;
    return { statusCode: 201, headers, body: JSON.stringify(response) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
