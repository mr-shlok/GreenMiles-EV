import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../App';

const Sidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'Home (Map)' },
    { path: '/ev-profile', label: 'EV Profile' },
    { path: '/route-analysis', label: 'Route Analysis' },
    { path: '/charging-stations', label: 'Charging Stations' },
    { path: '/sustainability-report', label: 'Sustainability Report' },
  ];

  return (
    <div className="w-64 bg-[#0F172A] text-white min-h-screen p-4 border-r border-gray-700">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-[#22C55E]">GreenMiles</h1>
        <p className="text-sm text-gray-400">EV Intelligence</p>
      </div>

      <nav className="space-y-2 mb-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
              location.pathname === item.path
                ? 'bg-[#22C55E] text-[#0F172A] shadow-lg shadow-green-500/20'
                : 'hover:bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      
      {/* Theme Toggle */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
          <div className="relative w-12 h-6 bg-gray-600 rounded-full transition-colors">
            <div 
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                theme === 'dark' ? 'left-7' : 'left-1'
              }`}
            ></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;