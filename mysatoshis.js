/* * jQuery UI Touch Punch 0.2.2 * * Copyright 2011, Dave Furfero * Dual licensed under the MIT or GPL Version 2 licenses. * * Depends: * jquery.ui.widget.js * jquery.ui.mouse.js */ (function(b){b.support.touch="ontouchend" in document;if(!b.support.touch){return;}var c=b.ui.mouse.prototype,e=c._mouseInit,a;function d(g,h){if(g.originalEvent.touches.length>1){return;}g.preventDefault();var i=g.originalEvent.changedTouches[0],f=document.createEvent("MouseEvents");f.initMouseEvent(h,true,true,window,1,i.screenX,i.screenY,i.clientX,i.clientY,false,false,false,false,0,null);g.target.dispatchEvent(f);}c._touchStart=function(g){var f=this;if(a||!f._mouseCapture(g.originalEvent.changedTouches[0])){return;}a=true;f._touchMoved=false;d(g,"mouseover");d(g,"mousemove");d(g,"mousedown");};c._touchMove=function(f){if(!a){return;}this._touchMoved=true;d(f,"mousemove");};c._touchEnd=function(f){if(!a){return;}d(f,"mouseup");d(f,"mouseout");if(!this._touchMoved){d(f,"click");}a=false;};c._mouseInit=function(){var f=this;f.element.bind("touchstart",b.proxy(f,"_touchStart")).bind("touchmove",b.proxy(f,"_touchMove")).bind("touchend",b.proxy(f,"_touchEnd"));e.call(f);};})(jQuery);

var currencyValue = 0;
var currencyChar = '';
var currencyFormat = '';
var BTCUnit = 100000000;
var BTCUnitDisplay = {
	'100000000': 'Ƀ',
	'100000': 'mɃ',
	'100': 'µɃ'
}
// from http://www.xe.com/symbols.php
var currencySymbols = {
	'USD': '$'
	};
/*
	'AUD': '$',
	'CAD': '$',
	'CHF': 'CHF',
	'CNY': '¥',
	'DKK': 'kr',
	'EUR': '€',
	'GBP': '£',
	'HKD': '$',
	'JPY': '¥',
	'NZD': '$',
	'PLN': 'zł',
	'RUB': 'руб',
	'SEK': 'kr',
	'SGD': '$',
	'THB': '฿'
};
*/
function reload() {
	//if (!localStorage.getItem('currency')) {
		localStorage.setItem('currency', 'USD');
	//}
	if (!localStorage.getItem('currencyPrice')) {
		localStorage.setItem('currencyPrice', 'avg');
	}
	if (!localStorage.getItem('currencyFormat')) {
		localStorage.setItem('currencyFormat', ',.');
	}
	if (!localStorage.getItem('BTCUnit')) {
		localStorage.setItem('BTCUnit', '100000000');
	}
	$('#btclist').empty();
	var addresses = localStorage.getItem('btcaddresses');
	if (addresses !== null) {
		addresses = JSON.parse(addresses);
		var btc_addresses = '';
		$('#btclist').append('<li data-role="list-divider" data-theme="c"><div id="total_balance"></div></li>');
		for(var i in addresses) {
			$('#btclist').append('<li id="' + addresses[i].address + '" data-theme="c" class="swipedelete"><a href="#details" onClick="showDetails(\'' + addresses[i].address + '\')" data-transition="slide"><h2>' + addresses[i].label + '</h2><p>' + addresses[i].address + '</p><span class="ui-li-count ui-btn-up-c ui-btn-corner-all" id="btc_' + addresses[i].address + '"></span></a><span id="delete_' + addresses[i].address + '"></span></li>');
			btc_addresses+= (btc_addresses.length ? '|' : '') + addresses[i].address;
		}
		$('#btclist').listview('refresh');
		$.mobile.loading('show');
		$.getJSON('bitstamp.php?currency=' + localStorage.getItem('currency'), function(data) {
			currencyValue = data.data[localStorage.getItem('currencyPrice')].value;
			currencyFormat = localStorage.getItem('currencyFormat');
			BTCUnit = parseInt(localStorage.getItem('BTCUnit'));
			BTCUnitRound = Math.log10(BTCUnit);
			var currencyDisplay = 'USD'; //data.data[localStorage.getItem('currencyPrice')].display;
			currencyChar = 'USD'; //data.data[localStorage.getItem('currencyPrice')].currency;
			$('#footer').html('1 BTC ' + BTCUnitDisplay[BTCUnit.toString()] + ' '  + '  = <a href="#mtgox_info" style="color: #fff; text-decoration: none">' + currencyChar + ' ' + (currencySymbols[currencyChar] || currencyChar) + ' ' + (currencyValue * (BTCUnit/100000000)).toFixed(2) + "</a>");
			$.getJSON('http://blockchain.info/multiaddr?active=' + btc_addresses + '&cors=true', function(data) {
				var total_balance = 0;
				var total_btc = 0;
				$.each(data.addresses, function(key, value) {
					var btc_value = (value.final_balance * currencyValue / 100000000).formatMoney(2, currencyFormat.charAt(1), currencyFormat.charAt(0));
					total_btc += value.final_balance;
					total_balance += (value.final_balance * currencyValue / 100000000);
					document.getElementById('btc_'+value.address).innerHTML = (btc_value < 0 ? "<font color='red'>" : "") + (value.final_balance/BTCUnit).formatMoney(BTCUnitRound, currencyFormat.charAt(1), currencyFormat.charAt(0)) + "<br/>" + (currencySymbols[currencyChar] || currencyChar) + " " + btc_value + (btc_value < 0 ? "</font>" : "");
				});
				$("#total_balance").html('Total: BTC ' + BTCUnitDisplay[BTCUnit.toString()] + ' ' + (total_btc/BTCUnit).formatMoney(BTCUnitRound, currencyFormat.charAt(1), currencyFormat.charAt(0)) + ' = ' + currencyChar + ' ' + (currencySymbols[currencyChar] || currencyChar) + ' ' + total_balance.formatMoney(2, currencyFormat.charAt(1), currencyFormat.charAt(0)));
				addSwipeEvents();
				//addSortable();
				$.mobile.loading('hide');
			});
		});
	} else {
		// show short message
		$('#btclist').append('<li data-theme="c"><a href="#popupAddAddress" data-transition="pop"><h2>No addresses found in local storage.</h2><p>Click on Add to add some addresses to watch</p></a></li>');
		$('#btclist').listview('refresh');
	}
}

