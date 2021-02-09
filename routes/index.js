import { Router } from 'express';
const router = Router();
import { ensureAuth, ensureGuest } from '../middleware/auth.js';

import Story from '../models/Story.js';

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', { layout: 'login' });
});

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render('dashboard', { name: req.user.firstName, stories });
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

export default router;