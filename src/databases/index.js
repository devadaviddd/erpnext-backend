import { DynamoDB } from './dynamodb/index.js';

const dynamoDB = new DynamoDB();
console.log('dynamoDB: ', dynamoDB.getDbClient());
export const databases = {
  dynamoDB,
}