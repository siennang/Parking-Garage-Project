<?php
// Database connection parameters
$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'parking_facilities_db';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data sent from JavaScript
$data = $_POST['data'];

foreach ($data as $garage) {
    $name = $garage['name'];
    $latitude = $garage['geometry']['location']['lat'];
    $longitude = $garage['geometry']['location']['lng'];

    // Insert into parking_garages
    $sql = "INSERT INTO parking_garages (name, latitude, longitude) VALUES ('$name', '$latitude', '$longitude')";
    if ($conn->query($sql) === TRUE) {
        $last_garage_id = $conn->insert_id;

        // If opening hours data exists and has detailed daily timings
        if (isset($garage['opening_hours']['weekday_text'])) {
            foreach ($garage['opening_hours']['weekday_text'] as $index => $hours_text) {
                // Extract open_time and close_time from the hours_text (This assumes a certain format like "Monday: 9:00 AM – 5:00 PM". Adjust regex if necessary.)
                preg_match("/(\d+:\d+ [APMapm]{2}) – (\d+:\d+ [APMapm]{2})/", $hours_text, $matches);
                if (count($matches) === 3) {
                    $open_time = date("H:i:s", strtotime($matches[1]));
                    $close_time = date("H:i:s", strtotime($matches[2]));
                    $weekday = $index + 1;  // Assuming Monday is 1, Tuesday is 2, etc.

                    // Insert into opening_hours
                    $sql_hours = "INSERT INTO opening_hours (garage_id, weekday, open_time, close_time) VALUES ('$last_garage_id', '$weekday', '$open_time', '$close_time')";
                    if (!$conn->query($sql_hours)) {
                        echo "Error: " . $sql_hours . "<br>" . $conn->error;
                    }
                }
            }
        }

    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

$conn->close();

echo json_encode(["status" => "success"]);
?>

