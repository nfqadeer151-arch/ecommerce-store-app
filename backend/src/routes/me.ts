import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Return the currently authenticated user (id, name, email)
router.get('/me', authenticate, (req, res) => {
  const user = (req as any).user; // set by auth middleware
  if (!user) return res.status(401).json({ message: 'Unauthenticated' });
  res.json({ id: user.id, name: user.name, email: user.email });
});

export default router;
