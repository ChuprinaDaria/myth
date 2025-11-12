import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// GET /api/events - Отримати всі події
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.id,
        e.date_day,
        e.date_month,
        e.title,
        e.description,
        e.traditions,
        e.preparation,
        json_agg(
          json_build_object(
            'id', ei.id,
            'url', ei.image_url,
            'title', ei.image_title
          ) ORDER BY ei.image_order
        ) FILTER (WHERE ei.id IS NOT NULL) as images
      FROM events e
      LEFT JOIN event_images ei ON e.id = ei.event_id
      WHERE e.is_active = true
      GROUP BY e.id
      ORDER BY e.date_month, e.date_day
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

// GET /api/events/:id - Отримати одну подію
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        e.*,
        json_agg(
          json_build_object(
            'id', ei.id,
            'url', ei.image_url,
            'title', ei.image_title
          ) ORDER BY ei.image_order
        ) FILTER (WHERE ei.id IS NOT NULL) as images
      FROM events e
      LEFT JOIN event_images ei ON e.id = ei.event_id
      WHERE e.id = $1 AND e.is_active = true
      GROUP BY e.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
});

// GET /api/events/date/:month/:day - Отримати подію за датою
router.get('/date/:month/:day', async (req, res) => {
  try {
    const { month, day } = req.params;

    const result = await pool.query(`
      SELECT
        e.*,
        json_agg(
          json_build_object(
            'id', ei.id,
            'url', ei.image_url,
            'title', ei.image_title
          ) ORDER BY ei.image_order
        ) FILTER (WHERE ei.id IS NOT NULL) as images
      FROM events e
      LEFT JOIN event_images ei ON e.id = ei.event_id
      WHERE e.date_month = $1 AND e.date_day = $2 AND e.is_active = true
      GROUP BY e.id
    `, [month, day]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found for this date'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching event by date:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
});

// GET /api/events/month/:month - Отримати події за місяць
router.get('/month/:month', async (req, res) => {
  try {
    const { month } = req.params;

    const result = await pool.query(`
      SELECT
        e.id,
        e.date_day,
        e.date_month,
        e.title,
        e.description,
        e.traditions,
        e.preparation,
        json_agg(
          json_build_object(
            'id', ei.id,
            'url', ei.image_url,
            'title', ei.image_title
          ) ORDER BY ei.image_order
        ) FILTER (WHERE ei.id IS NOT NULL) as images
      FROM events e
      LEFT JOIN event_images ei ON e.id = ei.event_id
      WHERE e.date_month = $1 AND e.is_active = true
      GROUP BY e.id
      ORDER BY e.date_day
    `, [month]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching events by month:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

// GET /api/events/upcoming/:days - Отримати найближчі події (наступні N днів)
router.get('/upcoming/:days', async (req, res) => {
  try {
    const { days } = req.params;
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Це спрощена версія - для production потрібна більш складна логіка
    const result = await pool.query(`
      SELECT
        e.id,
        e.date_day,
        e.date_month,
        e.title,
        e.description,
        json_agg(
          json_build_object(
            'id', ei.id,
            'url', ei.image_url,
            'title', ei.image_title
          ) ORDER BY ei.image_order
        ) FILTER (WHERE ei.id IS NOT NULL) as images
      FROM events e
      LEFT JOIN event_images ei ON e.id = ei.event_id
      WHERE e.is_active = true
        AND (
          (e.date_month = $1 AND e.date_day >= $2)
          OR e.date_month > $1
        )
      GROUP BY e.id
      ORDER BY e.date_month, e.date_day
      LIMIT $3
    `, [currentMonth, currentDay, days]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming events'
    });
  }
});

export default router;
