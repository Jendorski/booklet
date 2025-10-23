/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
'use strict';
const { DataTypes } = require('@sequelize/core');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('apartments', {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            hostName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            hostUUID: {
                type: DataTypes.STRING,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT
            },
            location: {
                type: DataTypes.STRING,
                allowNull: false
            },
            pricePerNight: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            cautionFee: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            bedrooms: {
                type: DataTypes.INTEGER,
                defaultValue: 1
            },
            bathrooms: {
                type: DataTypes.INTEGER,
                defaultValue: 1
            },
            toilets: {
                type: DataTypes.INTEGER,
                defaultValue: 1
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'pending'
            },
            amenities: {
                type: DataTypes.ARRAY(DataTypes.STRING)
            },
            images: {
                type: DataTypes.ARRAY(DataTypes.STRING)
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
        await queryInterface.dropTable('apartments');
    }
};
