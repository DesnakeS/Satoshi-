const db = require('../config/dbconfig'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    const { username, password, email } = req.body;
    
    // Vérifiez que les champs requis sont bien fournis
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        // Vérifier si l'email existe déjà
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, emailResults) => {
            if (err) {
                console.error('Erreur lors de la vérification email:', err);
                return res.status(500).json({ error: 'Erreur serveur interne' });
            }
            
            console.log('Email check result:', emailResults[0]);
            
            if (emailResults && emailResults.length > 0) {
                return res.status(400).json({ error: 'Cet email est déjà utilisé' });
            }

            // Vérifier si le username existe déjà
            db.query('SELECT * FROM users WHERE username = ?', [username], async (err, usernameResults) => {
                if (err) {
                    console.error('Erreur lors de la vérification username:', err);
                    return res.status(500).json({ error: 'Erreur serveur interne' });
                }

                console.log('Username check result:', usernameResults[0]);
                
                if (usernameResults && usernameResults.length > 0) {
                    return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
                }

                try {
                    // Hacher le mot de passe
                    const hash = await bcrypt.hash(password, saltRounds);
                    
                    // Insérer l'utilisateur avec la date actuelle
                    const insertQuery = 'INSERT INTO users (username, email, password, roles, created_at, token) VALUES (?, ?, ?, ?, NOW(), ?)';
                    db.query(insertQuery, [username, email, hash, 'user', ''], (err, result) => {
                        if (err) {
                            console.error('Erreur lors de l\'insertion:', err);
                            return res.status(500).json({ error: 'Erreur serveur interne' });
                        }

                        console.log('Insert result:', result);

                        // Générer un token JWT pour le nouvel utilisateur
                        const token = jwt.sign(
                            {
                                id: result.insertId,
                                username,
                                email,
                                roles: 'user'
                            },
                            JWT_SECRET,
                            { expiresIn: '24h' }
                        );

                        // Mettre à jour le token dans la base de données
                        db.query('UPDATE users SET token = ? WHERE id = ?', [token, result.insertId], (err) => {
                            if (err) {
                                console.error('Erreur lors de la mise à jour du token:', err);
                                return res.status(500).json({ error: 'Erreur serveur interne' });
                            }

                            res.status(201).json({ 
                                message: 'Inscription réussie',
                                userId: result.insertId,
                                token
                            });
                        });
                    });
                } catch (hashError) {
                    console.error('Erreur lors du hashage du mot de passe:', hashError);
                    return res.status(500).json({ error: 'Erreur serveur interne' });
                }
            });
        });
    } catch (err) {
        console.error('Erreur base de données détaillée:', err);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ error: 'Erreur serveur interne' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    
    // Validation des entrées
    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe sont requis' });
    }

    try {
        // Vérification de l'email
        const userQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(userQuery, [email], async (err, results) => {
            if (err) {
                console.error('Erreur lors de la recherche de l\'utilisateur:', err);
                return res.status(500).json({ error: 'Erreur serveur interne' });
            }

            // Vérification de l'existence de l'utilisateur
            if (!results || results.length === 0) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            const user = results[0];

            // Vérification du mot de passe
            const isPasswordCorrect = await bcrypt.compare(
                password, 
                user.password
            );

            if (!isPasswordCorrect) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            // Vérification de la présence de la clé secrète JWT
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET) {
                console.error('JWT_SECRET n\'est pas défini');
                return res.status(500).json({ error: 'Erreur de configuration du serveur' });
            }

            // Création du token JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Mise à jour du token dans la base de données
            const updateTokenQuery = 'UPDATE users SET token = ? WHERE id = ?';
            db.query(updateTokenQuery, [token, user.id], (updateErr) => {
                if (updateErr) {
                    console.error('Erreur lors de la mise à jour du token:', updateErr);
                    return res.status(500).json({ error: 'Erreur serveur interne' });
                }

                // Réponse de succès
                res.status(200).json({
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        roles: user.roles
                    },
                    token
                });
            });
        });
    } catch (err) {
        console.error('Erreur détaillée lors de la connexion:', err);
        res.status(500).json({
            error: 'Erreur serveur interne',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = { login,register };