function addAddress()
{
	var addresses = JSON.parse(localStorage.getItem('btcaddresses'));
	if (addresses === null) addresses = [];
	var newAddress = document.getElementById('form_address').value;
	if (check_btc_address(newAddress)) {
		for(i in addresses) {
			if (addresses[i].address == newAddress) {
				alert('You have already added this address');
				return false;
			}
		}
		addresses.push({"label": document.getElementById('form_label').value, "address": newAddress}); 
		localStorage.setItem("btcaddresses", JSON.stringify(addresses));
		$.mobile.changePage($("#main"), "none");
		document.getElementById('form_label').value = '';
		document.getElementById('form_address').value = '';
		reload();
	} else {
		alert('BTC address invalid');
	}
}

function removeAddress(address)
{
	if (!confirm('Are you sure you want to remove the address ' + address + '?')) {
		return false;
	}
	var addresses = JSON.parse(localStorage.getItem('btcaddresses'));
	if (addresses !== null && address !== undefined) {
		var newAddresses = [];
		for(var i in addresses) {
			if (addresses[i].address !== address) {
				newAddresses.push(addresses[i]);
			}
		}
		if (newAddresses.length) {
			localStorage.setItem("btcaddresses", JSON.stringify(newAddresses));
		} else {
			localStorage.removeItem("btcaddresses");
		}
		reload();
	}
}

function showDetails(address)
{
	$('#detailsContent').empty();
	$('#footerDetails').html('<h3 class="ui-title" role="heading" aria-level="1">' + address + '</h3>');
	$.mobile.loading('show');
	$.getJSON('http://blockchain.info/multiaddr?active=' + address + '&cors=true', function(data) {
		if (data.txs.length) {
			for (i in data.txs) {
				var btc_value = (data.txs[i].result * currencyValue / 100000000);
				var transactionDate = (new Date(data.txs[i].time * 1000)).toUTCString();
				var details = '<li data-theme="c">';
				details += '<h2>' + data.txs[i].hash + '</h2>';
				details += '<p>' + (btc_value < 0 ? "<font color='red'>" : "") + (data.txs[i].result/100000000).toFixed(8) + ' - ' + (currencySymbols[localStorage.getItem('currency')] || localStorage.getItem('currency')) + " " + btc_value.formatMoney(2, currencyFormat.charAt(1), currencyFormat.charAt(0)) + (btc_value < 0 ? "</font>" : "") + '<br/>@ ' + transactionDate + '</p>';
				//if (data.txs[i].ver < 10) details += '<p><font color="red">This transaction is still being verified by the network (' + data.txs[i].ver + ' confirmed verifications)</font></p>';
				details += '</li>';
				$('#detailsContent').append(details);
			}
		} else {
			$('#detailsContent').append('<li data-theme="c"><h2>No transactions found</h2></li>');
		}
		$('#detailsContent').listview('refresh');
		$.mobile.loading('hide');
	});
}

