import { DataTypes } from "sequelize";
import sequelize from '../config.js';
import Customer from './customer.js';

const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

Purchase.belongsTo(Customer, { foreignKey: 'customerId' });

export default Purchase;