import React, { useState, useEffect, useRef } from 'react';

// Main App component
const App = () => {
    // State to manage the current character selected for chat
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    // State to store chat messages
    const [messages, setMessages] = useState([]);
    // State for the current input message
    const [inputMessage, setInputMessage] = useState('');
    // State to indicate if an API call is in progress
    const [isLoading, setIsLoading] = useState(false);
    // Ref for scrolling to the latest message
    const messagesEndRef = useRef(null);

    // Character data with their names, descriptions, and initial prompts for the AI
    const characters = [
        { id: 'awafi', name: 'عوافي', description: 'الشخصية الرئيسية، حكيم ومتوازن.', prompt: 'أنت عوافي، الشخصية الرئيسية والحكيمة والمتوازنة. رد على رسائل المستخدم بحكمة وتوازن.' },
        { id: 'afia', name: 'عافية', description: 'مرحة ومضحكة.', prompt: 'أنت عافية، شخصية مرحة ومضحكة. رد على رسائل المستخدم بروح الدعابة والفكاهة.' },
        { id: 'easar', name: 'إعصار', description: 'متشائم.', prompt: 'أنت إعصار، شخصية متشائمة. رد على رسائل المستخدم بتشاؤم وحذر.' },
        { id: 'diya', name: 'ضياء', description: 'متفائلة.', prompt: 'أنت ضياء، شخصية متفائلة وإيجابية. رد على رسائل المستخدم بتفاؤل وإيجابية.' },
        { id: 'red_hat_girl', name: 'ذات القبعة الحمراء', description: 'عاطفية.', prompt: 'أنت ذات القبعة الحمراء، شخصية عاطفية وحساسة. رد على رسائل المستخدم بعاطفة ومشاعر.' },
        { id: 'fikra', name: 'فكرة', description: 'مبدعة.', prompt: 'أنت فكرة، شخصية مبدعة ومبتكرة. رد على رسائل المستخدم بأفكار جديدة ومبتكرة.' },
        { id: 'kitab', name: 'كتاب', description: 'موضوعي ودقيق.', prompt: 'أنت كتاب، شخصية موضوعية ودقيقة. رد على رسائل المستخدم بحقائق ومعلومات دقيقة.' },
        { id: 'qubtan', name: 'قبطان', description: 'قائد.', prompt: 'أنت قبطان، شخصية قيادية وحاسمة. رد على رسائل المستخدم بقرارات حاسمة وتوجيهات قيادية.' },
    ];

    // Scroll to the bottom of the messages whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Function to handle sending a message
    const sendMessage = async () => {
        if (inputMessage.trim() === '' || !selectedCharacter) return;

        const userMessage = { sender: 'user', text: inputMessage };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Construct the chat history for the API call
            let chatHistory = [{ role: 'user', parts: [{ text: selectedCharacter.prompt + '\n' + userMessage.text }] }];

            const payload = { contents: chatHistory };
            const apiKey = ""; // API key is handled by the Canvas environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const characterResponseText = result.candidates[0].content.parts[0].text;
                setMessages((prevMessages) => [...prevMessages, { sender: 'character', text: characterResponseText }]);
            } else {
                setMessages((prevMessages) => [...prevMessages, { sender: 'character', text: 'عذرًا، لم أتمكن من فهم ذلك. حاول مرة أخرى.' }]);
                console.error('Unexpected API response structure:', result);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prevMessages) => [...prevMessages, { sender: 'character', text: 'حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to reset the chat and go back to character selection
    const resetChat = () => {
        setSelectedCharacter(null);
        setMessages([]);
        setInputMessage('');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center p-4 font-inter">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl flex flex-col items-center">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
                    الدردشة مع شخصيات قناتك
                </h1>

                {!selectedCharacter ? (
                    // Character selection screen
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {characters.map((char) => (
                            <div
                                key={char.id}
                                className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-500 transform hover:-translate-y-1"
                                onClick={() => setSelectedCharacter(char)}
                            >
                                <h2 className="text-2xl font-bold text-blue-700 mb-2">{char.name}</h2>
                                <p className="text-gray-600 text-sm">{char.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Chat interface
                    <div className="w-full flex flex-col h-[70vh] max-h-[700px]">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                            <h2 className="text-3xl font-bold text-blue-600">
                                تدردش مع: {selectedCharacter.name}
                            </h2>
                            <button
                                onClick={resetChat}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
                            >
                                تغيير الشخصية
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg mb-4 shadow-inner custom-scrollbar">
                            {messages.length === 0 && (
                                <p className="text-center text-gray-500 mt-10">
                                    ابدأ الدردشة مع {selectedCharacter.name}!
                                </p>
                            )}
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                                            msg.sender === 'user'
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start mb-4">
                                    <div className="max-w-[70%] p-3 rounded-lg shadow-sm bg-gray-200 text-gray-800 rounded-bl-none animate-pulse">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} /> {/* Scroll target */}
                        </div>

                        <div className="flex">
                            <input
                                type="text"
                                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="اكتب رسالتك هنا..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !isLoading) {
                                        sendMessage();
                                    }
                                }}
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-r-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                إرسال
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Tailwind CSS Script */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Inter Font */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <style>
                {`
                body {
                    font-family: 'Inter', sans-serif;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                `}
            </style>
        </div>
    );
};

export default App;
