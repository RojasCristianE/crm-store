import { DataTypes } from "sequelize";
import { UUIDV4 } from "sequelize";
import sequelize from '../config.js';

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.NUMBER,
        allowNull: false,
    },
    debt: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
});

Customer.associate = function(models) {
    Customer.hasMany(models.Purchase, { as: 'purchases' });
};

export default Customer;