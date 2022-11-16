const { end } = require('./database');
const database = require('./database');
const storage = require('./storage');

database
  .query(`${storage.CREATE_DATABASE}`)
  .then((response) => console.log(response))
  .catch((error) => {
    console.log(error);
  })
  .finally(() => end());
