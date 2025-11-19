// backend/src/routes/newsRoutes.js
import express from 'express';
import News from '../models/News.js';

const router = express.Router();

// GET /api/news - Endpoint para obtener noticias
router.get('/', async (req, res) => {
    try {
        // Obtenemos los parámetros de query (limit, sort, category)
        const { limit = 12, sort = '-publicationDate', category } = req.query;
        let filter = {};

        // Lógica de filtrado por categoría (opcional)
        if (category) {
            filter.categories = category;
        }

        const news = await News.find(filter)
            .sort(sort)
            .limit(parseInt(limit)); // Asegura que el límite sea un entero

        res.status(200).json({ news });
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ message: "Error al obtener noticias", error: error.message });
    }
});

export default router;