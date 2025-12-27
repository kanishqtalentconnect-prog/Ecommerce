import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const DropdownMenu = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: '100%', left: 0, right: 'auto' });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 192; // min-w-48 = 192px
      
      // Check if dropdown would go off-screen to the right
      if (buttonRect.left + dropdownWidth > viewportWidth) {
        // Position dropdown to the right edge of the button
        setDropdownPosition({
          top: '100%',
          left: 'auto',
          right: 0
        });
      } else {
        // Default position - left aligned
        setDropdownPosition({
          top: '100%',
          left: 0,
          right: 'auto'
        });
      }
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'static' }}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center gap-1 px-2 py-1 hover:text-amber-600 focus:outline-none whitespace-nowrap transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl min-w-48 py-2 max-h-80 overflow-y-auto"
          style={{ 
            zIndex: 9999,
            ...(() => {
              if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                return {
                  top: rect.bottom + 8, // 8px gap below button
                  left: dropdownPosition.right === 0 ? 
                    rect.right - 192 : // Right-aligned
                    rect.left,        // Left-aligned
                  minWidth: '192px'
                };
              }
              return { top: 0, left: 0 };
            })()
          }}
          role="menu"
        >
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 border-b border-gray-100 last:border-b-0 cursor-pointer"
              role="menuitem"
              onClick={handleItemClick}
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;

