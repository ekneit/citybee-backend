const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();


const mysqlConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
};
const pvm = 1.21;
const app = express();
app.use(express.json());
app.use(cors());

app.get('/models', async (req, res) => {
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [results] = await con.execute('SELECT * FROM models');
        con.end();
        return res.send(results);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Unexpexted error' })
    }
});

app.post('/models', async (req, res) => {

    if (!req.body.name || !req.body.hourPrice) {
        return res.status(400).send({ error: 'Incorrect data' });
    }
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [isModelExist] = await con.execute(`SELECT * from models WHERE name = ${mysql.escape(req.body.name.trim().toUpperCase())} `);

        if (isModelExist.length > 0) {
            con.end();
            return res.status(400).send({ error: 'Model already exists!' });

        }

        const [result] = await con.execute(`INSERT INTO models(name, hour_price) VALUE(${mysql.escape(req.body.name.toUpperCase())},${mysql.escape(req.body.hourPrice)})`)
        con.end();
        if (!result.insertId) {
            return res.status(500).send({ error: 'Failed please contact admin' });
        }
        return res.send({ message: 'Added successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Unexpexted error' });
    }

});

app.get('/modelscount', async (req, res) => {
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [results] = await con.execute('SELECT models.id, models.name, COUNT(vehicles.id) AS quatity FROM models LEFT JOIN vehicles ON vehicles.model_ID = models.id GROUP BY models.id')
        con.end();
        return res.send(results);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Unexpexted error' });
    }
});

app.get('/vehicles', async (req, res) => {
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [results] = await con.execute(`SELECT vehicles.id, models.name, models.hour_price * ${pvm} AS hour_price_with_pvp, vehicles.number_plate,vehicles.country_location  FROM vehicles INNER JOIN  models ON models.id = vehicles.model_ID`);
        con.end();
        return res.send(results);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Unexpexted error' });
    }
});
app.post('/vehicles', async (req, res) => {
    if (!req.body.moduleID || !req.body.numberPlate || !req.body.countryLocation) {
        return res.status(400).send({ error: 'Incorrect data' });
    }
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [isVehiclesExist] = await con.execute(`SELECT * from vehicles WHERE number_plate = ${mysql.escape(req.body.numberPlate.trim().toUpperCase())} AND country_location = ${mysql.escape(req.body.countryLocation.trim().toUpperCase())} `);

        if (isVehiclesExist.length > 0) {
            con.end();
            return res.status(400).send({ error: 'Vehicles already exists!' });
        }
        const [result] = await con.execute(`INSERT INTO vehicles  (model_id, number_plate, country_location) 
        VALUES (${mysql.escape(req.body.moduleID)}, ${mysql.escape(req.body.numberPlate.toUpperCase())}, ${mysql.escape(req.body.countryLocation.toUpperCase())});`);
        con.end();
        if (!result.insertId) {
            return res.status(500).send({ error: 'Failed please contact admin' });
        }
        return res.send({ message: 'Added successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Unexpexted error' });
    }
});
app.get('/vehicles/:country', async (req, res) => {

    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [results] = await con.execute(`SELECT vehicles.id, models.name, models.hour_price * ${pvm} AS hour_price_with_pvp, vehicles.number_plate,vehicles.country_location  FROM vehicles INNER JOIN  models ON models.id = vehicles.model_ID WHERE vehicles.country_location = ${mysql.escape(req.params.country)} `);
        con.end();
        return res.send(results);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Unexpexted error' });
    }
});

app.all('*', (req, res) => {
    res.status(400).send({ error: 'Page not exist' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`App working on ${PORT}`));