import { DataTypes } from "sequelize";
import sequelize from '../config.js';
import Purchase from './purchase.js';

const PurchaseItem = sequelize.define('PurchaseItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId' });

export default PurchaseItem;