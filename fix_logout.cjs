const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');
code = code.replace(
  "  const handleLogout = () => {\n    setIsDropdownOpen(false);\n    alert('Logged out successfully');\n  };",
  "  const handleLogout = () => {\n    setIsDropdownOpen(false);\n    localStorage.removeItem('lifestyle_os_auth');\n    window.location.reload();\n  };"
);
fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed logout');
