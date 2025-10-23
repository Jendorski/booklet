/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
'use strict';
const { DataTypes } = require('@sequelize/core');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('bookings', {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            apartmentUUID: {
                type: DataTypes.STRING,
                allowNull: false
            },
            reference: {
                type: DataTypes.STRING,
                allowNull: false
            },
            guestUUID: {
                type: DataTypes.UUID,
                allowNull: false
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'scheduled'
            },
            bookingDate: {
                type: DataTypes.DATE
            },
            checkInDate: {
                type: DataTypes.DATE
            },
            checkOutDate: {
                type: DataTypes.DATE
            },
            numberOfNights: {
                type: DataTypes.INTEGER
            },
            totalAmountPaid: {
                type: DataTypes.INTEGER
            },
            cautionFee: {
                type: DataTypes.INTEGER
            },
            bookingCost: {
                type: DataTypes.FLOAT
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            deletedAt: {
                allowNull: true,
                type: DataTypes.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('bookings');
    }
};
