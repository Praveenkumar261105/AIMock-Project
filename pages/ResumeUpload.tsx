import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewApi, BASE_URL } from '../api';

const ResumeUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnectionError, setIsConnectionError] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        return;
      }
      setFile(selected);
      setError('');
      setIsConnectionError(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a resume first.');
      return;
    }
    
    setLoading(true);
    setError('');
    setIsConnectionError(false);
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      await interviewApi.uploadResume(formData);
      navigate('/interview');
    } catch (err: any) {
      console.error("Upload Error:", err);
      if (!err.response && (err.code === "ERR_NETWORK" || err.message.includes("Network Error"))) {
        setIsConnectionError(true);
      } else {
        setError(err.response?.data?.detail || "Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyRepairScript = () => {
    const script = `import os
import sys

# This script creates the basic structure for you
files = {
    "run_server.py": """import uvicorn
import os
import sys

def main():
    folders = ["app", "uploads", "audio_outputs", "chromadb_storage"]
    for folder in folders:
        if not os.path.exists(folder): os.makedirs(folder)
    sys.path.insert(0, os.getcwd())
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
""",
    "app/main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
@app.get("/")
def home(): return {"status": "ok"}
@app.post("/upload_resume")
def upload(): return {"message": "success"}
@app.post("/start_interview")
def start(): return {"transcript": "Ready", "audio_url": "", "is_last_question": False}
"""
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w") as f: f.write(content)
    print(f"Fixed: {path}")

print("\\nSuccess! Now run: python run_server.py")`;
    
    navigator.clipboard.writeText(script);
    alert("Repair code copied! Create a new file named 'repair.py' and paste this in.");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Resume Upload</h2>
          <p className="text-gray-600 mt-2">Upload your PDF to start the interview.</p>
        </div>

        {isConnectionError ? (
          <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl text-left">
            <h4 className="font-bold text-red-800 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
              Server Error (Syntax or Connection)
            </h4>
            <p className="text-sm text-red-700 mb-4">The backend server is either not running or the <b>run_server.py</b> file is broken.</p>
            
            <div className="bg-white p-4 rounded-xl border border-red-100 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase">Quick Fix:</p>
              <button 
                onClick={copyRepairScript}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
              >
                Copy Repair Script
              </button>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                <li>Create <b>repair.py</b> in your folder.</li>
                <li>Paste the copied code and save.</li>
                <li>Run <b>python repair.py</b> then <b>python run_server.py</b></li>
              </ol>
            </div>
            
            <button 
              onClick={handleUpload}
              className="w-full mt-4 bg-white border border-red-300 text-red-600 py-2 rounded-lg font-bold hover:bg-red-50"
            >
              Check Again
            </button>
          </div>
        ) : (
          <>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 mb-6 hover:border-indigo-400 transition-colors cursor-pointer relative bg-gray-50/50 group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-indigo-600">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold truncate max-w-xs">{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-300 group-hover:text-indigo-300 mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-gray-500">
                    Click to select your <span className="text-indigo-600 font-semibold">PDF Resume</span>
                  </div>
                </div>
              )}
            </div>

            {error && <div className="mb-4 text-red-500 text-sm font-medium">{error}</div>}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Start Interview'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
