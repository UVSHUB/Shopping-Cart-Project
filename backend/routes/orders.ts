import { Router, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { User } from '../models/User';
import { Cart } from '../models/Cart';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { checkAdmin } from '../middleware/admin';

const router = Router();

// GET admin dashboard stats (Admin only)
router.get('/stats', authenticateJWT, checkAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Extra metrics for premium dashboard feel
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.grandTotal, 0);

    res.json({
      totalProducts,
      totalCategories,
      totalUsers,
      totalOrders,
      totalRevenue
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST checkout - place order (Authenticated)
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { customerInfo, products, subtotal, tax, deliveryFee, grandTotal } = req.body;

    if (!customerInfo || !products || products.length === 0) {
      return res.status(400).json({ message: 'Customer info and product list are required' });
    }

    // 1. Verify stock levels for all products and update inventory
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // 2. Reduce stock levels
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // 3. Save order
    const order = new Order({
      userId,
      customerInfo,
      products,
      subtotal,
      tax,
      deliveryFee,
      grandTotal,
      status: 'completed' // Checkout is marked completed on payment gate coming soon simulation
    });

    await order.save();

    // 4. Clear user's cart in the database
    await Cart.findOneAndUpdate({ userId }, { products: [] });

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET user orders or all orders if Admin (Authenticated)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let orders;
    if (role === 'admin') {
      // Admin gets all orders
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      // Customer gets their own orders
      orders = await Order.find({ userId }).sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
