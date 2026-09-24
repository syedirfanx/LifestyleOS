import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full mt-auto">
      {/* Separate line above */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full border-t border-slate-800/60" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
        <div>
          <span>&copy; {currentYear} Lifestyle OS. All rights reserved.</span>
        </div>
        <div>
          <span>
            Made by{' '}
            <a
              href="https://syedirfan.co.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-200 hover:text-white font-medium underline underline-offset-4 transition-colors"
            >
              Syed Irfan
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};
