const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');

code = code.replace(
  "import { Menu, X, Plus, LogOut, ChevronDown, Settings, CreditCard, User as UserIcon } from 'lucide-react';",
  "import { Menu, X, Plus, LogOut, ChevronDown, Settings, CreditCard, User as UserIcon } from 'lucide-react';\nimport { auth } from '../firebase';\nimport { signOut } from 'firebase/auth';"
);

code = code.replace(
  `  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem('lifestyle_os_auth');
    window.location.reload();
  };`,
  `  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await signOut(auth);
      localStorage.removeItem('lifestyle_os_auth');
    } catch (e) {
      console.error(e);
    }
  };`
);

code = code.replace(
  "const firstName = \"Sayed\";",
  `const firstName = auth.currentUser?.displayName ? auth.currentUser.displayName.split(' ')[0] : "User";`
);

fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed Header for Firebase auth');
