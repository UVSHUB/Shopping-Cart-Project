import { Router, Response } from 'express';
import { Cart } from '../models/Cart';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// GET user's cart (authenticated)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    let cart = await Cart.findOne({ userId }).populate('products.productId');

    if (!cart) {
      // Return empty cart structure
      cart = new Cart({ userId, products: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST update user's cart (authenticated)
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { products } = req.body; // Expects array of { productId, quantity }

    if (!Array.isArray(products)) {
      return res.status(400).json({ message: 'Products list must be an array' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products });
    } else {
      cart.products = products.map((item: any) => ({
        productId: item.productId,
        quantity: Math.max(1, Number(item.quantity))
      })) as any;
    }

    await cart.save();
    await cart.populate('products.productId');
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE clear user's cart (authenticated)
router.delete('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    let cart = await Cart.findOne({ userId });

    if (cart) {
      cart.products = [] as any;
      await cart.save();
    } else {
      cart = new Cart({ userId, products: [] });
      await cart.save();
    }

    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
