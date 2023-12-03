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

  async queryItems(params) {
    const res = this.#dbClient.query(params, (error, data) => {
      if (error) {
        console.error(`Unable to query. Error JSON: ${JSON.stringify(error, null, 2)}`);
        throw new Error(error);
      } else {
        console.log(`Query succeeded: ${JSON.stringify(data, null, 2)}`);
      }
    }).promise();
    return res;
  }

  async putItem(params) {
    await this.#dbClient.put(params, (error) => {
      if (error) {
        console.error(`Unable to add item. Error JSON: ${JSON.stringify(error, null, 2)}`);
        throw new Error(error);
      }
      console.log(`Added item: ${JSON.stringify(params, null, 2)}`);
    }).promise();
  }

  async batchUpdate(batchUpdateParams, tableName) {
    const chunkSize = 25;
    const data = [];
    for (let i = 0; i < batchUpdateParams.length; i += chunkSize) {
      const chunk = batchUpdateParams.slice(i, i + chunkSize);
      const params = {
        RequestItems: {
          [tableName]: chunk,
        }
      }
      const batch = await this.#dbClient.batchWrite(params, (error) => {
        if (error) {
          console.error(`Unable to batch update. Error JSON: ${JSON.stringify(error, null, 2)}`);
          throw new Error(error);
        }
        console.log(`Batch update: ${JSON.stringify(chunk, null, 2)}`);
      }).promise();
      data.push(batch);
    }
    return data;
  }
}