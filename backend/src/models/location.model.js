const fs = require('fs/promises');
const path = require('path');

const locationsFilePath = path.join(__dirname, '../data/locations.json');

async function readLocations() {
  const raw = await fs.readFile(locationsFilePath, 'utf8');
  return JSON.parse(raw);
}

async function writeLocations(data) {
  await fs.writeFile(locationsFilePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

module.exports = {
  readLocations,
  writeLocations,
};
