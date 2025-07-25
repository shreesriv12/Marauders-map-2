import React, { useState, useEffect, useRef, useCallback } from 'react';

// Diary component responsible for generating and displaying entries
const Diary = () => {
    const [prompt, setPrompt] = useState(''); // State for user input prompt
    const [diaryEntry, setDiaryEntry] = useState(''); // State for AI-generated diary entry
    const [displayedPromptText, setDisplayedPromptText] = useState(''); // Text shown with typewriter effect for prompt
    const [displayedEntryText, setDisplayedEntryText] = useState(''); // Text shown with typewriter effect for AI entry
    const [loading, setLoading] = useState(false); // State to indicate loading status
    const [error, setError] = useState(''); // State for error messages
    const [isPromptTyping, setIsPromptTyping] = useState(false); // State to control prompt typing animation
    const [isEntryWriting, setIsEntryWriting] = useState(false); // State to control AI entry writing animation
    const [penPosition, setPenPosition] = useState({ x: -100, y: -100 }); // Initial off-screen position for the pen
    const [showDiaryPage, setShowDiaryPage] = useState(false); // Control visibility of the AI entry page (which page is active)
    const [isDiaryOpen, setIsDiaryOpen] = useState(false); // New state for overall diary open/close animation

    const promptInputRef = useRef(null); // Ref for the prompt textarea
    const entryTextRef = useRef(null); // Ref for the div containing the displayed AI entry text
    const entryContainerRef = useRef(null); // Ref for the main diary entry container (the page itself)

    // Function to handle opening the diary
    const handleOpenDiary = () => {
        setIsDiaryOpen(true);
    };

    // Function to measure text width and height for pen positioning
    // It measures the position of the end of the 'text' string within the 'targetElementRef'
    // relative to the 'containerElementRef'.
    const measureTextPosition = useCallback((text, targetElementRef, containerElementRef) => {
        if (!text || !targetElementRef.current || !containerElementRef.current) {
            return { x: -100, y: -100 };
        }

        const targetElement = targetElementRef.current;
        const containerRect = containerElementRef.current.getBoundingClientRect();

        // Create a temporary span to measure the current text's position
        const measureSpan = document.createElement('span');
        measureSpan.style.visibility = 'hidden';
        measureSpan.style.position = 'absolute';
        measureSpan.style.whiteSpace = 'pre-wrap'; // Important for line breaks
        // Copy font styles to ensure accurate measurement
        measureSpan.style.font = window.getComputedStyle(targetElement).font;
        measureSpan.textContent = text;

        targetElement.appendChild(measureSpan);
        const rect = measureSpan.getBoundingClientRect();
        targetElement.removeChild(measureSpan);

        // Calculate relative position of the pen tip within the container
        // We add targetElement.scrollLeft/scrollTop to account for current scroll position
        const relativeX = (rect.right - containerRect.left) + targetElement.scrollLeft;
        const relativeY = (rect.bottom - containerRect.top) + targetElement.scrollTop;

        return { x: relativeX, y: relativeY };
    }, []);

    // Effect for animating user prompt typing and auto-scrolling the prompt textarea
    useEffect(() => {
        if (isPromptTyping && promptInputRef.current) {
            let index = displayedPromptText.length;
            const fullPrompt = prompt;

            const typeWriterPrompt = () => {
                if (index < fullPrompt.length) {
                    const newText = fullPrompt.substring(0, index + 1);
                    setDisplayedPromptText(newText);

                    const { x, y } = measureTextPosition(newText, promptInputRef, promptInputRef);
                    setPenPosition({ x: x, y: y - 25 }); // Adjust Y for pen tip

                    if (promptInputRef.current) {
                        const { scrollHeight, clientHeight } = promptInputRef.current;
                        if (scrollHeight > clientHeight) {
                            promptInputRef.current.scrollTop = scrollHeight;
                        }
                    }

                    index++;
                    setTimeout(typeWriterPrompt, 50);
                } else {
                    setIsPromptTyping(false);
                }
            };

            if (fullPrompt.length > displayedPromptText.length) {
                setTimeout(typeWriterPrompt, 0);
            }
        }
    }, [prompt, isPromptTyping, displayedPromptText, measureTextPosition]);


    // Effect for animating AI entry writing and auto-scrolling the diary page
    useEffect(() => {
        if (diaryEntry && !loading && showDiaryPage) {
            setIsEntryWriting(true);
            setDisplayedEntryText('');
            let index = 0;

            const typeWriterEntry = () => {
                if (index < diaryEntry.length) {
                    const newText = diaryEntry.substring(0, index + 1);
                    setDisplayedEntryText(newText);

                    const { x, y } = measureTextPosition(newText, entryTextRef, entryContainerRef);
                    setPenPosition({ x: x, y: y - 25 });

                    if (entryContainerRef.current && entryTextRef.current) {
                        const entryTextElement = entryTextRef.current;
                        const containerElement = entryContainerRef.current;

                        if (entryTextElement.scrollHeight > containerElement.clientHeight) {
                            containerElement.scrollTop = entryTextElement.scrollHeight - containerElement.clientHeight;
                        }
                    }

                    index++;
                    const delay = diaryEntry[index - 1] === '\n' ? 100 :
                                    diaryEntry[index - 1] === '.' ? 200 :
                                    diaryEntry[index - 1] === ',' ? 150 :
                                    50;
                    setTimeout(typeWriterEntry, delay);
                } else {
                    setIsEntryWriting(false);
                    setTimeout(() => {
                        setPenPosition({ x: -100, y: -100 });
                    }, 1000);
                }
            };

            setTimeout(typeWriterEntry, 500);
        }
    }, [diaryEntry, loading, showDiaryPage, measureTextPosition]);


    // Function to handle the generation of the diary entry
    const generateDiaryEntry = async () => {
        setError('');
        setLoading(true);
        setDiaryEntry('');
        setDisplayedEntryText('');
        setIsEntryWriting(false);
        setPenPosition({ x: -100, y: -100 });
        setShowDiaryPage(false); // Hide the entry page (if visible) to transition back to prompt if needed

        try {
            const response = await fetch('http://localhost:5001/diary-ai/generate_entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate diary entry.');
            }

            const data = await response.json();
            setDiaryEntry(data.diaryEntry);
            setShowDiaryPage(true); // Show the AI entry page once data is received
        } catch (err) {
            console.error('Error generating diary entry:', err);
            setError('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handler for prompt textarea change
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
        if (e.target.value.length > 0) {
            setIsPromptTyping(true);
        } else {
            setIsPromptTyping(false);
            setDisplayedPromptText('');
            setPenPosition({ x: -100, y: -100 });
        }
    };

    // Common styles for the diary paper effect (for background image)
    // These are complex CSS properties not directly covered by Tailwind utilities
    const diaryPaperStyles = {
        backgroundImage: `
            linear-gradient(to right, #ef4444 1px, transparent 1px) 60px 0 / 1px 100% no-repeat, /* Red margin line */
            repeating-linear-gradient(to bottom, transparent, transparent 35px, #d1d5db 35px, #d1d5db 36px) /* Light gray horizontal lines */
        `,
        backgroundOrigin: 'content-box',
        backgroundAttachment: 'local'
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 overflow-hidden">
            {/* The Book Container */}
            <div className="relative w-[800px] h-[500px] shadow-2xl rounded-lg overflow-hidden flex transform transition-transform duration-1000 ease-in-out hover:scale-105">

                {/* The Book Cover */}
                {/* When isDiaryOpen is true, the cover "closes" (rotates away) */}
                <div
                    className={`absolute inset-0 bg-maroon-700 rounded-lg shadow-xl origin-left transform transition-transform duration-1000 ease-in-out z-50
                    ${isDiaryOpen ? '-rotate-y-90' : 'rotate-y-0'}`}
                    onClick={handleOpenDiary}
                >
                    <div className="absolute inset-0 bg-maroon-800 border-2 border-yellow-700 rounded-lg flex flex-col justify-center items-center">
                        <h1 className="text-white text-5xl font-extrabold text-center leading-tight tracking-wide font-serif mb-4">
                            Tom Riddle's <br /> Enchanted Diary
                        </h1>
                        <p className="text-yellow-300 text-lg font-cursive italic">Click to Open</p>
                    </div>
                    {/* Book Spine (visually attached to cover) */}
                    <div className="absolute top-0 right-0 w-8 h-full bg-maroon-900 shadow-inner rounded-r-lg"></div>
                    {/* Book Clasp (purely decorative now, could be interactive) */}
                    <div className="absolute top-1/2 right-0 -mr-2 w-4 h-12 bg-gray-500 rounded-r-full shadow-md transform -translate-y-1/2 z-10"></div>
                </div>

                {/* The Diary Pages Wrapper (holds both pages) */}
                <div className="relative flex w-full h-full">
                    {/* Input Page (Prompt Page) */}
                    <div
                        className={`absolute w-1/2 h-full bg-white p-6 flex flex-col items-start rounded-l-lg shadow-inner border-r-2 border-gray-300
                            transition-all duration-1000 ease-in-out transform
                            ${isDiaryOpen && !showDiaryPage ? 'translate-x-0 opacity-100 z-30' : '-translate-x-full opacity-0 z-10'}
                            ${showDiaryPage ? 'rotate-y-90 opacity-0 pointer-events-none' : ''}
                        `}
                        style={diaryPaperStyles}
                    >
                        <label htmlFor="prompt" className="text-xl font-semibold mb-4 text-gray-800 font-serif">
                            What would Tom Riddle write about?
                        </label>
                        <textarea
                            id="prompt"
                            className="flex-grow w-full p-2 text-lg text-gray-800 leading-relaxed font-sans resize-none outline-none focus:ring-2 focus:ring-red-500 rounded-sm overflow-y-auto"
                            rows="8"
                            value={prompt}
                            onChange={handlePromptChange}
                            placeholder="e.g., 'My thoughts on the Chamber of Secrets,' or 'A new plan to gain power.'"
                            disabled={loading || isEntryWriting}
                            style={{ ...diaryPaperStyles, backgroundColor: 'transparent', border: 'none' }} // Ensure no double borders
                            ref={promptInputRef}
                        />
                        {/* Pen for prompt typing */}
                        {isPromptTyping && (
                            <div
                                className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-50"
                                style={{
                                    left: `${penPosition.x}px`,
                                    top: `${penPosition.y}px`,
                                }}
                            >
                                <div className="w-2 h-10 bg-gray-700 rounded-t-full"></div> {/* Pen body */}
                                <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-8 border-t-gray-800"></div> {/* Pen tip */}
                                <div className="absolute inset-0 blur-sm bg-blue-300 opacity-50"></div> {/* Pen glow */}
                            </div>
                        )}

                        <button
                            onClick={generateDiaryEntry}
                            className="mt-6 px-6 py-3 bg-red-700 text-white rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-md
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500"
                            disabled={loading || isEntryWriting || !prompt.trim()}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Generating Diary Entry...</span>
                                </>
                            ) : isEntryWriting ? (
                                <span>Writing in progress...</span>
                            ) : (
                                <span>Generate Diary Entry</span>
                            )}
                        </button>
                        {error && (
                            <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-md border border-red-300 w-full text-center">
                                <p className="font-semibold">Error:</p>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* AI Entry Page */}
                    <div
                        ref={entryContainerRef}
                        className={`absolute w-1/2 h-full bg-white p-6 flex flex-col items-start rounded-r-lg shadow-inner border-l-2 border-gray-300
                            transition-all duration-1000 ease-in-out transform
                            ${showDiaryPage ? 'translate-x-full opacity-100 z-40' : 'translate-x-0 opacity-0 z-20'}
                        `}
                        style={diaryPaperStyles}
                    >
                        <div className="text-xl font-semibold mb-4 text-gray-800 font-serif">
                            <h2>Tom Riddle's Entry:</h2>
                        </div>
                        <div
                            ref={entryTextRef}
                            className="flex-grow w-full text-lg text-gray-800 leading-relaxed font-sans overflow-y-auto"
                        >
                            {displayedEntryText}
                            {/* Blinking cursor at the end of the displayed text (for AI entry) */}
                            {isEntryWriting && (
                                <span className="inline-block w-1 h-5 bg-gray-800 ml-0.5 animate-blink"></span>
                            )}
                        </div>
                        {isEntryWriting && (
                            <div
                                className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-50"
                                style={{
                                    left: `${penPosition.x}px`,
                                    top: `${penPosition.y}px`,
                                }}
                            >
                                <div className="w-2 h-10 bg-gray-700 rounded-t-full"></div> {/* Pen body */}
                                <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-8 border-t-gray-800"></div> {/* Pen tip */}
                                <div className="absolute inset-0 blur-sm bg-blue-300 opacity-50"></div> {/* Pen glow */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diary;