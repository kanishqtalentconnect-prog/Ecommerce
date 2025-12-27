import React from 'react';
import { Link } from 'react-router-dom';

const QuickLink = () => {
  const quickLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Shipping Policy', path: '/shipping-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'Refund Policy', path: '/refund-policy' },
    { name: 'Contact', path: '/contact' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-md text-white mb-4">Quick Links</h3>
        <ul className="space-y-2 text-gray-300 text-xs">
          {quickLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className="hover:text-white hover:underline transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QuickLink;
