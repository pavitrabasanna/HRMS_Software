const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Tiger',
  database: 'pavitra'
});

connection.connect();

const sqlQuery = 'SELECT b.username, b.basic_salary_per_hour,b.ot_salary, l.username, l.duration FROM basic_salary b, login l WHERE l.username=b.username';

// Create an array to store the retrieved data
const userData = [];

connection.query(sqlQuery, (error, results, fields) => {
  if (error) {
    console.error('Error retrieving data:', error);
    // Handle the error appropriately
  } else {
    // Store the retrieved data in the array
    results.forEach((row) => {
      // Convert duration from seconds to hours
      const durationInHours = row.duration / 3600; // 1 hour = 3600 seconds
if(durationInHours<0.05){
      // Calculate the total salary by multiplying duration in hours with basic_salary_per_hour
      const totalSalary = durationInHours * row.basic_salary_per_hour;
      

      userData.push({
        user_name: row.username,
        basic_sal: row.basic_salary_per_hour,
        duration: row.duration,
        otsalary:row.ot_salary,
        total_salary: totalSalary
      });
      // Insert the data into another table (assuming there is a table named 'other_table')
      const insertQuery = 'INSERT INTO per_day_salary (username, duration_hr, calculated_salary,date) VALUES (?, ?, ?,NOW())';
      const insertValues = [row.username, durationInHours, totalSalary];

      connection.query(insertQuery, insertValues, (insertError, insertResults, insertFields) => {
        if (insertError) {
          console.error('Error inserting data:', insertError);
          // Handle the insertion error appropriately
        } else {
          console.log('Data inserted into other_table:', insertResults);
        }
      });
    }
    else if (durationInHours>0.05){
      const otDuration=durationInHours-0.05;
      const totalSalary = 0.05 * row.basic_salary_per_hour;
      const otSalary=(durationInHours-0.05)*row.ot_salary;
      

      userData.push({
        user_name: row.username,
        basic_sal: row.basic_salary_per_hour,
        duration: 0.05,
        otsalary:row.ot_salary,
        total_salary: totalSalary,
        ot_salary:otSalary,
        ot_duration:otDuration
      });
      // Insert the data into another table (assuming there is a table named 'other_table')
      const insertQuery = 'INSERT INTO per_day_salary (username, duration_hr, calculated_salary,date) VALUES (?, ?, ?,NOW())';
      const insertValues = [row.username, 0.05, totalSalary];

      const insertQuery_ot = 'INSERT INTO ot_salary (username, ot_duration_hr, ot_salary,date) VALUES (?, ?, ?,NOW())';
      const insertValues_ot = [row.username, otDuration, otSalary];

      connection.query(insertQuery, insertValues, (insertError, insertResults, insertFields) => {
        if (insertError) {
          console.error('Error inserting data:', insertError);
          // Handle the insertion error appropriately
        } else {
          console.log('Data inserted into other_table:', insertResults);
        }
      });


      connection.query(insertQuery_ot, insertValues_ot, (insertError_ot, insertResults_ot, insertFields) => {
        if (insertError_ot) {
          console.error('Error inserting data:', insertError_ot);
          // Handle the insertion error appropriately
        } else {
          console.log('Data inserted into ot_table:', insertResults_ot);
        }
      });

    
    }
   
   
    });

    // Display the retrieved data
    console.log('Retrieved data:', userData);
  }

  connection.end();
});
