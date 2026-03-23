import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vocabularyData } from '../data/vocabularyData';

const FlashCardPage = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const topic = vocabularyData?.[topicId];
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [learned, setLearned] = useState(new Set());


    useEffect(() => {
        if (topic && Array.isArray(topic.words) && topic.words.length > 0) {
            const shuffled = [...topic.words].sort(() => Math.random() - 0.5);
            setCards(shuffled);
            setCurrentIndex(0);
            setIsFlipped(false);
            setLearned(new Set());
        } else {
            setCards([]);
        }
    }, [topic]);


    if (!topic) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Không tìm thấy dữ liệu cho chủ đề này.</p>
            </div>
        );
    }


    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Chủ đề này chưa có từ vựng.</p>
            </div>
        );
    }

    const currentCard = cards[currentIndex];
    if (!currentCard) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
            </div>
        );
    }

    const totalCards = cards.length;
    const learnedCount = learned.size;
    const progress = (learnedCount / totalCards) * 100;

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % totalCards);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleKnow = () => {
        if (currentCard) {
            setLearned(prev => new Set([...prev, currentCard.id]));
        }
        handleNext();
    };

    const handleNotYet = () => {
        handleNext();
    };

    const handleShuffle = () => {
        setIsFlipped(false);
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
    };

    const speak = () => {
        if (!currentCard) return;
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentCard.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Trình duyệt không hỗ trợ phát âm.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex justify-between items-center mb-2">
                        <button onClick={() => navigate(`/topic/${topicId}`)} className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
                            ← Quay lại
                        </button>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{learnedCount} / {totalCards} đã nhớ</div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>


            <div className="max-w-3xl mx-auto px-4 py-12">
                <div
                    className="relative w-full h-[450px] cursor-pointer mb-8"
                    onClick={handleFlip}
                >
                    {!isFlipped ? (

                        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8">
                            <div className="absolute top-4 right-4">
                                <button onClick={(e) => { e.stopPropagation(); speak(); }} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                    🔊
                                </button>
                            </div>
                            <span className="text-7xl mb-6">📖</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white text-center">
                                {currentCard.word}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-4">{currentCard.pronunciation}</p>
                            <p className="text-gray-400 dark:text-gray-500 mt-8 text-sm">Nhấn vào thẻ để xem nghĩa</p>
                        </div>
                    ) : (

                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8">
                            <span className="text-6xl mb-6">💡</span>
                            <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
                                {currentCard.meaning}
                            </h3>
                            {currentCard.example && (
                                <p className="text-blue-100 text-center italic">"{currentCard.example}"</p>
                            )}
                            <p className="text-white/70 mt-8 text-sm">Nhấn vào thẻ để quay lại từ</p>
                        </div>
                    )}
                </div>


                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    <button onClick={handlePrev} className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300">
                        ← Thẻ trước
                    </button>
                    <button onClick={handleShuffle} className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300">
                        🎲 Xáo trộn
                    </button>
                    <button onClick={handleNext} className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300">
                        Thẻ sau →
                    </button>
                </div>


                <div className="flex justify-center gap-4">
                    <button onClick={handleNotYet} className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold">
                        ✗ Vẫn chưa
                    </button>
                    <button onClick={handleKnow} className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold">
                        ✓ Ghi nhớ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashCardPage;