const db = require('../config/dbconfig');
const { SendOrderNotification } = require('../mailer');

            
const placeOrder = async (req, res) => {
    console.log('Données de requête reçues :', JSON.stringify(req.body, null, 2));
    const { user, cartItems, totalAmount, paymentMethod, order_status } = req.body;

    // Validation des données de la commande
    if (!user || !cartItems || !totalAmount || !paymentMethod) {
        console.error('Données incomplètes :', { user, cartItems, totalAmount, paymentMethod });
        return res.status(400).json({ error: 'Données de commande incomplètes.' });
    }

    try {
        // Convertir cartItems en JSON string
        const cartItemsJson = JSON.stringify(cartItems);

        // Requête SQL avec des placeholders
        const sql = `
            INSERT INTO \`order\` (
                email, username, ville, quartier, phoneNumber,
                paymentMethod, totalAmount, order_status, cartItems
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Préparer les valeurs dans l'ordre exact des placeholders
        const values = [
            user.email_customer,
            user.user_Name,
            user.ville,
            user.quartier,
            user.phoneNumber,
            paymentMethod,
            totalAmount,
            order_status || 'pending',
            cartItemsJson
        ];

        // Exécuter la requête
        db.query(sql, values, async (err, result) => {
            if (err) {
                console.error('Erreur détaillée lors de la création de la commande :', err);
                return res.status(500).json({ 
                    error: 'Erreur lors de la création de la commande.',
                    sqlError: err.message,
                    sqlState: err.sqlState,
                    sqlCode: err.code
                });
            }

            // Création réussie de la commande
            const orderId = result.insertId;

            try {
                // Appel de la fonction pour créer la session Stripe
                
                const session = await createCheckoutSession({
                    user, 
                    totalAmount, 
                    orderId, 
                    cartItems // Assurez-vous de passer cette valeur
                });
                // Réponse du serveur avec l'URL Stripe
                res.status(200).json({ 
                    url: session.url,
                    orderId: orderId 
                });

                // Notification par email (asynchrone)
                const orderDetails = {
                    clientName: user.user_Name,
                    productName: cartItems.map(item => item.productName).join(', '),
                    totalAmount: totalAmount,
                    lieu: `${user.quartier}, ${user.ville}`,
                    phoneNumber: user.phoneNumber,
                };

                await SendOrderNotification(orderDetails);
                console.log('Notification de commande envoyée avec succès.');
            } catch (stripeOrEmailError) {
                console.error('Erreur lors du traitement post-commande :', stripeOrEmailError);
            }
        });
    } catch (error) {
        console.error('Erreur globale lors de la création de la commande :', error.message);
        return res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
    }
};

// Fonctions de gestion des commandes
const getAllOrder = async (req, res) => {
    try {
        const query = 'SELECT * FROM `order`';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des commandes :', err);
                return res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error: err.message });
            }
            return res.status(200).json({ message: 'Commandes récupérées avec succès', data: results });
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes :', error.message);
        return res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error: error.message });
    }
};

const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM `order` WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération de la commande :', err);
                return res.status(500).json({ error: 'Erreur lors de la récupération de la commande.', details: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Commande non trouvée.' });
            }
            return res.json(results[0]);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la commande :', error.message);
        return res.status(500).json({ error: 'Erreur lors de la récupération de la commande.' });
    }
};

const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { orderStatus } = req.body;
    try {
        if (!orderStatus) {
            return res.status(400).json({ error: 'Le statut de la commande est requis.' });
        }
        const query = 'UPDATE `order` SET order_status = ? WHERE id = ?';
        db.query(query, [orderStatus, id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la mise à jour de la commande :', err);
                return res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande.', details: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Commande non trouvée.' });
            }
            return res.json({ message: 'Commande mise à jour avec succès.' });
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la commande :', error.message);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande.' });
    }
};

const deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM `order` WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la suppression de la commande :', err);
                return res.status(500).json({ error: 'Erreur lors de la suppression de la commande.', details: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Commande non trouvée.' });
            }
            return res.json({ message: 'Commande supprimée avec succès.' });
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de la commande :', error.message);
        return res.status(500).json({ error: 'Erreur lors de la suppression de la commande.' });
    }
};

module.exports = {
    placeOrder,
    getAllOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    
};
