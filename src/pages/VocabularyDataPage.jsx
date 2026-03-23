import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vocabularyData } from '../data/vocabularyData';

const VocabularyDataPage = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const topic = vocabularyData[topicId];

    if (!topic) {
        return <div className="p-8 text-center">Không tìm thấy dữ liệu</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(`/topic/${topicId}`)} className="text-gray-600 hover:text-indigo-600">← Quay lại</button>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{topic.topicName} - Tất cả từ vựng</h1>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                            <tr><th className="px-6 py-4">#</th><th className="px-6 py-4">Từ vựng</th><th className="px-6 py-4">Phiên âm</th><th className="px-6 py-4">Nghĩa</th><th className="px-6 py-4">Ví dụ</th></tr>
                        </thead>
                        <tbody>
                            {topic.words.map((word, idx) => (
                                <tr key={word.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4">{idx + 1}</td>
                                    <td className="px-6 py-4 font-medium">{word.word}</td>
                                    <td className="px-6 py-4 text-gray-500">{word.pronunciation}</td>
                                    <td className="px-6 py-4">{word.meaning}</td>
                                    <td className="px-6 py-4 italic text-gray-600">{word.example}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6 text-center text-gray-500">Tổng số từ: {topic.words.length}</div>
            </div>
        </div>
    );
};

export default VocabularyDataPage;