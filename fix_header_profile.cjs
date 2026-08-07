const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');

// Replace static state
code = code.replace(
  "  const [firstName, setFirstName] = useState('Syed');",
  "  const [firstName, setFirstName] = useState(auth.currentUser?.displayName?.split(' ')[0] || 'User');"
);
code = code.replace(
  "  const [lastName, setLastName] = useState('Irfaan');",
  "  const [lastName, setLastName] = useState(auth.currentUser?.displayName?.split(' ').slice(1).join(' ') || '');"
);
code = code.replace(
  "  const [userEmail, setUserEmail] = useState('syedirfaanx@gmail.com');",
  "  const [userEmail, setUserEmail] = useState(auth.currentUser?.email || '');"
);

// We need to fetch photoURL and render it if available.
// First, add userPhoto state
code = code.replace(
  "  const [userEmail, setUserEmail] = useState(auth.currentUser?.email || '');",
  "  const [userEmail, setUserEmail] = useState(auth.currentUser?.email || '');\n  const userPhoto = auth.currentUser?.photoURL || null;"
);

// Replace avatar rendering in dropdown trigger
const avatarTriggerOld = `<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow-inner">
                {firstName.charAt(0)}
              </div>`;
const avatarTriggerNew = `{userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 shadow-inner object-cover" />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow-inner">
                  {firstName.charAt(0)}
                </div>
              )}`;
code = code.replace(avatarTriggerOld, avatarTriggerNew);

// Replace avatar rendering in dropdown header
const avatarDropdownOld = `<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                  {firstName.charAt(0)}
                </div>`;
const avatarDropdownNew = `{userPhoto ? (
                  <img src={userPhoto} alt="Profile" className="w-10 h-10 rounded-full shadow-inner object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                    {firstName.charAt(0)}
                  </div>
                )}`;
code = code.replace(avatarDropdownOld, avatarDropdownNew);

// Replace avatar rendering in settings modal
const avatarSettingsOld = `<div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-3xl shadow-inner mb-3">
                        {firstName.charAt(0)}{lastName.charAt(0)}
                      </div>`;
const avatarSettingsNew = `{userPhoto ? (
                        <img src={userPhoto} alt="Profile" className="w-20 h-20 rounded-full shadow-inner object-cover mb-3" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-3xl shadow-inner mb-3">
                          {firstName.charAt(0)}{lastName ? lastName.charAt(0) : ''}
                        </div>
                      )}`;
code = code.replace(avatarSettingsOld, avatarSettingsNew);

fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed Header profile settings');
