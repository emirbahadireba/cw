import pool from '../config/database.js';

// Update schedule statuses based on dates
export async function updateScheduleStatuses() {
  try {
    const now = new Date();
    
    // Update expired schedules
    await pool.query(
      `UPDATE schedules 
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE status IN ('active', 'upcoming') 
       AND end_date IS NOT NULL 
       AND end_date < $1`,
      [now]
    );
    
    // Update active schedules
    await pool.query(
      `UPDATE schedules 
       SET status = 'active', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'upcoming' 
       AND (start_date IS NULL OR start_date <= $1)
       AND (end_date IS NULL OR end_date >= $1)`,
      [now]
    );
    
    console.log('Schedule statuses updated');
  } catch (error) {
    console.error('Error updating schedule statuses:', error);
  }
}

// Run every hour
export function startScheduleStatusUpdater() {
  updateScheduleStatuses();
  setInterval(updateScheduleStatuses, 60 * 60 * 1000); // Every hour
}

