const db = require('../config/dbconfig'); 
const jwt = require('jsonwebtoken');

// Fonction pour obtenir tous les produits dans le panier
const getAllCart = (req, res) => {
    const sql = 'SELECT * FROM cart';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de l\'affichage du panier', error: err });
        }
        return res.status(200).json({ message: 'Chargement réussi du panier', data: results });
    });
};

// Fonction pour obtenir un produit dans le panier par son ID
const getCartById = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM cart WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération du panier', error: err });
        }
        return res.status(200).json(result);
    });
};

// Fonction pour ajouter un produit au panier
const addCart = (req, res) => {
    const {  name, price, description,image,quantity } = req.body;
    
    const sql = 'INSERT INTO cart ( name, price, description, image,quantity) VALUES (?, ?, ?, ?,?)'; [ name, price, description, image,quantity];

    const values = [ name, price, description, image,quantity];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ 
                message: 'Échec lors de l\'envoi des données', 
                error: err,
                sqlMessage: err.sqlMessage,
                sqlState: err.sqlState
            });
        }
        return res.status(200).json({ message: 'Produit ajouté avec succès dans le panier', data: results });
    });
};

// Fonction pour mettre à jour un produit dans le panier
const updateCart = (req, res) => {
    const id = req.params.id;
    const { name, price, description, image, quantity } = req.body;

    console.log('Données reçues:', { id, name, price, description, image, quantity });

    // Construire la requête SQL avec les champs à mettre à jour
    let sql = 'UPDATE cart SET ';
    const values = [];

    if (name !== undefined) {
        sql += 'name = ?, ';
        values.push(name);
    }
    if (price !== undefined) {
        sql += 'price = ?, ';
        values.push(price);
    }
    if (description !== undefined) {
        sql += 'description = ?, ';
        values.push(description);
    }
    if (image !== undefined) {
        sql += 'image = ?, ';
        values.push(image);
    }
    if (quantity !== undefined) {
        sql += 'quantity = ?, ';
        values.push(quantity);
    }

    // Supprimer la virgule finale
    sql = sql.slice(0, -2);
    sql += ' WHERE id = ?';
    values.push(id);

    console.log('Requête SQL:', sql);
    console.log('Valeurs:', values);

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du panier', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Aucun produit trouvé avec cet ID' });
        }
        return res.status(200).json({ message: 'Panier des produits mis à jour avec succès', data: results });
    });
};
// Fonction pour supprimer un produit du panier
const deleteCart = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM cart WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Échec lors de la suppression des produits dans le panier', error: err });
        }
        return res.status(200).json({ message: 'Produit supprimé avec succès', data: results });
    });
};

// Exportation des fonctions
module.exports = {
    getAllCart,
    getCartById,
    addCart,
    updateCart,
    deleteCart
};
