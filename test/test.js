// Testing module functionality
const XAPIWrapper = require('./../src/xAPIWrapper');

XAPIWrapper.changeConfig({
  "endpoint": "https://lrs.adlnet.gov/xapi/",
  "user": "aaron",
  "password": "1234"
});


const stmt = {
  'actor': {'mbox':'mailto:aaron@example.com'},
  'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
  'object': {'id': 'http://activity.com/id'}
};

const sender = async () => {
  let res = await XAPIWrapper.postStatement(stmt);
  console.log(res.resp.statusMessage);
}

sender();
