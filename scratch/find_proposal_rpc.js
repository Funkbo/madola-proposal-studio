const fs = require('fs');
const path = require('path');

const dir = 'supabase/migrations';
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const full = path.join(dir, f);
    const text = fs.readFileSync(full, 'utf8');
    if (text.includes('get_public_proposal') || text.includes('accept_public_proposal') || text.includes('proposals')) {
      console.log("Found in migration:", f);
    }
  });
}
