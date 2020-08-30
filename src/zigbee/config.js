const { join } = require('path');

const dataPath = join(__dirname, 'data');

module.exports = {
    dataPath,
    stateFile: join(dataPath, 'state.json'),
};
