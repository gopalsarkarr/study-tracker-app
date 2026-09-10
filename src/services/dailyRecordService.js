import { supabase } from '../lib/supabase';

export const dailyRecordService = {
  /**
   * Fetch daily records for the user within a date range
   */
  async getDailyRecords(userId, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;
      if (error) throw error;
      return { records: data || [], error: null };
    } catch (err) {
      return { records: [], error: err.message };
    }
  },

  /**
   * Upsert a daily record for a date
   */
  async upsertDailyRecord(userId, date, data) {
    try {
      const payload = {
        user_id: userId,
        date,
        completion_percentage: data.completionPercentage,
        daily_points: data.dailyPoints,
        score_change: data.scoreChange,
        credit_score_after: data.creditScoreAfter,
        updated_at: new Date().toISOString(),
      };

      const { data: record, error } = await supabase
        .from('daily_records')
        .upsert(payload, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;
      return { record, error: null };
    } catch (err) {
      console.error('upsertDailyRecord error:', err);
      return { record: null, error: err.message };
    }
  },

  /**
   * Get all completed task IDs for a specific date or date range
   */
  async getCompletedTasks(userId, date = null) {
    try {
      let query = supabase
        .from('completed_tasks')
        .select('task_id, date')
        .eq('user_id', userId);

      if (date) query = query.eq('date', date);

      const { data, error } = await query;
      if (error) throw error;
      return { completed: data || [], error: null };
    } catch (err) {
      console.error('getCompletedTasks error:', err);
      return { completed: [], error: err.message };
    }
  },

  /**
   * Mark task as completed on cloud
   */
  async recordTaskCompletion(userId, taskId, date) {
    try {
      const { error } = await supabase
        .from('completed_tasks')
        .upsert({
          user_id: userId,
          task_id: taskId,
          date,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,task_id,date' });

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('recordTaskCompletion error:', err);
      return { error: err.message };
    }
  },

  /**
   * Remove task completion on cloud
   */
  async removeTaskCompletion(userId, taskId, date) {
    try {
      const { error } = await supabase
        .from('completed_tasks')
        .delete()
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .eq('date', date);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  },
};
