import express from 'express';
import News from '../models/News.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 12, sort = '-publicationDate' } = req.query;
        
        const news = await News.find({})
            .sort(sort)
            .limit(parseInt(limit))
            // 👇 ESTO ES CRÍTICO: Trae el nombre real de la categoría
            .populate('categories', 'name'); 

        res.status(200).json({ news });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener noticias", error: error.message });
    }
});

export default router;