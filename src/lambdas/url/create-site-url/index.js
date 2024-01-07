import { vertex } from '../../../server/vertex.js';

// https://tr3ewd3seyzofuxvf2eplb52qm0vntlk.lambda-url.us-east-1.on.aws/?siteName=khang&sitePassword=khang123

function createSiteUrl(event, context, callback) {
  const querystring = event.queryStringParameters;
  const siteName = querystring.siteName;
  const sitePassword = querystring.sitePassword;

  const promise = new Promise((resolve, reject) => {
    vertex
      .exec('pwd', {
        out: (stdout) => {
          console.log('stdout', stdout);
        },
        err: (stderr) => {
          console.log('stderr', stderr);
          reject(stderr);
        },
      })
      .exec(
        `bench new-site ${siteName} --admin-password ${sitePassword} --db-root-password ${process.env.DB_PASSWORD}`,
        {
          err: (stderr) => {
            console.log('stderr', stderr);
            reject(stderr);
          },
        }
      )
      .exec(`bench --site ${siteName} install-app erpnext`, {
        err: (stderr) => {
          console.log('stderr', stderr);
          reject(stderr);
        },
      })
      .exec(
        `bench setup add-domain --site=${siteName} ${siteName}.vertex-erp.com`,
        {
          err: (stderr) => {
            console.log('stderr', stderr);
            reject(stderr);
          },
        }
      )
      .exec('yes | bench setup nginx', {
        err: (stderr) => {
          console.log('stderr', stderr);
          reject(stderr);
        },
      })
      .exec('sudo service nginx reload', {
        out: (stdout) => {
          console.log('stdout', stdout);
          resolve(stdout);
        },
        err: (stderr) => {
          console.log('stderr', stderr);
          reject(stderr);
        },
      })
      .start();
  });

  promise
    .then((result) => {
      console.log('result', result);
      callback({
        statusCode: 200,
        body: JSON.stringify({
          message: `site ${siteName} created successfully`,
          url: `http://${siteName}.vertex-erp.com`,
        }),
      });
    })
    .catch((error) => {
      console.log('error', error);
      callback({
        statusCode: 500,
        body: JSON.stringify({
          message: `site ${siteName} failed to create`,
          error,
        }),
      });
    });
}

export const handler = createSiteUrl;
