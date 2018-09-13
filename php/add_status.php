<?php
	include 'functions.php';

	function fix($source) {
		$source = preg_replace_callback(
			'/(^|(?<=&))[^=[&]+/',
			function($key) { return bin2hex(urldecode($key[0])); },
			$source
		);
	
		parse_str($source, $post);
	
		$result = array();
		foreach ($post as $key => $val) {
			$result[hex2bin($key)] = $val;
		}
		return $result;
	}

	// Accessing users data sent from frontend
	$_POST   = fix(file_get_contents('php://input'));
	$status = (array) json_decode(key($_POST));
	
	// Convert array to json and send it to frontend
	echo json_encode(add_data('statuses', $status));
?>