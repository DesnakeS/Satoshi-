const express = require('express');
const bodyParser = require('body-parser');
const db = require('../config/dbconfig');
const { SendOrderNotification } = require('../mailer');
const {
    ApiError,
    Client,
    Environment,
    LogLevel,
    OrdersController,
    PaymentsController,
} = require("@paypal/paypal-server-sdk");

// Validate required environment variables
const requiredEnvVars = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', ];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Error: Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

const {
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    PORT = 8808,
} = process.env;

// Configure PayPal Client with robust error handling
const createPayPalClient = () => {
    try {
        return new Client({
            clientCredentialsAuthCredentials: {
                oAuthClientId: PAYPAL_CLIENT_ID,
                oAuthClientSecret: PAYPAL_CLIENT_SECRET,
            },
            timeout: 5000, // 5 second timeout
            environment: Environment.Sandbox,
            logging: {
                logLevel: LogLevel.Info,
                logRequest: { logBody: true },
                logResponse: { logHeaders: true },
            },
        });
    } catch (error) {
        console.error('Failed to initialize PayPal client:', error);
        throw new Error('PayPal client initialization failed');
    }
};

const client = createPayPalClient();
const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

const app = express();
app.use(bodyParser.json());

/**
 * Validates cart data for order creation
 * @param {Object} cart - Cart object to validate
 * @throws {Error} If cart is invalid
 */
const validateCartData = (cart) => {
    if (!cart || !cart.total || cart.total <= 0) {
        throw new Error('Invalid cart: Total amount must be greater than zero');
    }
    if (!Array.isArray(cart.items) || cart.items.length === 0) {
        throw new Error('Invalid cart: No items found');
    }
};

/**
 * Create an order to start the transaction.
 * @param {Object} cart - Cart details for order creation
 */
const createOrder = async (cart) => {
    try {
        // Validate cart data
        validateCartData(cart);

        const collect = {
            body: {
                intent: "CAPTURE",
                purchaseUnits: [
                    {
                        amount: {
                            currencyCode: "USD",
                            value: cart.total.toFixed(2),
                        },
                        items: cart.items.map(item => ({
                            name: item.productName,
                            quantity: item.quantity,
                            unit_amount: {
                                currency_code: "USD",
                                value: item.price.toFixed(2)
                            }
                        }))
                    },
                ],
            },
            prefer: "return=minimal",
        };

        const { body, ...httpResponse } = await ordersController.ordersCreate(collect);
        
        return {
            jsonResponse: JSON.parse(body),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        console.error('Order creation failed:', error);
        
        if (error instanceof ApiError) {
            throw new Error(`PayPal API Error: ${error.message}`);
        }
        
        throw error;
    }
};

// createOrder route
app.post("/api/orders", async (req, res) => {
    try {
        const { cart } = req.body;
        
        if (!cart) {
            return res.status(400).json({ error: "Cart data is required" });
        }
        
        const { jsonResponse, httpStatusCode } = await createOrder(cart);
        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).json({ 
            error: "Failed to create order", 
            details: error.message 
        });
    }
});

/**
 * Capture payment for the created order to complete the transaction.
 * @param {string} orderID - PayPal Order ID
 */
