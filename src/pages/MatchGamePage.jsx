
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getVocabularyTopic, CUSTOM_TOPIC_ID } from '../utils/getVocabularyTopic';
import { vocabTopicDetailPath } from '../utils/vocabularyCustomRoutes';
import { recordVocabTopicActivity } from '../utils/vocabularyRecentTopics';

const MatchGamePage = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const deckParam = searchParams.get('deck');
    const topic = useMemo(() => getVocabularyTopic(topicId, deckParam), [topicId, deckParam]);

    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [matched, setMatched] = useState(new Set());
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [message, setMessage] = useState('');
    const [gameFinished, setGameFinished] = useState(false);

    useEffect(() => {
        if (topic && Array.isArray(topic.words) && topic.words.length >= 4) {

            const selectedWords = topic.words.slice(0, 4);
            const viCards = selectedWords.map((word, idx) => ({
                id: `vi-${word.id}`,
                text: word.meaning,
                type: 'vi',
                pairId: word.id,
            }));
            const enCards = selectedWords.map((word, idx) => ({
                id: `en-${word.id}`,
                text: word.word,
                type: 'en',
                pairId: word.id,
            }));

            const allCards = [...viCards, ...enCards];
            for (let i = allCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
            }
            setCards(allCards);
            setMatched(new Set());
            setSelectedCard(null);
            setTime(0);
            setIsPlaying(true);
            setGameFinished(false);
            setMessage('');
        } else {
            setCards([]);
        }
    }, [topic]);

    useEffect(() => {
        if (!topic) return;
        recordVocabTopicActivity(topicId, 'match', topicId === CUSTOM_TOPIC_ID ? deckParam : null);
    }, [topic, topicId, deckParam]);

    useEffect(() => {
        let timer;
        if (isPlaying && !gameFinished && cards.length > 0) {
            timer = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isPlaying, gameFinished, cards]);


    useEffect(() => {
        if (matched.size === 4 && cards.length > 0) {
            setIsPlaying(false);
            setGameFinished(true);
            setMessage(`🎉 Hoàn thành! Thời gian: ${formatTime(time)}`);
        }
    }, [matched, cards, time]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCardClick = (card) => {
        if (gameFinished) return;
        if (matched.has(card.pairId)) return;
        if (selectedCard === null) {

            setSelectedCard(card);
            return;
        }

        const first = selectedCard;
        const second = card;
        if (first.pairId === second.pairId && first.type !== second.type) {

            setMatched(prev => new Set([...prev, first.pairId]));
            setMessage('✅ Ghép đúng!');
            setSelectedCard(null);

        } else {

            setMessage('❌ Ghép sai!');
            setSelectedCard(null);

            const unmatchedCards = cards.filter(c => !matched.has(c.pairId));
            for (let i = unmatchedCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [unmatchedCards[i], unmatchedCards[j]] = [unmatchedCards[j], unmatchedCards[i]];
            }

            const newCards = [
                ...cards.filter(c => matched.has(c.pairId)),
                ...unmatchedCards
            ];
            setCards(newCards);
        }
    };

    const handleReset = () => {
        if (topic && topic.words.length >= 4) {
            const selectedWords = topic.words.slice(0, 4);
            const viCards = selectedWords.map((word, idx) => ({
                id: `vi-${word.id}`,
                text: word.meaning,
                type: 'vi',
                pairId: word.id,
            }));
            const enCards = selectedWords.map((word, idx) => ({
                id: `en-${word.id}`,
                text: word.word,
                type: 'en',
                pairId: word.id,
            }));
            const allCards = [...viCards, ...enCards];
            for (let i = allCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
            }
            setCards(allCards);
            setMatched(new Set());
            setSelectedCard(null);
            setTime(0);
            setIsPlaying(true);
            setGameFinished(false);
            setMessage('');
        }
    };

    if (!topic) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500">Không tìm thấy chủ đề.</p>
            </div>
        );
    }

    if (topic.words.length < 4) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500">Chủ đề này có ít hơn 4 từ, không đủ để chơi ghép thẻ.</p>
            </div>
        );
    }

    const unmatchedCards = cards.filter(c => !matched.has(c.pairId));

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">

            <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <button
                        onClick={() => navigate(vocabTopicDetailPath(topicId, deckParam))}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600"
                    >
                        ← Quay lại
                    </button>
                    <div className="text-xl font-mono font-bold text-gray-700 dark:text-gray-200">
                        ⏱️ {formatTime(time)}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ghép thẻ</h1>
                    <p className="text-gray-600 dark:text-gray-300">Ghép từ tiếng Việt với từ tiếng Anh tương ứng</p>
                    {message && (
                        <div className="mt-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {message}
                        </div>
                    )}
                </div>

                {gameFinished ? (
                    <div className="text-center py-12">
                        <div className="text-3xl text-green-600 mb-4">🎉 {message}</div>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold shadow"
                        >
                            Chơi lại
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {unmatchedCards.map(card => (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                className={`
                  h-40 rounded-xl shadow-lg transition-all duration-200
                  flex items-center justify-center text-center p-4
                  ${selectedCard?.id === card.id
                                        ? 'bg-blue-500 text-white scale-105 ring-4 ring-blue-300'
                                        : 'bg-white dark:bg-gray-800 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-blue-300'
                                    }
                  text-gray-800 dark:text-white font-medium text-lg
                `}
                            >
                                {card.text}
                            </button>
                        ))}
                    </div>
                )}


                {!gameFinished && (
                    <div className="mt-6 text-center text-gray-500">
                        Đã ghép đúng: {matched.size} / 4 cặp
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchGamePage;