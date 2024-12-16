const db = require('../config/dbconfig');
const jwt = require('jsonwebtoken');

// Fonction pour récupérer tous les contacts
const getAllContact = (req, res) => {
    const sql = 'SELECT * FROM contact';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des contacts', error: err }); 
        return res.status(200).json({ message: 'Contacts récupérés avec succès', data: results }); 
    });
};

// Fonction pour récupérer un contact par son ID
const getContactById = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM contact WHERE id=?';
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération d\'un contact', error: err });
        return res.status(200).json({ message: 'Contact récupéré avec succès', data: results });
    });
};

// Fonction pour ajouter un contact
const addContact = (req, res) => {
    const { username, email, message } = req.body;
    const sql = 'INSERT INTO contact(username, email, message) VALUES(?, ?, ?)';
    db.query(sql, [username, email, message], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de l\'ajout d\'un contact', error: err });
        return res.status(201).json({ message: 'Contact ajouté avec succès', data: results });
    });
};

// Fonction pour mettre à jour un contact
const updateContact = (req, res) => {
    const id = req.params.id;
    const { username, email, message } = req.body;
    const sql = 'UPDATE contact SET username=?, email=?, message=? WHERE id=?';
    db.query(sql, [username, email, message, id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la modification du contact', error: err });
        return res.status(200).json({ message: 'Contact modifié avec succès', data: results });
    });
};

// Fonction pour supprimer un contact
const deleteContact = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM contact WHERE id=?';
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la suppression du contact', error: err });
        return res.status(200).json({ message: 'Contact supprimé avec succès', data: results });
    });
};

module.exports = {
    getAllContact,
    getContactById,
    addContact,
    updateContact,
    deleteContact
};
