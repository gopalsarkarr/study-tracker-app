import { supabase } from '../lib/supabase';
import { DEFAULT_CATEGORIES, DEFAULT_TASKS } from '../data/initialData';

export const categoryService = {
  /**
   * Fetch all categories for the user
   */
  async getCategories(userId) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { categories: data || [], error: null };
    } catch (err) {
      return { categories: [], error: err.message };
    }
  },

  /**
   * Create a new category
   */
  async createCategory(userId, categoryData) {
    try {
      const payload = {
        user_id: userId,
        name: categoryData.name,
        icon: categoryData.icon || 'Rocket',
        description: categoryData.description || '',
        importance_level: categoryData.importance || 'Medium Impact',
        point_multiplier: Number(categoryData.multiplier) || 1.0,
        is_skill_category: Boolean(categoryData.isSkillCategory),
        color: categoryData.color || 'indigo',
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { category: data, error: null };
    } catch (err) {
      return { category: null, error: err.message };
    }
  },

  /**
   * Update category
   */
  async updateCategory(categoryId, updates) {
    try {
      const payload = {
        name: updates.name,
        icon: updates.icon,
        description: updates.description,
        importance_level: updates.importance,
        point_multiplier: Number(updates.multiplier),
        is_skill_category: Boolean(updates.isSkillCategory),
        color: updates.color,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return { category: data, error: null };
    } catch (err) {
      return { category: null, error: err.message };
    }
  },

  /**
   * Delete category
   */
  async deleteCategory(categoryId) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  },

  /**
   * Fallback client seeder for new user if Postgres trigger did not run
   */
  async seedDefaultsForUser(userId) {
    try {
      const catInserts = DEFAULT_CATEGORIES.map(c => ({
        user_id: userId,
        name: c.name,
        icon: c.icon,
        description: c.description,
        importance_level: c.importance,
        point_multiplier: c.multiplier,
        is_skill_category: c.isSkillCategory,
        color: c.color,
      }));

      const { data: insertedCats, error: catErr } = await supabase
        .from('categories')
        .insert(catInserts)
        .select();

      if (catErr) throw catErr;

      // Map category IDs for default tasks
      const skillsCat = insertedCats.find(c => c.is_skill_category) || insertedCats[0];
      const routineCat = insertedCats.find(c => c.name === 'Daily Routine') || insertedCats[1];
      const fitnessCat = insertedCats.find(c => c.name.includes('Fitness')) || insertedCats[2];
      const readingCat = insertedCats.find(c => c.name.includes('Reading')) || insertedCats[3];

      const taskInserts = DEFAULT_TASKS.map(t => {
        let catId = skillsCat?.id;
        if (t.categoryId === 'daily-routine') catId = routineCat?.id;
        if (t.categoryId === 'fitness') catId = fitnessCat?.id;
        if (t.categoryId === 'reading-growth') catId = readingCat?.id;

        return {
          user_id: userId,
          category_id: catId,
          name: t.name,
          points: t.points,
          priority: t.priority,
          weekly_frequency: t.weeklyFrequency,
          specific_days: t.specificDays,
          is_active: true,
        };
      });

      const { data: insertedTasks } = await supabase
        .from('tasks')
        .insert(taskInserts)
        .select();

      // Seed score and streak
      await supabase.from('study_scores').upsert({
        user_id: userId,
        current_score: 500,
        highest_score: 500,
      });

      await supabase.from('streaks').upsert({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
      });

      return { categories: insertedCats, tasks: insertedTasks || [] };
    } catch (err) {
      console.error('Error seeding defaults:', err);
      return { categories: [], tasks: [] };
    }
  },
};
