import { Router, Response } from 'express';
import { Category } from '../models/Category';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { checkAdmin } from '../middleware/admin';

const router = Router();

// GET all categories
router.get('/', async (req, res): Promise<any> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST add new category (Admin only)
router.post('/', authenticateJWT, checkAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, image } = req.body;
    if (!name || !image) {
      return res.status(400).json({ message: 'Name and Image are required' });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({ name, image });
    await category.save();

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT edit category (Admin only)
router.put('/:id', authenticateJWT, checkAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, image } = req.body;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name;
    if (image) category.image = image;

    await category.save();
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE category (Admin only)
router.delete('/:id', authenticateJWT, checkAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