const captureOrder = async (orderID) => {
    if (!orderID) {
        throw new Error('Order ID is required');
    }

    try {
        const collect = {
            id: orderID,
            prefer: "return=minimal",
        };

        const { body, ...httpResponse } = await ordersController.ordersCapture(collect);
        
        return {
            jsonResponse: JSON.parse(body),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        console.error('Order capture failed:', error);
        
        if (error instanceof ApiError) {
            throw new Error(`PayPal API Capture Error: ${error.message}`);
        }
        
        throw error;
    }
};

// captureOrder route
app.post("/api/orders/:orderID/capture", async (req, res) => {
    try {
        const { orderID } = req.params;
        
        if (!orderID) {
            return res.status(400).json({ error: "Order ID is required" });
        }
        
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to capture order:", error);
        res.status(500).json({ 
            error: "Failed to capture order", 
            details: error.message 
        });
    }
});
const placeOrder = (req, res) => {
    console.log('Données de requête reçues :', JSON.stringify(req.body, null, 2));

    const { user, cartItems, totalAmount, paymentMethod, order_status } = req.body;

    // Validation des données de la commande
    if (!user || !cartItems || !Array.isArray(cartItems) || !totalAmount || !paymentMethod) {
        console.error('Données incomplètes :', { user, cartItems, totalAmount, paymentMethod });
        return res.status(400).json({ error: 'Données de commande incomplètes.' });
    }

    try {
        const cartItemsJson = JSON.stringify(cartItems);
        const sql = `
            INSERT INTO orders (
                email, username, ville, quartier, phoneNumber,
                paymentMethod, totalAmount, order_status, cartItems
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            user.email_customer,
            user.user_Name,
            user.ville,
            user.quartier,
            user.phoneNumber,
            paymentMethod,
            totalAmount,
            order_status || 'pending',
            cartItemsJson,
        ];

        // Exécution de la requête SQL
        db.query(sql, values, async (err, result) => {
            if (err) {
                console.error('Erreur lors de la création de la commande :', err);
                return res.status(500).json({
                    error: 'Erreur lors de la création de la commande.',
                    details: err.message,
                });
            }

            const orderId = result.insertId;
            console.log(`Commande créée avec succès : Order ID ${orderId}`);

            try {
                // Notification par email
                const orderDetails = {
                    clientName: user.user_Name,
                    productName: cartItems.map(item => item.productName).join(', '),
                    totalAmount: totalAmount,
                    lieu: `${user.quartier}, ${user.ville}`,
                    phoneNumber: user.phoneNumber,
                };

                await SendOrderNotification(orderDetails);
                console.log('Notification de commande envoyée avec succès.');

                // Réponse de succès
                return res.status(201).json({
                    message: 'Commande créée avec succès.',
                    orderId,
                });
            } catch (emailError) {
                console.error('Erreur lors de l\'envoi de la notification :', emailError.message);
                return res.status(500).json({
                    error: 'Commande créée, mais échec de l\'envoi de la notification.',
                    details: emailError.message,
                });
            }
        });
    } catch (error) {
        console.error('Erreur globale lors de la création de la commande :', error.message);
        return res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
    }
};



        
               
// Add additional robust error handling to existing functions
const getAllOrder = async (req, res) => {
    try {
        const query = 'SELECT * FROM orders';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Orders retrieval database error:', err);
                return res.status(500).json({ 
                    error: 'Database error during orders retrieval', 
                    details: err.message 
                });
            }
            return res.status(200).json({ 
                message: 'Orders retrieved successfully', 
                data: results 
            });
        });
    } catch (error) {
        console.error('Global orders retrieval error:', error.message);
        return res.status(500).json({ 
            error: 'Unexpected error during orders retrieval', 
            details: error.message 
        });
    }
};

// Similar error handling improvements for other functions...
const getOrderById = async (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        const query = 'SELECT * FROM orders WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Order retrieval database error:', err);
                return res.status(500).json({ 
                    error: 'Database error during order retrieval', 
                    details: err.message 
                });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            return res.json(results[0]);
        });
    } catch (error) {
        console.error('Global order retrieval error:', error.message);
        return res.status(500).json({ 
            error: 'Unexpected error during order retrieval', 
            details: error.message 
        });
    }
};

const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { orderStatus } = req.body;

    // Validation
    if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
    }
    
    if (!orderStatus) {
        return res.status(400).json({ error: 'Order status is required' });
    }

    try {
        const query = 'UPDATE orders SET order_status = ? WHERE id = ?';
        db.query(query, [orderStatus, id], (err, result) => {
            if (err) {
                console.error('Order update database error:', err);
                return res.status(500).json({ 
                    error: 'Database error during order update', 
                    details: err.message 
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            return res.json({ 
                message: 'Order updated successfully',
                updatedStatus: orderStatus 
            });
        });
    } catch (error) {
        console.error('Global order update error:', error.message);
        return res.status(500).json({ 
            error: 'Unexpected error during order update', 
            details: error.message 
        });
    }
};

const deleteOrder = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        const query = 'DELETE FROM orders WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Order deletion database error:', err);
                return res.status(500).json({ 
                    error: 'Database error during order deletion', 
                    details: err.message 
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            return res.json({ 
                message: 'Order deleted successfully',
                deletedOrderId: id 
            });
        });
    } catch (error) {
        console.error('Global order deletion error:', error.message);
        return res.status(500).json({ 
            error: 'Unexpected error during order deletion', 
            details: error.message 
        });
    }
};

module.exports = {
    placeOrder,
    getAllOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    createOrder,
    captureOrder
};