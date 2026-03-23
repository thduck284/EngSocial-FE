import React from "react";
import { useNavigate } from "react-router-dom";

// Danh sách chủ đề kèm icon tương ứng
export const topics = [   // <- thêm export
    { name: "Hành lý", icon: "🧳" },
    { name: "Giao thông", icon: "🚗" },
    { name: "Nhà hàng", icon: "🍽️" },
    { name: "Khách sạn", icon: "🏨" },
    { name: "Mua sắm", icon: "🛍️" },
    { name: "Sức khỏe", icon: "💪" },
    { name: "Công việc", icon: "💼" },
    { name: "Gia đình", icon: "👨‍👩‍👧‍👦" },
    { name: "Du lịch", icon: "✈️" },
    { name: "Thể thao", icon: "⚽" },
    { name: "Âm nhạc", icon: "🎵" },
    { name: "Điện ảnh", icon: "🎬" },
    { name: "Thời trang", icon: "👗" },
    { name: "Công nghệ", icon: "💻" },
    { name: "Ẩm thực", icon: "🍜" },
    { name: "Giáo dục", icon: "📚" },
];

const VocabularyHomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
            <div className="w-full max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-lg">
                        📖 Kho từ vựng
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 mt-4 text-xl md:text-2xl font-light">
                        Chọn một chủ đề để bắt đầu học
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                    {topics.map((topic, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(`/topic/${index + 1}`)}
                            className="group relative bg-white/80 dark:bg-[#1f2e36]/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center justify-center border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-500 hover:scale-105"
                        >
                            <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                {topic.icon}
                            </span>
                            <span className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-400">
                                {topic.name}
                            </span>
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        </button>
                    ))}
                </div>

                <div className="mt-16 text-center text-gray-500 dark:text-gray-400 text-lg">
                    Nhấn vào chủ đề để xem chi tiết
                </div>
            </div>
        </div>
    );
};

export default VocabularyHomePage;