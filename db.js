require('dotenv').config();

const mongoose = require("mongoose");

module.exports = async () => {
    try {
        await mongoose.connect(process.env.DB);
        console.log("Connected to database.");
    } catch (error) {
        console.log("Could not able to connect to database.", error);
    }
};