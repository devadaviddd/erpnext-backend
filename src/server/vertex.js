import fs from 'fs';
import SSH from 'simple-ssh';

const pemFile = 'vertex.pem';
const user = 'ubuntu';
const host = 'ec2-54-82-167-21.compute-1.amazonaws.com';

export const vertex = new SSH({
  host: host,
  user: user,
  key: fs.readFileSync(pemFile),
baseDir: '/home/ubuntu/frappe-bench',
});



