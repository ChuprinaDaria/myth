import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import pool from '../config/database';

const router = Router();

// Налаштування multer для завантаження зображень
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/events';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
  }
});

// PUT /api/admin/events/:id - Оновити подію
router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, traditions, preparation, isActive } = req.body;

    const result = await pool.query(`
      UPDATE events
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        traditions = COALESCE($3, traditions),
        preparation = COALESCE($4, preparation),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [title, description, traditions, preparation, isActive, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event'
    });
  }
});

// POST /api/admin/events - Створити нову подію
router.post('/events', async (req, res) => {
  try {
    const { dateDay, dateMonth, title, description, traditions, preparation } = req.body;

    if (!dateDay || !dateMonth || !title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: dateDay, dateMonth, title'
      });
    }

    const result = await pool.query(`
      INSERT INTO events (date_day, date_month, title, description, traditions, preparation)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (date_day, date_month)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        traditions = EXCLUDED.traditions,
        preparation = EXCLUDED.preparation,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [dateDay, dateMonth, title, description, traditions, preparation]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event'
    });
  }
});

// POST /api/admin/events/:id/images - Завантажити зображення для події
router.post('/events/:id/images', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Оптимізуємо зображення за допомогою sharp
    const optimizedFileName = 'optimized-' + req.file.filename;
    const optimizedPath = path.join(req.file.destination, optimizedFileName);

    await sharp(req.file.path)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    // Видаляємо оригінал
    await fs.unlink(req.file.path);

    // Зберігаємо в БД
    const imageUrl = `/uploads/events/${optimizedFileName}`;

    const result = await pool.query(`
      INSERT INTO event_images (event_id, image_url, image_title, image_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, imageUrl, title || '', order || 0]);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// DELETE /api/admin/events/:eventId/images/:imageId - Видалити зображення
router.delete('/events/:eventId/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    // Отримуємо інформацію про зображення
    const image = await pool.query(
      'SELECT image_url FROM event_images WHERE id = $1',
      [imageId]
    );

    if (image.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Видаляємо файл
    const imagePath = path.join(__dirname, '../../', image.rows[0].image_url);
    try {
      await fs.unlink(imagePath);
    } catch (err) {
      console.warn('Failed to delete image file:', err);
    }

    // Видаляємо з БД
    await pool.query('DELETE FROM event_images WHERE id = $1', [imageId]);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

// GET /api/admin/stats - Статистика для адмін панелі
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM events WHERE is_active = true) as total_events,
        (SELECT COUNT(*) FROM events WHERE description IS NOT NULL AND description != '') as filled_events,
        (SELECT COUNT(*) FROM event_images) as total_images,
        (SELECT COUNT(*) FROM device_tokens WHERE is_active = true) as active_devices,
        (SELECT COUNT(*) FROM notifications WHERE status = 'sent') as sent_notifications
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

export default router;
