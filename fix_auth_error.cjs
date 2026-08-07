const fs = require('fs');
let code = fs.readFileSync('./src/components/AuthPage.tsx', 'utf-8');

code = code.replace(
  "      setError(err.message || 'Authentication failed');",
  "      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {\n        setError('Sign in was cancelled.');\n      } else {\n        setError(err.message || 'Authentication failed');\n      }"
);

fs.writeFileSync('./src/components/AuthPage.tsx', code);
