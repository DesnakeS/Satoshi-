const db = require('../config/dbconfig');
const multer = require('multer');
const jwt = require('jsonwebtoken');

// Configuration de Multer pour le stockage des images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Dossier de destination des fichiers uploadés
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Nom du fichier avec un timestamp pour éviter les conflits
    }
});

// Filtrer les fichiers pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté'), false);
    }
};

// Middleware Multer pour gérer l'upload des fichiers
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite de taille de fichier à 5 Mo
    },
    fileFilter: fileFilter
}).single('image'); // Assurez-vous que le champ image du formulaire correspond à celui-ci

// Obtenir tous les produits pr filtrage de categrie
const getAllProducts = (req, res) => {
    const sql = 'SELECT * FROM product';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de l\'affichage des produits', error: err });
      return res.status(200).json({ message: 'Chargement réussi des produits', data: results });
    });
  };
  
  // obtenir les produits par categorie
  const getProductByCategorie = (req, res) => {
    const categorie = req.params.categorie;
    const sql = 'SELECT * FROM product WHERE categorie = ?';

    // Utiliser la méthode `query` avec les paramètres pour éviter les injections SQL
    db.query(sql, [categorie], (err, results) => {
        if (err) {
            return res.status(500).send({ error: err.message }); // renvoie un message d'erreur lisible
        }
        res.json(results);
    });
};


// Backend
// Importer la connexion à la base de données MySQL
const getProductDetailsByCategory = (req, res) => {
    const { categorie, productId } = req.params;
    
    console.log('Paramètres reçus:', { categorie, productId }); // Debug log

    const query = `
        SELECT id, name, description, price, image, categorie
        FROM product
        WHERE id = ? AND categorie = ?
    `;

    db.query(query, [productId, categorie], (error, results) => {
        if (error) {
            console.error('Erreur SQL:', error);
            return res.status(500).json({ message: 'Erreur serveur', error });
        }
        
        console.log('Résultat de la requête:', results); // Debug log
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                message: 'Produit non trouvé',
                debug: { categorie, productId } 
            });
        }

        res.status(200).json(results[0]);
    });
};


// Contrôleur pour afficher les détails d'un produit d'une catégorie sélectionnée
const getProductById = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM product WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la récupération du produit', error: err });
      return res.status(200).json({message:'produit afficher avec succes ',result});
    });
  };
  
// Créer un nouveau produit avec gestion de l'image
const addProduct = (req, res) => {
    upload(req, res, async (error) => { 
        if (error) {
            console.error("Erreur lors du téléchargement de l'image :", error);
            return res.status(400).json({ message: "Erreur lors du téléchargement de l'image." });
        }
        
        // Vérification des champs requis
        const { name, price, categorie, description } = req.body;
        if (!name || !price || !categorie || !description) {
            return res.status(400).json({ message: 'Tous les champs requis doivent être fournis.' });
        }
       
        // Gestion de l'image
        let imagePath = null;
        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
        } else {
            imagePath = '/uploads/default_image.jpg'; // Définir une image par défaut
        }

        try {
            // Insertion des données dans la base de données
            await db.query(
                'INSERT INTO product (name, price, categorie, description, image) VALUES (?, ?, ?, ?, ?)',
                [name, price, categorie, description, imagePath]
            );
            res.status(201).json({ message: 'Produit ajouté avec succès' });
        } catch (error) {
            console.error("Erreur lors de l'ajout du produit :", error);
            res.status(500).json({ message: "Erreur serveur lors de l'ajout du produit." });
        }
    });
};


// Mettre à jour un produit avec gestion de l'image

const updateProduct = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: 'Erreur lors de l\'upload de l\'image: ' + err.message });
        }
        
        const id = req.params.id;
        const { name, price, description, categorie } = req.body;
        const imagePath = req.file ? '/uploads/' + req.file.filename : req.body.image;

        // Requête SQL corrigée
        const sql = 'UPDATE product SET name = ?, image = ?, price = ?, description = ?, categorie = ? WHERE id = ?';
        
        // Log pour debug
        console.log('Données reçues:', { name, imagePath, price, description, categorie, id });

        db.query(sql, [name, imagePath, price, description, categorie, id], (err, results) => {
            if (err) {
                console.error('Erreur SQL:', err);
                return res.status(500).json({ error: 'Erreur serveur : ' + err.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }
            res.status(200).json({ 
                message: 'Produit mis à jour avec succès', 
                data: results,
                imageUrl: imagePath 
            });
        });
    });
};
// Supprimer un produit
const deleteProduct = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM product WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({ message: 'Produit supprimé avec succès', data: results });
    });
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductByCategorie,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductDetailsByCategory
}

