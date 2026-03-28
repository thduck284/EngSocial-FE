import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getVocabularyTopic, CUSTOM_TOPIC_ID } from '../utils/getVocabularyTopic';
import { vocabTopicDetailPath } from '../utils/vocabularyCustomRoutes';
import { recordVocabTopicActivity } from '../utils/vocabularyRecentTopics';

const TestPage = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const deckParam = searchParams.get('deck');
    const topic = useMemo(() => getVocabularyTopic(topicId, deckParam), [topicId, deckParam]);

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [showWarningModal, setShowWarningModal] = useState(false);


    useEffect(() => {
        if (topic && Array.isArray(topic.words) && topic.words.length > 0) {
            const generatedQuestions = topic.words.map((word, idx) => {

                const otherWords = topic.words.filter(w => w.id !== word.id);
                const shuffledOther = [...otherWords].sort(() => Math.random() - 0.5);
                let wrongOptions = shuffledOther.slice(0, 3).map(w => w.word);

                if (wrongOptions.length < 3) {
                    const more = topic.words
                        .filter(w => w.id !== word.id && !wrongOptions.includes(w.word))
                        .map(w => w.word);
                    wrongOptions = [...wrongOptions, ...more].slice(0, 3);
                }

                const allOptions = [
                    { text: word.word, isCorrect: true },
                    ...wrongOptions.map(w => ({ text: w, isCorrect: false }))
                ];

                for (let i = allOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
                }
                return {
                    id: word.id,
                    meaning: word.meaning,
                    correctWord: word.word,
                    options: allOptions,
                };
            });
            setQuestions(generatedQuestions);
        } else {
            setQuestions([]);
        }
    }, [topic]);

    useEffect(() => {
        if (!topic) return;
        recordVocabTopicActivity(topicId, 'test', topicId === CUSTOM_TOPIC_ID ? deckParam : null);
    }, [topic, topicId, deckParam]);

    useEffect(() => {
        setUserAnswers({});
        setCurrentIndex(0);
        setSubmitted(false);
        setScore(null);
        setShowWarningModal(false);
    }, [topicId]);

    const handleSelectOption = (questionId, optionText, isCorrect) => {
        if (submitted) return;
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: { selected: optionText, isCorrect }
        }));
    };

    const goToNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const getUnansweredQuestions = () => {
        return questions.filter(q => !userAnswers[q.id]);
    };

    const submitQuiz = () => {
        const unanswered = getUnansweredQuestions();
        if (unanswered.length > 0) {
            setShowWarningModal(true);
        } else {
            doSubmit();
        }
    };

    const doSubmit = () => {
        let correctCount = 0;
        questions.forEach(q => {
            const answer = userAnswers[q.id];
            if (answer && answer.isCorrect) correctCount++;
        });
        const total = questions.length;
        const percentage = total > 0 ? (correctCount / total) * 100 : 0;
        setScore({ correctCount, total, percentage });
        setSubmitted(true);
        setShowWarningModal(false);
    };

    const handleReviewUnanswered = () => {
        const unanswered = getUnansweredQuestions();
        if (unanswered.length > 0) {
            const firstUnansweredId = unanswered[0].id;
            const index = questions.findIndex(q => q.id === firstUnansweredId);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        }
        setShowWarningModal(false);
    };

    const restartQuiz = () => {
        setUserAnswers({});
        setCurrentIndex(0);
        setSubmitted(false);
        setScore(null);
    };

    if (!topic) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 text-xl">Không tìm thấy chủ đề.</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 text-xl">Chủ đề này chưa có từ vựng.</p>
            </div>
        );
    }

    if (submitted && score) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Kết quả bài kiểm tra</h2>
                        <p className="text-6xl font-bold text-blue-600 mb-4">{Math.round(score.percentage)}%</p>
                        <p className="text-xl mb-6">
                            Bạn trả lời đúng <strong>{score.correctCount}</strong> / {score.total} câu
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={restartQuiz}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                Làm lại
                            </button>
                            <button
                                onClick={() => navigate(vocabTopicDetailPath(topicId, deckParam))}
                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                            >
                                Quay lại chủ đề
                            </button>
                        </div>
                    </div>


                    <div className="mt-12 space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Chi tiết câu hỏi</h3>
                        {questions.map((q, idx) => {
                            const answer = userAnswers[q.id];
                            const isCorrect = answer && answer.isCorrect;
                            return (
                                <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-sm text-gray-500">Câu {idx + 1}</span>
                                            <p className="text-lg font-medium mt-1">{q.meaning}</p>
                                            <p className="text-sm mt-2">
                                                Đáp án đúng: <span className="font-semibold text-green-600">{q.correctWord}</span>
                                            </p>
                                            {answer && (
                                                <p className="text-sm mt-1">
                                                    Bạn chọn: <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{answer.selected}</span>
                                                </p>
                                            )}
                                            {!answer && (
                                                <p className="text-sm mt-1 text-yellow-600">Chưa trả lời</p>
                                            )}
                                        </div>
                                        <div className={`text-2xl ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                            {isCorrect ? '✓' : '✗'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const hasAnswered = userAnswers[currentQ.id] !== undefined;
    const progress = (Object.keys(userAnswers).length / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Thanh tiến độ */}
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
                            Đã trả lời: {Object.keys(userAnswers).length} / {questions.length}
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 mb-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
                        {currentQ.meaning}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Chọn từ tiếng Anh đúng</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {currentQ.options.map((option, idx) => {
                        const letter = String.fromCharCode(65 + idx);
                        const isSelected = userAnswers[currentQ.id]?.selected === option.text;
                        let buttonClasses =
                            'w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-lg';

                        if (isSelected) {
                            buttonClasses += ' bg-blue-100 border-blue-500 dark:bg-blue-900/30';
                        } else {
                            buttonClasses += ' bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600';
                        }

                        return (
                            <button
                                key={idx}
                                className={buttonClasses}
                                onClick={() => handleSelectOption(currentQ.id, option.text, option.isCorrect)}
                                disabled={submitted}
                            >
                                <span className="font-semibold text-lg">
                                    <span className="inline-block w-10 font-bold text-xl">{letter}.</span> {option.text}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex justify-between items-center gap-4">
                    <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className={`px-6 py-3 rounded-xl font-medium transition ${currentIndex === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        ← Câu trước
                    </button>
                    {currentIndex === questions.length - 1 ? (
                        <button
                            onClick={submitQuiz}
                            className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
                        >
                            Nộp bài
                        </button>
                    ) : (
                        <button
                            onClick={goToNext}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                        >
                            Câu tiếp theo →
                        </button>
                    )}
                </div>
            </div>

            {showWarningModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            Có vẻ như bạn đã bỏ qua một số câu hỏi
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Bạn muốn xem lại các câu hỏi đã bỏ qua hay gửi bài kiểm tra ngay bây giờ?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleReviewUnanswered}
                                className="px-5 py-2 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition"
                            >
                                Xem lại câu hỏi đã bỏ qua
                            </button>
                            <button
                                onClick={doSubmit}
                                className="px-5 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
                            >
                                Nộp bài ngay
                            </button>
                        </div>
                        <button
                            onClick={() => setShowWarningModal(false)}
                            className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestPage;