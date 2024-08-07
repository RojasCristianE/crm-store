import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import turso from '../../db/config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { rows: customers } = await turso.execute('SELECT * FROM customers');
        res.render('customers/index', { customers, title: 'Todos los Clientes' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/nuevo/', async ({ query: { name } }, res) => res.render('customers/new', { name, title: 'Nuevo Cliente' }));

router.post('/nuevo/', async ({ body: { name, phone } }, res) => {
    try {
        const uuid = uuidv4();

        await turso.execute({
            sql: "INSERT INTO customers (uuid, name, phone, debt) VALUES (?, ?, ?, 0)",
            args: [uuid, name, phone]
        });

        res.redirect('/clientes/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/:id/', async ({ params: { id } }, res) => {

    const { rows: [customer] } = await turso.execute({
        sql: "SELECT * FROM customers WHERE id = ?",
        args: [id]
    });

    const { rows: purchases = [] } = await turso.execute({
        sql: "SELECT * FROM purchases WHERE customerId = ?",
        args: [id]
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
        args: [id]
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

    res.render('customers/id', { customer, movements });
});

router.get('/:id/compra', async ({ params: { id } }, res) => {
    const { rows: [customer] } = await turso.execute({
        sql: "SELECT * FROM customers WHERE id = ?",
        args: [id]
    });

    res.render('customers/purchase', { customer, title: `Registrar compra de ${customer.name}` });
});

router.post('/:customerId/compra', async ({ body: { productsData }, params: { customerId } }, res) => {
    try {
        const products = JSON.parse(productsData);

        const { rows: [{ id }] } = await turso.execute({
            sql: 'INSERT INTO purchases (customerId, date) VALUES (?, ?) RETURNING id',
            args: [customerId, new Date()]
        });

        let total = 0;
        for (const { name, quantity, price } of products) {
            await turso.execute({
                sql: 'INSERT INTO purchase_items (purchaseId, quantity, name, price, total) VALUES (?, ?, ?, ?, ?)',
                args: [id, quantity, name, price, quantity * price]
            });

            total += quantity * price;
        }

        await turso.execute({
            sql: 'UPDATE purchases SET total = ? WHERE id = ?',
            args: [total, id]
        });

        await turso.execute({
            sql: 'UPDATE customers SET debt = debt + ? WHERE id = ?',
            args: [total, id]
        });

        res.redirect(`/clientes/${customerId}`);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


router.get('/:id/pago', async ({ params: { id } }, res) => {
    const { rows: [customer] } = await turso.execute({
        sql: "SELECT * FROM customers WHERE id = ?",
        args: [id]
    });

    res.render('customers/payment', { customer, title: `Registrar pago de ${customer.name}` });
});

router.post('/:id/pago', async ({ body: { amount }, params: { id } }, res) => {
    await turso.execute({
        sql: 'INSERT INTO payments (customerId, amount, date) VALUES (?, ?, ?) RETURNING id',
        args: [id, amount, new Date()]
    });

    await turso.execute({
        sql: 'UPDATE customers SET debt = debt - ? WHERE id = ?',
        args: [amount, id]
    });

    res.redirect(`/clientes/${id}/`);
});

export default router;