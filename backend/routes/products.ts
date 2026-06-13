import { Router, Response } from 'express';
import { Product } from '../models/Product';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { checkAdmin } from '../middleware/admin';

const router = Router();

// GET all products with searching, filtering, and sorting
router.get('/', async (req, res): Promise<any> => {
  try {
    const { category, minPrice, maxPrice, rating, search, sortBy } = req.query;

    const filterQuery: any = {};

    // Searching
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtering by Category
    if (category) {
      filterQuery.category = category;
    }

    // Filtering by Price Range
    if (minPrice || maxPrice) {
      filterQuery.price = {};
      if (minPrice) filterQuery.price.$gte = Number(minPrice);
      if (maxPrice) filterQuery.price.$lte = Number(maxPrice);
    }

    // Filtering by Rating
    if (rating) {
      filterQuery.rating = { $gte: Number(rating) };
    }

    // Sorting
    let sortQuery: any = { createdAt: -1 }; // default newest
    if (sortBy) {
      switch (sortBy) {
        case 'priceAsc':
          sortQuery = { price: 1 };
          break;
        case 'priceDesc':
          sortQuery = { price: -1 };
          break;
        case 'popular':
          sortQuery = { rating: -1, reviewsCount: -1 };
          break;
        case 'newest':
        default:
          sortQuery = { createdAt: -1 };
          break;
      }
    }

    const products = await Product.find(filterQuery).sort(sortQuery);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product details
router.get('/:id', async (req, res): Promise<any> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST add product (Admin only)
router.post('/', authenticateJWT, checkAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      image,
      stock: Number(stock)
    });

    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT edit product (Admin only)
router.put('/:id', authenticateJWT, checkAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (image !== undefined) product.image = image;
    if (stock !== undefined) product.stock = Number(stock);

    await product.save();
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE product (Admin only)
router.delete('/:id', authenticateJWT, checkAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
