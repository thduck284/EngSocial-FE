import suggestionsData from '../data/achievement-categories-suggestions.json'

export function getSuggestedAchievementsForCategory(categoryId) {
  const cat = suggestionsData.categories?.find((c) => c.id === categoryId)
  return Array.isArray(cat?.suggestedAchievements) ? cat.suggestedAchievements : []
}
