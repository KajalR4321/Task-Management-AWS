const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME || 'taskflow-table';
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id' };

exports.handler = async (event) => {
  try {
    const userId = event.headers?.['x-user-id'] || 'demo-user-001';
    const taskId = event.pathParameters?.taskId;
    const body = JSON.parse(event.body || '{}');
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'attachmentUrl'];
    const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
    updates.updatedAt = new Date().toISOString();
    const expParts = Object.keys(updates).map(k => `#${k} = :${k}`);
    const expNames = Object.fromEntries(Object.keys(updates).map(k => [`#${k}`, k]));
    const expValues = Object.fromEntries(Object.entries(updates).map(([k, v]) => [`:${k}`, v]));
    const result = await client.send(new UpdateCommand({ TableName: TABLE, Key: { PK: `USER#${userId}`, SK: `TASK#${taskId}` }, UpdateExpression: `SET ${expParts.join(', ')}`, ExpressionAttributeNames: expNames, ExpressionAttributeValues: expValues, ReturnValues: 'ALL_NEW' }));
    const { PK, SK, ...response } = result.Attributes;
    return { statusCode: 200, headers, body: JSON.stringify(response) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
