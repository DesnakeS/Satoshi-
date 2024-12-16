const db = require('../config/dbconfig');
const util = require('util');

// Convertir db.query en Promesse si nécessaire
db.query = util.promisify(db.query);

const getCategories = async (req, res) => {
    try {
        // Récupérer toutes les catégories
        const results = await db.query('SELECT * FROM categories');
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                message: 'Aucune catégorie trouvée', 
                data: [] 
            });
        }

        res.status(200).json({ 
            message: 'Catégories récupérées avec succès', 
            data: results 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
        res.status(500).json({ 
            message: 'Erreur serveur lors de la récupération des catégories.', 
            data: [] 
        });
    }
};

const getMainCategories = async (req, res) => {
    try {
        // Récupérer uniquement les catégories principales (sans parent)
        const results = await db.query('SELECT * FROM categories WHERE parent_id IS NULL');

        if (!results || results.length === 0) {
            return res.status(404).json({ 
                message: 'Aucune catégorie principale trouvée', 
                data: [] 
            });
        }

        res.status(200).json({ 
            message: 'Catégories principales récupérées avec succès', 
            data: results 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories principales :', error);
        res.status(500).json({ 
            message: 'Erreur serveur lors de la récupération des catégories principales.', 
            data: [] 
        });
    }
};

const getSubcategories = async (req, res) => {
    const { categoryId } = req.params;
    try {
        // Récupérer les sous-catégories en fonction de l'ID de la catégorie parent
        const results = await db.query('SELECT * FROM categories WHERE parent_id = ?', [categoryId]);

        if (!results || results.length === 0) {
            return res.status(404).json({ 
                message: 'Aucune sous-catégorie trouvée', 
                data: [] 
            });
        }

        res.status(200).json({ 
            message: 'Sous-catégories récupérées avec succès', 
            data: results 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des sous-catégories :', error);
        res.status(500).json({ 
            message: 'Erreur serveur lors de la récupération des sous-catégories.', 
            data: [] 
        });
    }
};

module.exports = {
    getCategories,
    getMainCategories,
    getSubcategories
};
