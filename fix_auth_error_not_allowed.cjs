const fs = require('fs');
let code = fs.readFileSync('./src/components/AuthPage.tsx', 'utf-8');

code = code.replace(
  "      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {",
  "      if (err.code === 'auth/operation-not-allowed') {\n        setError('Google Sign-In is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');\n      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {"
);

fs.writeFileSync('./src/components/AuthPage.tsx', code);
