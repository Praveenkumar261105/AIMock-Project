import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              AI Interviewer
            </Link>
          </div>
          <div className="flex space-x-6 items-center">
            {user ? (
              <>
                <Link to="/resume-upload" className="text-gray-600 hover:text-indigo-600 font-medium">New Session</Link>
                <Link to="/history" className="text-gray-600 hover:text-indigo-600 font-medium">History</Link>
                <div className="flex items-center space-x-3 bg-indigo-50 px-3 py-1.5 rounded-full">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-indigo-700">{user.name}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;