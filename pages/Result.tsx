
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { InterviewResult } from '../types';

const Result: React.FC = () => {
  const location = useLocation();
  const result = location.state?.result as InterviewResult;

  if (!result) {
    return <Navigate to="/history" />;
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 bg-green-50';
    if (rating >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Interview Feedback</h2>
          <div className={`inline-block px-6 py-3 rounded-2xl text-3xl font-bold ${getRatingColor(result.rating)}`}>
            Rating: {result.rating} / 10
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>
              Strengths
            </h3>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">{s}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-8 bg-red-500 rounded-full mr-3"></span>
              Weaknesses
            </h3>
            <ul className="space-y-2">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">{w}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mb-10 bg-indigo-50 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">Actionable Suggestions</h3>
          <ul className="space-y-3">
            {result.suggestions.map((s, i) => (
              <li key={i} className="text-indigo-800 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Job Roles</h3>
          <div className="flex flex-wrap gap-2">
            {result.recommended_roles.map((r, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-medium">
                {r}
              </span>
            ))}
          </div>
        </section>

        <div className="flex justify-center space-x-4">
          <Link to="/interview" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
            Retake Interview
          </Link>
          <Link to="/history" className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
            View History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Result;
