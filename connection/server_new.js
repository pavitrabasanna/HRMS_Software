const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const connection = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Tiger",
    database:"pavitra",
    connectionLimit:10
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === 'admin' && password === 'adminpassword') {
        const now = new Date();
        const loginTime = now.toLocaleTimeString();

        // Save login time and username to the database
        connection.query(
            'INSERT INTO login (username, startTime, endTime, duration) VALUES (?, NOW(), NULL, NULL)',
            [username],
            (error, results) => {
                if (error) {
                    console.error('Error inserting into the database:', error);
                    res.send({ success: false });
                } else {
                    console.log('Record inserted successfully:', results);
                    res.send({ success: true, loginTime });
                }
            }
        );
    } else {
        res.send({ success: false });
    }
});

app.post('/logout', (req, res) => {
    const username = req.body.username;
    const now = new Date();
    const logoutTime = now.toLocaleTimeString();

    // Update the login record with the endTime and calculate duration
    connection.query(
        'UPDATE login SET endTime = NOW(), duration = TIMESTAMPDIFF(SECOND, startTime, NOW()) WHERE username = ? AND endTime IS NULL ORDER BY startTime DESC LIMIT 1',
        [username],
        (error, updateResults) => {
            if (error) {
                console.error('Error updating the login record:', error);
                res.status(500).send({ success: false, error: 'Logout failed. Please try again.' });
            } else {
                console.log('Record updated successfully:', updateResults);

                // Fetch the updated record to get accurate startTime and duration
                connection.query(
                    'SELECT startTime, endTime, duration FROM login WHERE username = ? AND endTime IS NOT NULL ORDER BY endTime DESC LIMIT 1',
                    [username],
                    (selectError, selectResults) => {
                        if (selectError) {
                            console.error('Error retrieving the updated record:', selectError);
                            res.status(500).send({ success: false, error: 'Logout failed. Please try again.' });
                        } else {
                            console.log('Record retrieved successfully:', selectResults);
                            const updatedRecord = selectResults[0];
                            res.send({
                                success: true,
                                logoutTime,
                                startTime: updatedRecord.startTime,
                                endTime: updatedRecord.endTime,
                                duration: updatedRecord.duration
                            });
                        }
                    }
                );
            }
        }
    );
});



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
