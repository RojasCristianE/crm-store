import express from 'express';
import { Customer, Payment, Purchase, PurchaseItem } from '../../db/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.render('customers/index', { customers });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/nuevo/', async ({query: {name}}, res) => res.render('customers/new', {name}));

router.post('/nuevo/', async ({body}, res) => {
    try {
        const customer = await Customer.create(body);
        res.redirect('/clientes/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/:id/', async ({params: {id}}, res) => {
    try {
        const customer = await Customer.findOne({
            where: { id },
            include: [
                {
                    model: Purchase,
                    include: [ { model: PurchaseItem } ]
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

        res.render('customers/id', { customer, movements });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/:id/compra', async ({params: {id}}, res) => {
    try {
        const customer = await Customer.findOne({ where: { id } });
        res.render('customers/purchase', { customer });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/:id/compra', async (req, res) => {
    try {
        const products = JSON.parse(req.body.productsData);
        const customerId = req.params.id;

        const customer = await Customer.findOne({ where: { id: customerId } });
        const purchase = await Purchase.create({ customerId, date: new Date() });

        let total = 0;
        for (const { name, quantity, price } of products) {
            await PurchaseItem.create({ purchaseId: purchase.id, quantity, name, price, total: quantity * price });
            
            total += quantity * price;
        }

        purchase.total += total;
        await purchase.save();

        customer.debt += total;
        await customer.save();

        res.redirect(`/clientes/${customerId}`);
    } catch (error) {
        console.error('Error al registrar la compra:', error);
        res.status(500).send('Error al registrar la compra');
    }
});


router.get('/:id/pago', async ({params: {id}}, res) => {
    try {
        const customer = await Customer.findOne({ where: { id } });
        res.render('customers/payment', { customer });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/:id/pago', async (req, res) => {
    try {
        const { amount } = req.body;
        const { id } = req.params;

        const customer = await Customer.findOne({ where: { id } });

        await Payment.create({ customerId: id, amount, date: new Date() });
        
        customer.debt -= amount;
        await customer.save();

        res.redirect(`/clientes/${id}/`);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default router;