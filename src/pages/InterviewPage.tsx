import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


interface Feedback {
  score: number;
  feedback: string;
}

interface ConversationTurn {
    role: 'user' | 'model';
    text: string;
    feedback?: Feedback;
}

// --- Main Component ---
export default function InterviewPage() {
    const navigate = useNavigate();
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const recognitionRef = useRef<any>(null);

    // --- Helper function to speak text ---
    const speak = (text: string, onEndCallback: () => void = () => {}) => {
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 0.9;
        utterance.onend = () => {
            setIsSpeaking(false);
            onEndCallback();
        };
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.name.includes('Google UK English Male')) || voices.find(voice => voice.lang.startsWith('en-US'));
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
    };

    // --- Function to start the interview ---
    const startInterview = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('${import.meta.env.VITE_API_BASE_URL}/api/start-interview', { method: 'POST' });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            setCurrentQuestion(data.questionText);
            setConversation([{ role: 'model', text: data.questionText }]);
            speak(data.questionText);
        } catch (err: any) {
            setError(err.message || 'Failed to start interview.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Function to process the user's answer ---
    const processUserAnswer = async (userAnswer: string) => {
        if (!userAnswer.trim()) return;
        setIsProcessing(true);
        setError(null);
        const currentHistory = [...conversation, { role: 'user' as const, text: userAnswer }];
        setConversation(currentHistory);
        try {
            const response = await fetch('http://localhost:3001/api/process-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAnswer,
                    originalQuestion: currentQuestion,
                    conversationHistory: conversation,
                }),
            });
            if (!response.ok) throw new Error('Failed to get feedback from the server.');
            const feedbackData = await response.json();
            setConversation(prev => prev.map((turn, index) => 
                index === prev.length - 1 ? { ...turn, feedback: { score: feedbackData.score, feedback: feedbackData.feedback } } : turn
            ));
            setCurrentQuestion(feedbackData.followUpQuestion);
            setConversation(prev => [...prev, { role: 'model', text: feedbackData.followUpQuestion }]);
            speak(feedbackData.followUpQuestion);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Recording Handlers ---
    const handleRecordClick = () => {
        if (!recognitionRef.current) {
            setError("Speech recognition is not supported by your browser.");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };
    
    // --- Effect to initialize and clean up recognition ---
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition is not supported by your browser.");
            return;
        }

        const rec = new SpeechRecognition();
        recognitionRef.current = rec;
        rec.continuous = true;
        rec.lang = 'en-US';
        rec.interimResults = true;

        const handleResult = (event: any) => {
            const transcript = Array.from(event.results).map((result: any) => result[0]).map((result: any) => result.transcript).join('');
            if (event.results[event.results.length - 1].isFinal) {
                processUserAnswer(transcript);
            }
        };

        const handleStart = () => setIsRecording(true);
        const handleEnd = () => setIsRecording(false);
        
        const handleError = (event: any) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsRecording(false);
        };

        rec.addEventListener('result', handleResult);
        rec.addEventListener('start', handleStart);
        rec.addEventListener('end', handleEnd);
        rec.addEventListener('error', handleError);

        return () => {
            rec.removeEventListener('result', handleResult);
            rec.removeEventListener('start', handleStart);
            rec.removeEventListener('end', handleEnd);
            rec.removeEventListener('error', handleError);
            rec.stop();
        };
    }, []);


    // --- Effect to start the interview on mount ---
    useEffect(() => {
        const init = () => { if (window.speechSynthesis.getVoices().length > 0) startInterview(); };
        if (window.speechSynthesis.getVoices().length > 0) init();
        else window.speechSynthesis.onvoiceschanged = init;
    }, []);

    const handleStopInterview = () => {
        window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.stop();
        navigate('/');
    };

    // --- UI Rendering ---
    return (
        <div className="bg-gray-900 min-h-screen flex justify-center items-start p-4 sm:p-6">
            <div className="w-full max-w-3xl rounded-lg overflow-hidden shadow-lg border-2 border-cyan-500/50">
                <header className="bg-gray-800 text-cyan-400 p-4 flex justify-between items-center border-b border-cyan-500/50">
                    <h1 className="text-xl font-bold glitch" data-text="INTERVIEWScribe">InterviewScribe</h1>
                    <button onClick={handleStopInterview} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors border border-red-500">
                        Stop
                    </button>
                </header>

                <div className="p-6 h-[60vh] overflow-y-auto space-y-4 text-white">
                    {conversation.map((turn, index) => (
                        <div key={index} className={`flex flex-col ${turn.role === 'model' ? 'items-start' : 'items-end'}`}>
                            <div className={`rounded-lg p-3 max-w-lg ${turn.role === 'model' ? 'bg-gray-700 text-cyan-300 rounded-bl-none border border-cyan-600' : 'bg-blue-800 text-lime-300 rounded-br-none border border-lime-600'}`}>
                                <p className="glitch" data-text={turn.text}>{turn.text}</p>
                            </div>
                            {turn.role === 'user' && turn.feedback && (
                                <div className="mt-1 text-right text-sm text-gray-400 border-t border-gray-700 pt-1 w-full max-w-lg">
                                    <p><strong>Score:</strong> <span className="font-mono text-yellow-400">{turn.feedback.score}/10</span></p>
                                    <p className="text-yellow-300 italic">{turn.feedback.feedback}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {isProcessing && <p className="text-center text-cyan-300 animate-pulse">Processing...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                </div>

                <footer className="bg-gray-800 p-4 border-t border-cyan-500/50">
                    <div className="text-center">
                        <button
                            onClick={handleRecordClick}
                            disabled={isLoading || isSpeaking || isProcessing}
                            className={`px-8 py-4 text-lg font-semibold text-white rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto ${
                                isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 border-2 border-red-500 animate-pulse' : 'bg-lime-600 hover:bg-lime-700 focus:ring-lime-500 border-2 border-lime-500'
                            } disabled:bg-gray-600 disabled:cursor-not-allowed`}
                        >
                            {isRecording ? 'Listening...' : 'Record'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
