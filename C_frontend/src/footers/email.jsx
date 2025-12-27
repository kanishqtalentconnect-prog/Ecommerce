import React, { useState } from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

const socials = [
  { name: 'Instagram', url: 'https://www.instagram.com', icon: <FaInstagram /> },
  { name: 'Facebook', url: 'https://www.facebook.com', icon: <FaFacebook /> },
];

const Email = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
      {/* Email subscription */}
      <div className="flex flex-col w-full max-w-md">
        <h3 className="text-white text-base font-medium mb-2">Subscribe to our emails</h3>
        <form onSubmit={handleSubmit} className="relative w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-600 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button type="submit" className="absolute inset-y-0 right-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>

      {/* Social icons */}
      <div className="flex space-x-4 mt-4 sm:mt-0">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white hover:scale-110 transition-transform duration-200"
            aria-label={social.name}
          >
            {React.cloneElement(social.icon, { className: 'w-6 h-6' })}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Email;
