const fs = require('fs');
try {
  require('./server.js');
} catch(e) {
  fs.writeFileSync('error_details.txt', e.stack);
}
