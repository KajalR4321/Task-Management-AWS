const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({});
const BUCKET = process.env.BUCKET_NAME || 'taskflow-attachments';
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id' };

exports.handler = async (event) => {
  try {
    const userId = event.headers?.['x-user-id'] || 'demo-user-001';
    const { fileName, fileType } = JSON.parse(event.body || '{}');
    const key = `attachments/${userId}/${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: fileType });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const fileUrl = `https://${BUCKET}.s3.amazonaws.com/${key}`;
    return { statusCode: 200, headers, body: JSON.stringify({ uploadUrl, fileUrl }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
