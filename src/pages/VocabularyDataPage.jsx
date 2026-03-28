import React, { useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getVocabularyTopic, CUSTOM_TOPIC_ID } from '../utils/getVocabularyTopic';
import { vocabTopicDetailPath } from '../utils/vocabularyCustomRoutes';
import { recordVocabTopicActivity } from '../utils/vocabularyRecentTopics';
import { VOCAB_TOPIC_METAS } from '../constants/vocabTopicMetas';

const VocabularyDataPage = () => {
    const { t } = useTranslation();
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const deckParam = searchParams.get('deck');
    const topic = useMemo(() => getVocabularyTopic(topicId, deckParam), [topicId, deckParam]);

    const topicIndex = parseInt(topicId, 10) - 1;
    const presetMeta = topicId !== CUSTOM_TOPIC_ID ? VOCAB_TOPIC_METAS[topicIndex] : null;

    const headingBase = useMemo(() => {
        if (topicId === CUSTOM_TOPIC_ID) {
            return deckParam
                ? t('vocabulary.customTitleDeck', { deck: deckParam })
                : t('vocabulary.customTitleAll');
        }
        if (presetMeta) {
            return t(`vocabulary.topics.${presetMeta.key}`);
        }
        return topic?.topicName ?? '';
    }, [topicId, deckParam, presetMeta, topic?.topicName, t]);

    useEffect(() => {
        if (!topic) return;
        recordVocabTopicActivity(topicId, 'data', topicId === CUSTOM_TOPIC_ID ? deckParam : null);
    }, [topic, topicId, deckParam]);

    if (!topic) {
        return <div className="p-8 text-center">{t('vocabulary.topicNotFound')}</div>;
    }

    const wordTypeLabel = (id) =>
        (id || '').trim() ? t(`vocabulary.wordType.${id}`) : t('vocabulary.dash');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(vocabTopicDetailPath(topicId, deckParam))} className="text-gray-600 hover:text-indigo-600">← {t('vocabulary.back')}</button>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {headingBase} - {t('vocabulary.allWordsSuffix')}
                    </h1>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4">#</th>
                                {topicId === CUSTOM_TOPIC_ID ? (
                                    <th className="px-6 py-4">{t('vocabulary.colDeck')}</th>
                                ) : null}
                                {topicId === CUSTOM_TOPIC_ID ? (
                                    <th className="px-6 py-4">{t('vocabulary.colWordType')}</th>
                                ) : null}
                                <th className="px-6 py-4">{t('vocabulary.colWord')}</th>
                                <th className="px-6 py-4">{t('vocabulary.colPronunciation')}</th>
                                <th className="px-6 py-4">{t('vocabulary.colMeaning')}</th>
                                <th className="px-6 py-4">{t('vocabulary.colExample')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topic.words.map((word, idx) => (
                                <tr key={word.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4">{idx + 1}</td>
                                    {topicId === CUSTOM_TOPIC_ID ? (
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(word.deck || '').trim() || t('vocabulary.dash')}</td>
                                    ) : null}
                                    {topicId === CUSTOM_TOPIC_ID ? (
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{wordTypeLabel(word.wordType)}</td>
                                    ) : null}
                                    <td className="px-6 py-4 font-medium">{word.word}</td>
                                    <td className="px-6 py-4 text-gray-500">{word.pronunciation}</td>
                                    <td className="px-6 py-4">{word.meaning}</td>
                                    <td className="px-6 py-4 italic text-gray-600 dark:text-gray-400">
                                        {(word.example || '').trim() ? word.example : t('vocabulary.dash')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6 text-center text-gray-500">{t('vocabulary.totalWordCount', { count: topic.words.length })}</div>
            </div>
        </div>
    );
};

export default VocabularyDataPage;
