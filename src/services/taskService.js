import { supabase } from '../lib/supabase';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

      // Merge local link cache if link_url is missing from column or empty
      let localLinks = {};
      try {
        localLinks = JSON.parse(localStorage.getItem('aura_task_links_v1') || '{}');
      } catch (e) {
        // ignore
      }

      const tasksWithLinks = (data || []).map(t => ({
        ...t,
        link_url: t.link_url || localLinks[t.id] || '',
      }));

      return { tasks: tasksWithLinks, error: null };
    } catch (err) {
      console.error('Error fetching tasks from Supabase:', err);
      return { tasks: [], error: err.message };
    }
  },

  /**
   * Create a new task
   */
  async createTask(userId, taskData) {
    try {
      // Ensure category_id is a valid UUID or fallback to user's first category
      let validCategoryId = taskData.categoryId;
      if (!validCategoryId || !UUID_REGEX.test(validCategoryId)) {
        const { data: userCats } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
        if (userCats && userCats.length > 0) {
          validCategoryId = userCats[0].id;
        } else {
          validCategoryId = null; // category_id is nullable in schema
        }
      }

      const basePayload = {
        user_id: userId,
        category_id: validCategoryId,
        name: taskData.name,
        points: Number(taskData.points) || 25,
        priority: taskData.priority || 'Medium',
        weekly_frequency: Number(taskData.weeklyFrequency) || 5,
        specific_days: taskData.specificDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        is_active: true,
      };

      // Try inserting with link_url first (if column exists in Supabase)
      let insertPayload = { ...basePayload };
      if (taskData.linkUrl) {
        insertPayload.link_url = taskData.linkUrl;
      }

      let { data, error } = await supabase
        .from('tasks')
        .insert([insertPayload])
        .select()
        .single();

      // If column link_url doesn't exist in Supabase (error 42703 or message contains link_url)
      if (error && (error.code === '42703' || error.message?.includes('link_url'))) {
        console.warn('tasks.link_url column missing in Supabase schema, inserting without it...');
        const retry = await supabase
          .from('tasks')
          .insert([basePayload])
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;

      // Cache task link locally so it is permanently preserved
      if (taskData.linkUrl && data?.id) {
        try {
          const links = JSON.parse(localStorage.getItem('aura_task_links_v1') || '{}');
          links[data.id] = taskData.linkUrl;
          localStorage.setItem('aura_task_links_v1', JSON.stringify(links));
        } catch (e) {
          console.error('Failed to cache task link locally:', e);
        }
      }

      return { task: data, error: null };
    } catch (err) {
      console.error('Failed to create task in Supabase:', err);
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
        points: Number(updates.points),
        priority: updates.priority,
        weekly_frequency: Number(updates.weeklyFrequency),
        specific_days: updates.specificDays,
        updated_at: new Date().toISOString(),
      };

      if (updates.categoryId && UUID_REGEX.test(updates.categoryId)) {
        payload.category_id = updates.categoryId;
      }

      let updatePayload = { ...payload };
      if (updates.linkUrl !== undefined) {
        updatePayload.link_url = updates.linkUrl;
      }

      let { data, error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId)
        .select()
        .single();

      if (error && (error.code === '42703' || error.message?.includes('link_url'))) {
        const retry = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', taskId)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;

      if (updates.linkUrl !== undefined) {
        try {
          const links = JSON.parse(localStorage.getItem('aura_task_links_v1') || '{}');
          links[taskId] = updates.linkUrl;
          localStorage.setItem('aura_task_links_v1', JSON.stringify(links));
        } catch (e) {
          // ignore
        }
      }

      return { task: data, error: null };
    } catch (err) {
      console.error('Failed to update task in Supabase:', err);
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

      // Clean up link cache
      try {
        const links = JSON.parse(localStorage.getItem('aura_task_links_v1') || '{}');
        delete links[taskId];
        localStorage.setItem('aura_task_links_v1', JSON.stringify(links));
      } catch (e) {
        // ignore
      }

      return { error: null };
    } catch (err) {
      console.error('Failed to delete task from Supabase:', err);
      return { error: err.message };
    }
  },
};
