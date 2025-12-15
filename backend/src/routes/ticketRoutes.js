import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Ticket from '../models/Ticket.js';

const router = express.Router();

// @desc    Crear un ticket nuevo
// @route   POST /api/tickets
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const ticket = await Ticket.create({
      user: req.user._id,
      title,
      description,
      category,
      priority
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error creando ticket', error: error.message });
  }
});

// @desc    Obtener MIS tickets (para Locatario/Proveedor)
// @route   GET /api/tickets/my-tickets
router.get('/my-tickets', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo tickets' });
  }
});

// @desc    Obtener TODOS los tickets (Para el Admin Técnico)
// @route   GET /api/tickets/all
router.get('/all', protect, async (req, res) => {
  try {
    // Verificamos que sea Admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
    }

    const tickets = await Ticket.find({})
        .populate('user', 'name email phone region')
        .sort({ createdAt: -1 });
        
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo tickets' });
  }
});

export default router;