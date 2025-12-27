import React from 'react';

const Socials = () => {
  const social = [
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'Facebook', url: 'https://facebook.com' },
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Social Links */}
      <div>
        <h3 className="text-md text-white mb-4">Social</h3>
        <ul className="space-y-2 text-gray-300 text-xs">
          {social.map((link) => (
            <li key={link.name}>
              <a
                href={link.url}
                target="_self"
                className="hover:text-white hover:underline transition-colors"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Socials;
