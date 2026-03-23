import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topics } from './VocabularyHomePage'; // import từ file đã export

const TopicDetailPage = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const topicIndex = parseInt(topicId, 10) - 1;
    const topic = topics[topicIndex];

    if (!topic) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Chủ đề không tồn tại.</p>
            </div>
        );
    }

    const studyModes = [
        {
            id: 'flashcard',
            name: 'Thẻ ghi nhớ',
            icon: '🃏',
            description: 'Học từ vựng với thẻ lật',
            color: 'from-blue-400 to-blue-600',
            route: `/topic/${topicId}/flashcard`
        },
        {
            id: 'learn',
            name: 'Học',
            icon: '📚',
            description: 'Luyện tập theo từng bước',
            color: 'from-green-400 to-green-600',
            route: `/topic/${topicId}/learn`
        },
        {
            id: 'test',
            name: 'Bài kiểm tra',
            icon: '📝',
            description: 'Kiểm tra kiến thức của bạn',
            color: 'from-green-400 to-green-600',
            route: `/topic/${topicId}/test`
        },
        {
            id: 'match',
            name: 'Ghép thẻ',
            icon: '🧩',
            description: 'Ghép từ với nghĩa',
            color: 'from-pink-400 to-pink-600',
            route: `/topic/${topicId}/match`
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/vocabularyhome')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Quay lại
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                        Chủ đề: {topic.name} {topic.icon}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {studyModes.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => navigate(mode.route)}
                            className="group relative bg-white dark:bg-[#1f2e36] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-start border-2 border-transparent hover:scale-[1.02] overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-5xl">{mode.icon}</span>
                                <div className="text-left">
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors">
                                        {mode.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {mode.description}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 self-end text-primary group-hover:translate-x-2 transition-transform">
                                <span className="material-symbols-outlined text-3xl">arrow_forward</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Nút xem tất cả từ vựng */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate(`/topic/${topicId}/data`)}
                        className="group relative bg-white dark:bg-[#1f2e36] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 px-8 py-4 flex items-center gap-4 border-2 border-transparent hover:border-primary/50"
                    >
                        <span className="text-3xl">📋</span>
                        <span className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary">
                            Xem tất cả từ vựng
                        </span>
                        <span className="material-symbols-outlined text-primary ml-2">arrow_forward</span>
                    </button>
                </div>

                <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
                    Chọn một hoạt động để bắt đầu học
                </div>
            </div>
        </div>
    );
};

export default TopicDetailPage;