import { Link } from 'react-router-dom';
import QuickLink from './quickLinks';
import Socials from './socials';
import About from './about';
import Email from './email';

const Footer = () => {
  return (
    <footer className="flex flex-col items-center bg-gray-900 text-gray-300 mt-6 pt-4 border-t border-gray-700">
      {/* Main content container */}
      <div className="w-full max-w-6xl px-4">
        {/* Three columns row */}
        <div className="flex justify-center gap-8 md:gap-16 w-full text-gray-300">
          <QuickLink />
          <Socials />
          <About />
        </div>

        {/* Email section */}
        <div className="mt-6 flex justify-center w-full text-gray-300">
          <Email />
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-6 pt-4 border-t border-gray-700 w-full text-center h-16">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-gray-400">
            ©2025 Bushishw.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
