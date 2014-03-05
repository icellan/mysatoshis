<?php
$currency = $_GET['currency'];
if (preg_match("/^[A-Z]{3}$/", $currency)) {
	$url					= 'https://data.mtgox.com/api/2/';
	$path					= 'BTC'.$currency.'/money/ticker';
	$memcache = new Memcache;		
	if($memcache->connect('localhost', 11211) && ($cached_query = $memcache->get($url.$path))) {
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

	$ret = $memcache->set($url.$path, $query, MEMCACHE_COMPRESSED, 1800); // cache for 15 minutes

	echo $query;
} else {
	echo "ERROR: invalid currency given.";
}