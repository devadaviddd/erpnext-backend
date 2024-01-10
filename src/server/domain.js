import AWS from 'aws-sdk';

// export const domain = () => {
//   const route53 = new AWS.Route53();
//   const hostedZoneId = process.env.HOSTED_ZONE_ID;
// };

class Route53Service {
  #route53;
  #hostedZoneId;
  constructor() {
    this.#route53 = new AWS.Route53();
    this.#hostedZoneId = process.env.HOSTED_ZONE_ID;
  }

  async createSubDomain(siteName) {
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'CREATE',
            ResourceRecordSet: {
              Name: `${siteName}.vertex-erp.com`,
              Type: 'A',
              TTL: 60,
              ResourceRecords: [
                {
                  Value: process.env.SERVER_IP4_ADDRESS,
                },
              ],
            },
          },
        ],
      },
      HostedZoneId: this.#hostedZoneId,
    };

    try {
      await this.#route53.changeResourceRecordSets(params).promise();
      return true;
    } catch (error) {
      console.error('Error creating Route53 record:', error);
      return false;
    }
  }

  async dropSubDomain(siteName) {
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'DELETE',
            ResourceRecordSet: {
              Name: `${siteName}.vertex-erp.com`,
              Type: 'A',
              TTL: 60,
              ResourceRecords: [
                {
                  Value: process.env.SERVER_IP4_ADDRESS,
                },
              ],
            },
          },
        ],
      },
      HostedZoneId: this.#hostedZoneId,
    };
    try {
      await this.#route53.changeResourceRecordSets(params).promise();
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }
}

const serverDomain = new Route53Service();
export default serverDomain;