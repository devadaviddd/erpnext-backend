import { DynamoDB } from './dynamodb/index.js';

const dynamoDB = new DynamoDB();
export const databases = {
  dynamoDB,
}