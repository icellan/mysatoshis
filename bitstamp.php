<?php
$currency = 'USD'; //$_GET['currency'];
if (preg_match("/^[A-Z]{3}$/", $currency)) {
	$url					= 'https://www.bitstamp.net/api/ticker/';
	$path = '';
	$memcache = new Memcache;		
	if(0 && $memcache->connect('localhost', 11211) && ($cached_query = $memcache->get($url.$path))) {
		echo $cached_query;
		exit;
	}
	
	$post_data = "nonce=".time();
	$hash_data = $path . chr(0) . $post_data;
	$curl_handle = curl_init();
	curl_setopt($curl_handle, CURLOPT_URL, $url.$path);
	curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
	curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($curl_handle, CURLOPT_USERAGENT, 'MySatoshis.com');
	
	$query = curl_exec($curl_handle);
	curl_close($curl_handle);
	
	$data = json_decode($query, true);
	$newData = json_encode(array(
		'result' => 'success',
		'data' => array(
			'high' => array('value' => $data['high']),
			'low' => array('value' => $data['low']),
			'avg' => array('value' => ($data['bid'] + $data['ask']) / 2), // bitstamp doesn't have a weighted average :-(
			'vwap' => array('value' => $data['vwap']),
			'vol' => array('value' => $data['volume']),
			'last' => array('value' => $data['last']),
			'buy' => array('value' => $data['ask']),
			'sell' => array('value' => $data['bid'])
		)
	));
	
	$ret = @$memcache->set($url.$path, $newData, MEMCACHE_COMPRESSED, 1800); // cache for 15 minutes

	echo $newData;
} else {
	echo "ERROR: invalid currency given.";
}
