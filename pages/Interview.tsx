
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../api';
import { VoiceResponse } from '../types';

const Interview: React.FC = () => {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  const playAudio = (url: string) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.play();
    }
  };

  const startInterview = async () => {
    try {
      setInterviewStarted(true);
      const response = await interviewApi.startInterview();
      // Assuming response contains greeting audio and transcript
      if (response.data.audio_url) {
        playAudio(response.data.audio_url);
      }
      if (response.data.transcript) {
        setTranscripts(prev => [...prev, `AI: ${response.data.transcript}`]);
      }
    } catch (err) {
      console.error("Failed to start interview", err);
      setInterviewStarted(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSendVoice(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access is required for the interview.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSendVoice = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const response = await interviewApi.processVoice(blob);
      const data: VoiceResponse = response.data;
      
      setTranscripts(prev => [...prev, `You: (Voice Response)`, `AI: ${data.transcript}`]);
      setIsLastQuestion(data.is_last_question);
      
      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    } catch (err) {
      console.error("Failed to process voice", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndInterview = async () => {
    try {
      const response = await interviewApi.endInterview();
      navigate('/result', { state: { result: response.data } });
    } catch (err) {
      console.error("Failed to end interview", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col border border-gray-100">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Mock Interview Session</h2>
            <p className="text-indigo-100 opacity-90">Powered by Voice AI</p>
          </div>
          {interviewStarted && (
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></span>
              <span className="font-medium">{isRecording ? 'Recording...' : 'Ready'}</span>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50 max-h-[400px]">
          {!interviewStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ready to start?</h3>
                <p className="text-gray-600">The AI interviewer will guide you through the process.</p>
              </div>
              <button
                onClick={startInterview}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg"
              >
                Start Interview
              </button>
            </div>
          ) : (
            <>
              {transcripts.map((t, i) => (
                <div key={i} className={`flex ${t.startsWith('AI') ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                    t.startsWith('AI') 
                    ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none' 
                    : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                    {t}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 flex items-center space-x-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {interviewStarted && (
          <div className="p-6 bg-white border-t border-gray-100 flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4 w-full justify-center">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isProcessing || isLastQuestion}
                  className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl active:scale-95"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all shadow-xl animate-pulse"
                >
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="w-full flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {isRecording ? "Listening... click stop to send response." : "Click microphone to answer."}
              </p>
              
              <button
                onClick={handleEndInterview}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  isLastQuestion 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                End Interview
              </button>
            </div>
          </div>
        )}
      </div>
      <audio ref={audioPlayerRef} className="hidden" />
    </div>
  );
};

export default Interview;
