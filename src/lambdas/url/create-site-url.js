import { vertex } from '../../../server/vertex.js';

export const createSiteUrl = async (req, res) => {
  const queryString = req.query;
  const { siteName, sitePassword } = queryString;
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
    res.status(200).json({
      message: `site ${siteName} created`,
    });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({
      error: error.message,
    });
  }
};
