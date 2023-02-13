import { Sequelize, INTEGER, CHAR, STRING } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('users', {
        userId: {
            type: CHAR(50),
            allowNull: false
        },
        name: {
            type: STRING,
        },
        interests: {
            type: STRING
        }
    })
}