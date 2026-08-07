const fs = require('fs');

function updateFile(filePath, replacements) {
  let code = fs.readFileSync(filePath, 'utf-8');
  for (const [oldStr, newStr] of replacements) {
    code = code.replace(oldStr, newStr);
  }
  fs.writeFileSync(filePath, code);
  console.log('Updated ' + filePath);
}

// 1. LandingPage.tsx
updateFile('./src/components/LandingPage.tsx', [
  [
    `<div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="font-bold text-white text-sm">L</span>
          </div>
          <span className="font-logo font-extrabold tracking-widest uppercase text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">
            Lifestyle OS
          </span>
        </div>`,
    `<div className="relative overflow-hidden group">
          <motion.h1 
            initial={{ backgroundPosition: '200% center' }}
            animate={{ backgroundPosition: '-200% center' }}
            transition={{ 
              repeat: Infinity, 
              duration: 8, 
              ease: "linear"
            }}
            className="text-xl sm:text-2xl font-extrabold tracking-widest uppercase select-none font-logo bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-[length:200%_auto]"
          >
            LIFESTYLE OS
          </motion.h1>
        </div>`
  ]
]);

// 2. AuthPage.tsx
updateFile('./src/components/AuthPage.tsx', [
  [
    `<div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="font-bold text-white text-xl">L</span>
          </div>
        </div>`,
    `<div className="flex justify-center mb-8">
          <div className="relative overflow-hidden group">
            <motion.h1 
              initial={{ backgroundPosition: '200% center' }}
              animate={{ backgroundPosition: '-200% center' }}
              transition={{ 
                repeat: Infinity, 
                duration: 8, 
                ease: "linear"
              }}
              className="text-xl sm:text-2xl font-extrabold tracking-widest uppercase select-none font-logo bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-[length:200%_auto]"
            >
              LIFESTYLE OS
            </motion.h1>
          </div>
        </div>`
  ]
]);

