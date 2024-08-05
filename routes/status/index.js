import express from 'express';
import { Customer, Purchase, PurchaseItem, Payment } from '../../db/index.js';

const router = express.Router();

router.get('/:uuid/', async ({ params: { uuid } }, res) => {
    try {
        const customer = await Customer.findOne({
            where: { uuid },
            include: [
                {
                    model: Purchase,
                    include: [{ model: PurchaseItem }]
                },
                {
                    model: Payment,
                }
            ]
        });

        const movements = [
            ...customer.Purchases.map(purchase => ({ ...purchase.toJSON(), type: 'purchase' })),
            ...customer.Payments.map(payment => ({ ...payment.toJSON(), type: 'payment' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.render('status/uuid', { customer, movements });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default router;