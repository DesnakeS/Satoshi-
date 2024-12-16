const nodemailer = require('nodemailer');

// Configuration du transporteur
const transporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
        user: 'Soumshop@yahoo.com', // Votre adresse email
        pass: 'mxjwvzuuztevyqll', // Mot de passe d'application Gmail
    }
});

// Fonction pour envoyer la notification de commande
const SendOrderNotification = async (orderDetails) => {
    try {
        // Options de l'email
        const mailOptions = {
            from: 'Soumshop@yahoo.com', // Adresse expéditeur (doit être votre email Gmail)
            to: 'Soumshop@yahoo.com', // Adresse destinataire (ou toute autre adresse de réception)
            subject: 'Nouvelle commande reçue',
            text: `Bonjour, une nouvelle commande a été passée par le client ${orderDetails.clientName}.
            
Détails de la commande :
- Produits : ${orderDetails.productName}
- Quantité : ${orderDetails.quantity}
- Montant total : ${orderDetails.totalAmount}€
- Lieu : ${orderDetails.lieu}
- Téléphone : ${orderDetails.phoneNumber}

Merci de vérifier la commande dans le système.`,
        };

        // Envoi de l'email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé : ', info.response);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error.message);
    }
};

module.exports = {
    SendOrderNotification,
};
