const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Créer une session Stripe
const createCheckoutSession = async (req, res) => {
    const { items } = req.body;

    try {
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'eur', // Change en fonction de ta devise
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100, // Stripe prend le montant en centimes
            },
            quantity: item.quantity,
        }));

        // Crée la session Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `http://localhost:5173/confirmOrder?session_id={CHECKOUT_SESSION_ID}`,  // Redirection après paiement réussi,
            cancel_url: 'http://localhost:3000/cancel',
        });

        res.status(200).json({ id: session.id });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports={createCheckoutSession}
