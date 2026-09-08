import { supabase } from '../lib/supabase';

export const taskService = {
  /**
   * Fetch all active tasks for user
   */
  async getTasks(userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { tasks: data || [], error: null };
    } catch (err) {
      return { tasks: [], error: err.message };
    }
  },

  /**
   * Create a new task
   */
  async createTask(userId, taskData) {
    try {
      const payload = {
        user_id: userId,
        category_id: taskData.categoryId,
        name: taskData.name,
        points: Number(taskData.points) || 25,
        priority: taskData.priority || 'Medium',
        weekly_frequency: Number(taskData.weeklyFrequency) || 5,
        specific_days: taskData.specificDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        link_url: taskData.linkUrl || '',
        is_active: true,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { task: data, error: null };
    } catch (err) {
      return { task: null, error: err.message };
    }
  },

  /**
   * Update task
   */
  async updateTask(taskId, updates) {
    try {
      const payload = {
        name: updates.name,
        category_id: updates.categoryId,
        points: Number(updates.points),
        priority: updates.priority,
        weekly_frequency: Number(updates.weeklyFrequency),
        specific_days: updates.specificDays,
        link_url: updates.linkUrl !== undefined ? updates.linkUrl : undefined,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return { task: data, error: null };
    } catch (err) {
      return { task: null, error: err.message };
    }
  },

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  },
};
