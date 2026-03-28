import React, { useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VOCAB_TOPIC_METAS } from '../constants/vocabTopicMetas';
import { CUSTOM_TOPIC_ID } from '../utils/getVocabularyTopic';
import { getCustomDeckNames } from '../utils/vocabularyUserStorage';
import { vocabPracticePath } from '../utils/vocabularyCustomRoutes';
import { ROUTES } from '../constants/api';
import { recordVocabTopicActivity } from '../utils/vocabularyRecentTopics';

const CUSTOM_ICON = '✨';

const TopicDetailPage = () => {
    const { t } = useTranslation();
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isCustom = topicId === CUSTOM_TOPIC_ID;
    const topicIndex = parseInt(topicId, 10) - 1;
    const meta = !isCustom ? VOCAB_TOPIC_METAS[topicIndex] : null;

    const deckFromUrl = searchParams.get('deck') || 'all';
    const customDecks = useMemo(() => (isCustom ? getCustomDeckNames() : []), [isCustom]);

    useEffect(() => {
        if (isCustom) {
            recordVocabTopicActivity(
                CUSTOM_TOPIC_ID,
                'detail',
                deckFromUrl === 'all' ? null : deckFromUrl
            );
            return;
        }
        if (meta) {
            recordVocabTopicActivity(topicId, 'detail', null);
        }
    }, [topicId, isCustom, meta, deckFromUrl]);

    if (!isCustom && !meta) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">{t('vocabulary.topicNotFound')}</p>
            </div>
        );
    }

    const deckForLinks = deckFromUrl === 'all' ? null : deckFromUrl;

    const studyModes = useMemo(
        () =>
            [
                {
                    id: 'flashcard',
                    nameKey: 'vocabulary.modeFlashcard',
                    descKey: 'vocabulary.modeFlashcardDesc',
                    icon: '🃏',
                    color: 'from-blue-400 to-blue-600',
                },
                {
                    id: 'learn',
                    nameKey: 'vocabulary.modeLearn',
                    descKey: 'vocabulary.modeLearnDesc',
                    icon: '📚',
                    color: 'from-green-400 to-green-600',
                },
                {
                    id: 'test',
                    nameKey: 'vocabulary.modeTest',
                    descKey: 'vocabulary.modeTestDesc',
                    icon: '📝',
                    color: 'from-green-400 to-green-600',
                },
                {
                    id: 'match',
                    nameKey: 'vocabulary.modeMatch',
                    descKey: 'vocabulary.modeMatchDesc',
                    icon: '🧩',
                    color: 'from-pink-400 to-pink-600',
                },
            ].map((mode) => ({
                ...mode,
                name: t(mode.nameKey),
                description: t(mode.descKey),
                route: isCustom
                    ? vocabPracticePath(CUSTOM_TOPIC_ID, mode.id, deckForLinks)
                    : `/topic/${topicId}/${mode.id}`,
            })),
        [t, isCustom, topicId, deckForLinks]
    );

    const dataRoute = isCustom
        ? vocabPracticePath(CUSTOM_TOPIC_ID, 'data', deckForLinks)
        : `/topic/${topicId}/data`;

    const handleDeckFilterChange = (e) => {
        const v = e.target.value;
        if (v === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ deck: v });
        }
    };

    const mainTitle = isCustom
        ? deckFromUrl !== 'all'
            ? t('vocabulary.customTitleDeck', { deck: deckFromUrl })
            : t('vocabulary.customTitleAll')
        : t('vocabulary.topicHeading', {
              name: t(`vocabulary.topics.${meta.key}`),
          });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`${ROUTES.WORDS_NOTES}/topics`)}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            {t('vocabulary.back')}
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            {mainTitle} {isCustom ? CUSTOM_ICON : meta.icon}
                        </h1>
                    </div>
                    {isCustom && (
                        <div className="flex items-center gap-2 md:max-w-xs w-full md:w-auto">
                            <label htmlFor="vocab-deck-filter" className="text-sm text-gray-600 dark:text-gray-400 shrink-0">
                                {t('vocabulary.practiceByDeck')}
                            </label>
                            <select
                                id="vocab-deck-filter"
                                value={deckFromUrl === 'all' || !customDecks.includes(deckFromUrl) ? 'all' : deckFromUrl}
                                onChange={handleDeckFilterChange}
                                className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                            >
                                <option value="all">{t('vocabulary.allDecks')}</option>
                                {customDecks.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
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

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate(dataRoute)}
                        className="group relative bg-white dark:bg-[#1f2e36] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 px-8 py-4 flex items-center gap-4 border-2 border-transparent hover:border-primary/50"
                    >
                        <span className="text-3xl">📋</span>
                        <span className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary">
                            {t('vocabulary.viewAllWords')}
                        </span>
                        <span className="material-symbols-outlined text-primary ml-2">arrow_forward</span>
                    </button>
                </div>

                <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
                    {t('vocabulary.pickActivity')}
                </div>
            </div>
        </div>
    );
};

export default TopicDetailPage;
