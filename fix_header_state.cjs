const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');

code = code.replace(
  "const [phoneDigits, setPhoneDigits] = useState('1712345678');",
  "const [phoneDigits, setPhoneDigits] = useState('');"
);
code = code.replace(
  "const [gender, setGender] = useState('male');",
  "const [gender, setGender] = useState('');"
);

// Add OTP states
const otpStates = `  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);`;

code = code.replace(
  "const [passMessage, setPassMessage] = useState('');",
  `const [passMessage, setPassMessage] = useState('');\n${otpStates}`
);

// Add imports for Phone Auth
code = code.replace(
  "import { signOut } from 'firebase/auth';",
  "import { signOut, RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';"
);

fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed states');
