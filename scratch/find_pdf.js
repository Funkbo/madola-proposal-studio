const fs = require('fs');
const path = require('path');

const dirsToSearch = [
  'C:\\Users\\shubh\\Downloads',
  'C:\\Users\\shubh\\OneDrive\\Documents',
  'C:\\Users\\shubh\\Documents',
  'C:\\Users\\shubh\\Desktop'
];

dirsToSearch.forEach(d => {
  try {
    if (fs.existsSync(d)) {
      const files = fs.readdirSync(d);
      files.forEach(f => {
        if (f.toLowerCase().includes('opensolar') || f.toLowerCase().endsWith('.pdf')) {
          console.log("Found PDF:", path.join(d, f));
        }
      });
    }
  } catch (e) {
    console.error("Error checking dir", d, e.message);
  }
});
