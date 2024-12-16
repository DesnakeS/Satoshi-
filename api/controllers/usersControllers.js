// userController.js

const db = require('../config/dbconfig');

// Create a new user
const createUsers = (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(201).send({ id: results.insertId, username, password });
    });
};

// Get all users
const getAllUsers = (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results);
    });
};

// Get a user by ID
const getUsersById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('User not found');
        res.status(200).send(results[0]);
    });
};

// Update a user
const updateUsers = (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    const query = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
    db.query(query, [username, password, id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.affectedRows === 0) return res.status(404).send('User not found');
        res.status(200).send('User updated successfully');
    });
};

// Delete a user
 const deleteUsers = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.affectedRows === 0) return res.status(404).send('User not found');
        res.status(200).send('User deleted successfully');
    });
};
module.exports = {  createUsers,   getAllUsers,   getUsersById,   updateUsers,   deleteUsers }; 