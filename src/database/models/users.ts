import { Sequelize, INTEGER, CHAR, STRING } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('users', {
        userId: {
            type: CHAR(50),
            allowNull: false
        },
        name: {
            type: STRING,
            allowNull: false
        },
        age: {
            type: INTEGER
        },
        hobbies: {
            type: STRING
        },
        pronoun: {
            type: CHAR(20)
        },
        gender: {
            type: CHAR(50)
        },
        emotionalState: {
            type: STRING
        },
        extraInfo: {
            type: STRING
        }
 })
}