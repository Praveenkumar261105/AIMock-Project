import React from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewApi, BASE_URL } from '../api';
import { VoiceResponse } from '../types';

const Interview: React.FC = () => {
  const [interviewStarted, setInterviewStarted] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [transcripts, setTranscripts] = React.useState<string[]>([]);
  const [isLastQuestion, setIsLastQuestion] = React.useState(false);
  
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  const playAudio = (url: string) => {
    if (audioPlayerRef.current) {
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
      audioPlayerRef.current.src = fullUrl;
      audioPlayerRef.current.play();
    }
  };

  const startInterview = async () => {
    try {
      setInterviewStarted(true);
      const response = await interviewApi.startInterview();
      if (response.data.audio_url) {
        playAudio(response.data.audio_url);
      }
      if (response.data.transcript) {
        setTranscripts(prev => [...prev, `AI: ${response.data.transcript}`]);
      }
    } catch (err: any) {
      console.error("Failed to start interview", err);
      alert(err.response?.data?.detail || "Failed to start interview. Check backend connection.");
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
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col border border-gray-100">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">AI Voice Interview</h2>
            <p className="text-indigo-100 mt-1">Real-time conversational assessment</p>
          </div>
          {interviewStarted && (
            <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></span>
              <span className="font-semibold text-sm uppercase tracking-wider">{isRecording ? 'Listening' : 'Ready'}</span>
            </div>
          )}
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/50">
          {!interviewStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25"></div>
                <div className="relative w-28 h-28 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <svg className="w-14 h-14 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
              <div className="max-w-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Initialize Interview</h3>
                <p className="text-gray-600 leading-relaxed">Prepare your microphone and find a quiet space. The AI will begin with a greeting.</p>
              </div>
              <button
                onClick={startInterview}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
              >
                Launch Session
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {transcripts.map((t, i) => (
                <div key={i} className={`flex ${t.startsWith('AI') ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm border ${
                    t.startsWith('AI') 
                    ? 'bg-white text-gray-800 border-gray-200 rounded-tl-none' 
                    : 'bg-indigo-600 text-white border-transparent rounded-tr-none'
                  }`}>
                    <p className="text-xs font-bold opacity-60 mb-1 uppercase tracking-widest">
                      {t.startsWith('AI') ? 'Interviewer' : 'You'}
                    </p>
                    <p className="text-lg leading-relaxed">{t.replace('AI: ', '').replace('You: ', '')}</p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white px-5 py-3 rounded-2xl border border-gray-200 flex items-center space-x-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-500 ml-2">Analyzing response...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {interviewStarted && (
          <div className="p-8 bg-white border-t border-gray-100">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isProcessing || isLastQuestion}
                    className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-2xl hover:scale-110 active:scale-90"
                    title="Start Speaking"
                  >
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all shadow-2xl animate-pulse scale-105"
                    title="Finish Speaking"
                  >
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </button>
                )}
                {isRecording && (
                    <div className="absolute -inset-4 border-4 border-red-500/20 rounded-full animate-ping"></div>
                )}
              </div>
              
              <div className="w-full flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-sm font-medium text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isRecording ? "Listening to your response... tap to finish." : "Ready for your answer. Press mic to speak."}
                </p>
                
                <button
                  onClick={handleEndInterview}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                    isLastQuestion 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 translate-y-0 scale-105' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100'
                  }`}
                >
                  {isLastQuestion ? 'Complete Interview' : 'End Early'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <audio ref={audioPlayerRef} className="hidden" />
    </div>
  );
};

export default Interview;