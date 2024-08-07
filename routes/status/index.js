import express from 'express';
import turso from '../../db/config.js';

const router = express.Router();

router.get('/:uuid/', async ({ params: { uuid } }, res) => {
    try {
        const { rows: [customer] } = await turso.execute({
            sql: "SELECT * FROM customers WHERE uuid = ?",
            args: [uuid]
        });

        const { rows: purchases = [] } = await turso.execute({
            sql: "SELECT * FROM purchases WHERE customerId = ?",
            args: [customer.id]
        });

        if (!!purchases?.length) {
            for (const purchase of purchases) {
                const { rows: purchaseItems } = await turso.execute({
                    sql: 'SELECT * FROM purchase_items WHERE purchaseId = ?',
                    args: [purchase.id]
                });

                purchase.purchaseItems = purchaseItems;
            }
        }

        const { rows: payments = [] } = await turso.execute({
            sql: 'SELECT * FROM payments WHERE customerId = ?',
            args: [customer.id]
        });

        const movements = [
            ...purchases.map(purchase => ({
                ...purchase,
                type: 'purchase'
            })),
            ...payments.map(payment => ({
                ...payment,
                type: 'payment'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.render('status/uuid', { customer, movements });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default router;