function updateMtGoxInfo()
{
	$.mobile.loading('show');
	$.getJSON('mtgox.php?currency=' + localStorage.getItem('currency'), function(data) {
		var updateDate = (new Date(parseInt(data.data.now)/1000)).toUTCString();
		out = "Updated from Mt. Gox on " + updateDate + '<br/>';
		out+= '<table cellspacing="5" cellpadding="5">';
		out+= '<tr><td><b>High</b></td><td>' + data.data.high.display + '</td></tr>';
		out+= '<tr><td><b>Average</b></td><td>' + data.data.avg.display + '</td></tr>';
		out+= '<tr><td><b>Low</b></td><td>' + data.data.low.display + '</td></tr>';
		out+= '<tr><td><b>Volume</b></td><td>' + data.data.vol.display + '</td></tr>';
		out+= '</table>';
		//out+= JSON.stringify(data.data, null, 4);
		$("#mtgox_info_details").html(out);
		$.mobile.loading('hide');
	});
}

function loadOptions()
{
	var currencyCode = localStorage.getItem('currency');
	if (!currencyCode) currencyCode = 'EUR';
	$("#options_currency").val(currencyCode).prop('selected',true);

	var currencyPrice = localStorage.getItem('currencyPrice');
	if (!currencyPrice) currencyPrice = 'avg';
	$("#options_currency_price").val(currencyPrice).prop('selected',true);

	var currencyFormat = localStorage.getItem('currencyFormat');
	if (!currencyFormat) currencyFormat = ',.';
	$("#options_currency_format").val(currencyFormat).prop('selected',true);

	var BTCUnit = localStorage.getItem('BTCUnit');
	if (!BTCUnit) BTCUnit = '100000000';
	$("#options_bitcoin_unit").val(BTCUnit).prop('selected',true);
}

function saveOptions()
{
	localStorage.setItem('currency', $('#options_currency').val());
	localStorage.setItem('currencyPrice', $('#options_currency_price').val());
	localStorage.setItem('currencyFormat', $('#options_currency_format').val());
	localStorage.setItem('BTCUnit', $('#options_bitcoin_unit').val());
}

function addSortable()
{
	$('ul')
		.addClass('ui-corner-top')
		.removeClass('ui-corner-all')
		.sortable({
			'containment': 'parent',
			'opacity': 0.6,
			update: function(event, ui) {
				event.preventDefault();
				alert("dropped");
				$('#btclist').listview('refresh');
			}
		});
	
}

function addSwipeEvents()
{
	$('.swipedelete').bind('swipe', function(e) {
		e.preventDefault();
		// Check that there is no delete button on this list item
		if (true || !e.currentTarget.children('.aDeleteBtn')[0]) {
			// This disables links on the page.  If you click anywhere else, it removes the delete button
			$('.swipedelete').bind('tap click', function(e) {
				e.preventDefault();
				$('.aDeleteBtn').remove();
				$('.swipedelete').unbind('tap click');
				return false;
			});
			// clear out any delete buttons on other lines
			$('.aDeleteBtn').remove();
			// create the delete button
			var $aDeleteBtn = $('<a>Delete</a>').attr({
				'class': 'aDeleteBtn ui-btn-up-r',
				'onClick': 'removeAddress(' + e.currentTarget.id + ')',
				'id': e.currentTarget.id  // this tells me which list item to delete
			});
			// add the button to the list item
			$(e.currentTarget).prepend($aDeleteBtn);
			//$('#delete_' + e.currentTarget.id).append($aDeleteBtn).slideDown();

			// Have the delete button delete the item           
			$('.aDeleteBtn').bind('tap click', function (e) {
				e.preventDefault();
				// do the actual delete
				removeAddress(e.currentTarget.id);
			});
		} else {
			// if there was already is a delete button, remove it and let clicks function again.    
			$('.aDeleteBtn').remove();
			$('.swipedelete').unbind('tap click');
		}
	});
}

// As found on Stack Overflow: http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
Number.prototype.formatMoney = function(c, d, t){
var n = this, 
	c = isNaN(c = Math.abs(c)) ? 2 : c, 
	d = d == undefined ? "." : d, 
	t = t == undefined ? "," : t, 
	s = n < 0 ? "-" : "", 
	i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
	j = (j = i.length) > 3 ? j % 3 : 0;
 return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

// http://stackoverflow.com/questions/3019278/any-way-to-specify-the-base-of-math-log-in-javascript
Math.log10 = function(n) {
    return (Math.log(n)) / (Math.log(10));
}