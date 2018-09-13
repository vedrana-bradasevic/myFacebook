<?php
	include 'functions.php';

	// Accessing users data sent from frontend
	$id = $_GET['id'];
	
	// Convert array to json and send it to frontend
	echo json_encode(delete_data('comments', $id));
?>