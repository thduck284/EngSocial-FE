import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getVocabularyTopic, CUSTOM_TOPIC_ID } from '../utils/getVocabularyTopic';
import { vocabTopicDetailPath } from '../utils/vocabularyCustomRoutes';
import { recordVocabTopicActivity } from '../utils/vocabularyRecentTopics';

const LearnPage = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const deckParam = searchParams.get('deck');
    const topic = useMemo(() => getVocabularyTopic(topicId, deckParam), [topicId, deckParam]);

    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [answerStatus, setAnswerStatus] = useState(null);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [showContinue, setShowContinue] = useState(false);
    const [learnedCount, setLearnedCount] = useState(0);
    const [totalWords, setTotalWords] = useState(0);

    useEffect(() => {
        if (topic && Array.isArray(topic.words) && topic.words.length > 0) {
            const shuffled = [...topic.words].sort(() => Math.random() - 0.5);
            setQuestions(shuffled);
            setTotalWords(shuffled.length);
            setLearnedCount(0);
        } else {
            setQuestions([]);
            setTotalWords(0);
        }
    }, [topic]);

    useEffect(() => {
        if (!topic) return;
        recordVocabTopicActivity(topicId, 'learn', topicId === CUSTOM_TOPIC_ID ? deckParam : null);
    }, [topic, topicId, deckParam]);

    useEffect(() => {
        if (questions.length > 0) {
            const first = questions[0];
            setCurrentQuestion(first);
            generateOptions(first, questions.slice(1));
        } else {
            setCurrentQuestion(null);
        }
        setSelectedIdx(null);
        setAnswerStatus(null);
        setShowCorrectAnswer(false);
        setShowContinue(false);
    }, [questions]);

    const generateOptions = (correctWord, otherWords) => {
        const candidates = otherWords.filter(w => w.id !== correctWord.id);
        let distractors = [...candidates];
        if (distractors.length < 3) {
            const allOthers = topic.words.filter(w => w.id !== correctWord.id);
            const more = allOthers.filter(w => !distractors.some(d => d.id === w.id));
            distractors = [...distractors, ...more];
        }
        distractors = distractors.slice(0, 3);
        const optionsArray = [
            { text: correctWord.word, isCorrect: true },
            ...distractors.map(w => ({ text: w.word, isCorrect: false })),
        ];
        for (let i = optionsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
        }
        setOptions(optionsArray);
    };

    const handleSelectOption = (idx, option) => {
        if (answerStatus === 'correct' || showContinue) return;
        setSelectedIdx(idx);
        if (option.isCorrect) {
            setAnswerStatus('correct');
            setShowCorrectAnswer(false);
            setShowContinue(false);
            const newLearnedCount = learnedCount + 1;
            setLearnedCount(newLearnedCount);
            const newQuestions = questions.filter(q => q.id !== currentQuestion.id);
            setQuestions(newQuestions);
        } else {
            setAnswerStatus('wrong');
            setShowCorrectAnswer(true);
            setShowContinue(true);
        }
    };

    const handleDontKnow = () => {
        if (answerStatus === 'correct' || showContinue) return;
        setShowCorrectAnswer(true);
        setShowContinue(true);
        setAnswerStatus('wrong');
    };

    const handleContinue = () => {
        if (!showContinue) return;
        const remainingQuestions = questions.filter(q => q.id !== currentQuestion.id);
        const newQuestions = [...remainingQuestions, currentQuestion];
        setQuestions(newQuestions);
        setSelectedIdx(null);
        setAnswerStatus(null);
        setShowCorrectAnswer(false);
        setShowContinue(false);
    };

    if (!topic) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 text-xl">Không tìm thấy chủ đề.</p>
            </div>
        );
    }

    if (questions.length === 0 && totalWords > 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center flex-col">
                <p className="text-green-600 text-2xl mb-6">🎉 Chúc mừng! Bạn đã học xong tất cả từ vựng trong chủ đề này.</p>
                <button
                    onClick={() => navigate(vocabTopicDetailPath(topicId, deckParam))}
                    className="px-8 py-4 bg-blue-500 text-white text-lg rounded-xl hover:bg-blue-600"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 text-xl">Đang tải...</p>
            </div>
        );
    }

    const progress = (learnedCount / totalWords) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">

            <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center mb-3">
                        <button
                            onClick={() => navigate(vocabTopicDetailPath(topicId, deckParam))}
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-lg"
                        >
                            ← Quay lại
                        </button>
                        <div className="text-base text-gray-500 dark:text-gray-400">
                            {learnedCount} / {totalWords} đã học
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>


            <div className="max-w-5xl mx-auto px-6 py-12">

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 mb-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
                        {currentQuestion.meaning}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Chọn từ tiếng Anh đúng</p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {options.map((option, idx) => {
                        const letter = String.fromCharCode(65 + idx);
                        let buttonClasses =
                            'w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-lg';
                        const isSelected = selectedIdx === idx;
                        const isCorrectOption = option.isCorrect;

                        if (answerStatus === 'correct' && isSelected) {
                            buttonClasses += ' bg-green-100 border-green-500 dark:bg-green-900/30';
                        } else if (answerStatus === 'wrong' && isSelected) {
                            buttonClasses += ' bg-red-100 border-red-500 dark:bg-red-900/30';
                        } else if (showCorrectAnswer && isCorrectOption) {
                            buttonClasses += ' bg-green-100 border-green-500 dark:bg-green-900/30';
                        } else {
                            buttonClasses += ' bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600';
                        }

                        const disabled = answerStatus === 'correct' || showContinue;

                        return (
                            <button
                                key={idx}
                                className={buttonClasses}
                                onClick={() => handleSelectOption(idx, option)}
                                disabled={disabled}
                            >
                                <span className="font-semibold text-lg">
                                    <span className="inline-block w-10 font-bold text-xl">{letter}.</span> {option.text}
                                </span>
                                {answerStatus === 'correct' && isSelected && (
                                    <span className="text-green-600 text-2xl">✓</span>
                                )}
                                {answerStatus === 'wrong' && isSelected && (
                                    <span className="text-red-600 text-2xl">✗</span>
                                )}
                                {showCorrectAnswer && isCorrectOption && !isSelected && (
                                    <span className="text-green-600 text-base">(Đáp án đúng)</span>
                                )}
                            </button>
                        );
                    })}
                </div>


                <div className="flex flex-col items-center gap-6">
                    {!showContinue && (
                        <button
                            onClick={handleDontKnow}
                            disabled={answerStatus === 'correct'}
                            className="px-10 py-4 bg-yellow-500 hover:bg-yellow-600 text-white text-xl rounded-full font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🤔 Bạn không biết?
                        </button>
                    )}
                    {showContinue && (
                        <button
                            onClick={handleContinue}
                            className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-full font-semibold shadow-md transition"
                        >
                            Tiếp tục →
                        </button>
                    )}
                </div>


                {answerStatus === 'wrong' && !showContinue && (
                    <div className="mt-8 text-center text-red-600 text-lg font-semibold">
                        ❌ Sai rồi! Đáp án đúng là: <strong>{options.find(opt => opt.isCorrect)?.text}</strong>
                    </div>
                )}
                {answerStatus === 'correct' && (
                    <div className="mt-8 text-center text-green-600 text-lg font-semibold">
                        ✅ Chính xác! Chuyển sang câu tiếp theo...
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearnPage;