import sequelize from "./config.js";
import Customer from "./models/customer.js";
import Payment from "./models/payment.js";
import Purchase from "./models/purchase.js";
import PurchaseItem from "./models/purchaseItem.js";

Customer.hasMany(Purchase, { foreignKey: 'customerId' });
Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId' });

sequelize.sync()
    .then(() => console.log('Base de datos sincronizada'))
    .catch(console.error);

export { Customer, Payment, Purchase, PurchaseItem };