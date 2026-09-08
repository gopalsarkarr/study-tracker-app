import { supabase } from '../lib/supabase';
import { DEFAULT_VISION_PHOTOS } from '../data/initialData';

export const visionService = {
  /**
   * Fetch vision photos and active index for a user from Supabase Cloud
   */
  async getVisionPhotos(userId, userMetadata = null) {
    if (!userId) {
      return { photos: DEFAULT_VISION_PHOTOS, activeIndex: 0, error: null };
    }

    try {
      // 1. Try fetching from Supabase PostgreSQL database
      const { data, error } = await supabase
        .from('achievements')
        .select('achievement_name')
        .eq('user_id', userId)
        .eq('achievement_type', 'vision_board_data')
        .single();

      if (data && data.achievement_name) {
        try {
          const parsed = JSON.parse(data.achievement_name);
          if (parsed && Array.isArray(parsed.photos) && parsed.photos.length > 0) {
            return {
              photos: parsed.photos,
              activeIndex: typeof parsed.activeIndex === 'number' ? parsed.activeIndex : 0,
              error: null,
            };
          }
        } catch (parseErr) {
          console.error('Error parsing cloud vision photos:', parseErr);
        }
      }

      // 2. Fallback to auth user_metadata if available
      if (userMetadata && Array.isArray(userMetadata.vision_photos) && userMetadata.vision_photos.length > 0) {
        return {
          photos: userMetadata.vision_photos,
          activeIndex: typeof userMetadata.active_vision_idx === 'number' ? userMetadata.active_vision_idx : 0,
          error: null,
        };
      }

      // 3. Fallback to local user cache
      try {
        const localRaw = localStorage.getItem(`aura_vision_photos_${userId}`);
        if (localRaw) {
          const localPhotos = JSON.parse(localRaw);
          if (Array.isArray(localPhotos) && localPhotos.length > 0) {
            const localIdx = localStorage.getItem(`aura_active_vision_idx_${userId}`);
            return {
              photos: localPhotos,
              activeIndex: localIdx !== null ? JSON.parse(localIdx) : 0,
              error: null,
            };
          }
        }
      } catch (e) {}

      // 4. If new user has no photos anywhere, return default photos
      return {
        photos: DEFAULT_VISION_PHOTOS,
        activeIndex: 0,
        error: null,
      };
    } catch (err) {
      console.error('Failed to load vision photos from cloud:', err);
      return { photos: DEFAULT_VISION_PHOTOS, activeIndex: 0, error: err.message };
    }
  },

  /**
   * Save vision photos and active index to Supabase Cloud (Database + Auth User Metadata)
   */
  async saveVisionPhotos(userId, photos, activeIndex = 0) {
    if (!userId) return { error: 'No user ID provided' };

    try {
      const payloadString = JSON.stringify({
        photos,
        activeIndex,
        updatedAt: new Date().toISOString(),
      });

      // 1. Persist to Supabase PostgreSQL table (achievements with unique user_id + achievement_type)
      const dbPromise = supabase
        .from('achievements')
        .upsert(
          {
            user_id: userId,
            achievement_type: 'vision_board_data',
            achievement_name: payloadString,
            achieved_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,achievement_type' }
        );

      // 2. Persist to Supabase Auth user_metadata so it's always included in auth session
      const authPromise = supabase.auth.updateUser({
        data: {
          vision_photos: photos,
          active_vision_idx: activeIndex,
        },
      });

      // Execute both in parallel for maximum speed and multi-device persistence
      const [dbResult, authResult] = await Promise.allSettled([dbPromise, authPromise]);

      if (dbResult.status === 'rejected') {
        console.warn('DB vision photos save warning:', dbResult.reason);
      }
      if (authResult.status === 'rejected') {
        console.warn('Auth metadata vision photos save warning:', authResult.reason);
      }

      // 3. Cache locally for this specific user
      try {
        localStorage.setItem(`aura_vision_photos_${userId}`, JSON.stringify(photos));
        localStorage.setItem(`aura_active_vision_idx_${userId}`, JSON.stringify(activeIndex));
        localStorage.setItem('aura_vision_photos_v1', JSON.stringify(photos));
        localStorage.setItem('aura_active_vision_idx', JSON.stringify(activeIndex));
      } catch (e) {
        console.error('Local cache error:', e);
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Failed to save vision photos to cloud:', err);
      return { success: false, error: err.message };
    }
  },
};
