const fs = require('fs');
const path = require('path');

function searchForFile(dir, targetName) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules' && file !== 'AppData' && file !== 'Library') {
            searchForFile(fullPath, targetName);
          }
        } else if (file.toLowerCase().includes('opensolar') || file.toLowerCase().includes('ratucoko')) {
          console.log("MATCH FOUND:", fullPath);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log("Searching for OpenSolar / Ratucoko PDF...");
searchForFile('C:\\Users\\shubh\\Downloads', 'opensolar');
searchForFile('C:\\Users\\shubh\\OneDrive', 'opensolar');
searchForFile('C:\\Users\\shubh\\Documents', 'opensolar');
searchForFile('C:\\Users\\shubh\\Desktop', 'opensolar');
