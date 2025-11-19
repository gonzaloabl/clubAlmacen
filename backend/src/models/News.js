// backend/src/models/News.js
import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    link: { type: String, required: true, unique: true }, // Clave única para evitar duplicados
    source: { type: String }, // Ej: "SoyValparaíso", "BioBioChile"
    publicationDate: { type: Date, default: Date.now },
    // Relación con las categorías (Financiero, Leyes, Valparaíso)
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
}, { timestamps: true });

export default mongoose.model('News', newsSchema); 
// Nota: La colección en MongoDB se llamará automáticamente 'news'