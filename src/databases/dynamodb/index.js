import AWS from 'aws-sdk';


export class DynamoDB {
  #dbClient;
  #tables;
  constructor() {
    this.#dbClient = new AWS.DynamoDB.DocumentClient();

    this.#tables = {
      users: process.env.USERS_TABLE,
    }
  }

  getTable(tableName) {
    return this.#tables[tableName];
  }

  getDbClient() {
    return this.#dbClient;
  }

  async getItem(params) {
    this.#dbClient.get(params, (error, data) => {
      if (error) {
        console.error(`Unable to read item. Error JSON: ${JSON.stringify(error, null, 2)}`);
        throw new Error(error);
      } else {
        console.log(`GetItem succeeded: ${JSON.stringify(data, null, 2)}`);
      }
    }).promise();
  }

  async putItem(params) {
    await this.#dbClient.put(params,  (error) => {
      if (error) {
        console.error(`Unable to add item. Error JSON: ${JSON.stringify(error, null, 2)}`);
        throw new Error(error);
      } 
      console.log(`Added item: ${JSON.stringify(params, null, 2)}`);
    }).promise();
  }
}