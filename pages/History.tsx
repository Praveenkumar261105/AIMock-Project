
import React, { useEffect, useState } from 'react';
import { interviewApi } from '../api';
import { HistoryItem } from '../types';

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await interviewApi.getHistory();
        setHistory(response.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Interview History</h2>
      {history.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center border border-gray-100">
          <div className="text-gray-400 text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-600">No interviews yet</h3>
          <p className="text-gray-500 mt-2">Start your first mock interview to see results here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-sm text-gray-500 font-medium">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.rating >= 8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    Rating: {item.rating}/10
                  </span>
                </div>
                <p className="text-gray-700 mb-3 line-clamp-2">{item.feedback}</p>
                <div className="flex flex-wrap gap-2">
                  {item.job_suggestions.map((job, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-semibold">
                      {job}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6">
                <button className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center">
                  View Full Result
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
