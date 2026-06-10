const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME || 'taskflow-table';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,x-user-id',
};

exports.handler = async (event) => {
  try {
    const userId = event.headers?.['x-user-id'] || 'demo-user-001';
    const projectId = event.queryStringParameters?.projectId;

    const params = {
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':sk': 'TASK#' },
    };

    if (projectId) {
      params.FilterExpression = 'projectId = :pid';
      params.ExpressionAttributeValues[':pid'] = projectId;
    }

    const result = await client.send(new QueryCommand(params));
    const tasks = result.Items.map(({ PK, SK, ...rest }) => rest);
    return { statusCode: 200, headers, body: JSON.stringify(tasks) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
