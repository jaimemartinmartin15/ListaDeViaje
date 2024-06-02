/**
 * https://github.com/parcel-bundler/parcel/discussions/5271
 *
 * This script is created to adapt the meta tags with "og:image" and "twitter:image" names.
 * These tags need to have absolute url (included origin) to work.
 * Because of this, Parcel is not able to replace the favicon names with the generated hashed ones.
 *
 * This script adapts these tags by replacing the reference with the new location and hashed name.
 */

const fs = require('fs');

const DIST_FOLDER = './dist';
const DIST_INDEX_HTML_PATH = `${DIST_FOLDER}/index.html`;
const ORIGINAL_FAV_ICON_NAME = 'favicons/favicon-maskable-192x192.png';

// find the new favicon name for favicon-192x192.png
const distFiles = fs.readdirSync(DIST_FOLDER);
const newNameFavIcon192 = distFiles.find((f) => f.match(/favicon\-maskable\-192x192\..*\.png/));

if (!newNameFavIcon192) {
  console.error(`New file name for ${ORIGINAL_FAV_ICON_NAME} was not found.`);
  return 1;
}

console.log(); // print empty line
console.log(`${ORIGINAL_FAV_ICON_NAME} was renamed to ${newNameFavIcon192}`);

// read produced index.html by Parcel
let htmlFile = fs.readFileSync(DIST_INDEX_HTML_PATH, 'utf8');

// replace the favicon name
const fixedHtml = htmlFile.replaceAll(`${ORIGINAL_FAV_ICON_NAME}`, newNameFavIcon192);

console.log('Favicon names replaced.');

// rewrite the index.html to push to the server
fs.writeFileSync(DIST_INDEX_HTML_PATH, fixedHtml, 'utf8');

console.log('index.html file fixed.');
console.log(); // print empty line
