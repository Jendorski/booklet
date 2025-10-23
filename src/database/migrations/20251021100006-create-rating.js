/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
'use strict';
const { DataTypes } = require('@sequelize/core');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ratings', {
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
            bookingUUID: {
                type: DataTypes.UUID,
                allowNull: false
            },
            overallRating: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            checkinRating: {
                type: DataTypes.FLOAT
            },
            cleanlinessRating: {
                type: DataTypes.FLOAT
            },
            communicationRating: {
                type: DataTypes.FLOAT
            },
            review: {
                type: DataTypes.TEXT
            },
            totalAmountPaid: {
                type: DataTypes.INTEGER
            },
            locationRating: {
                type: DataTypes.FLOAT
            },
            valueRating: {
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
        await queryInterface.dropTable('ratings');
    }
};
