import { vertex } from '../../../server/vertex.js';

// https://tr3ewd3seyzofuxvf2eplb52qm0vntlk.lambda-url.us-east-1.on.aws/?siteName=khang&sitePassword=khang123

async function createSiteUrl(event, context, callback) {
  const querystring = event.queryStringParameters;
  const siteName = querystring.siteName;
  const sitePassword = querystring.sitePassword;

  const promise = new Promise((resolve, reject) => {
    vertex
      .exec('pwd', {
        out: (stdout) => {
          console.log('stdout', stdout);
        },
      })
      .exec(
        `bench new-site ${siteName} --admin-password ${sitePassword} --db-root-password ${process.env.DB_PASSWORD}`
      )
      .exec(`bench --site ${siteName} install-app erpnext`)
      .exec(
        `bench setup add-domain --site=${siteName} ${siteName}.vertex-erp.com`
      )
      .exec('yes | bench setup nginx')
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

  try {
    await promise;
    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `site ${siteName} created`,
      }),
    });
  } catch (error) {
    console.log('error', error);
    callback(null, {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message,
      }),
    });
  }
}

export const handler = createSiteUrl;
