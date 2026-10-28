/* Google Analytics 4 (ga4-tags-01): the standard Google tag, the one third party on the site. It is a file because
   every page's CSP allows no inline script; the Measurement ID lives here and nowhere else (CSP hosts: tests/ga4.mjs). */
(function () {
	var id = 'G-EMMY09TP4T';
	var s = document.createElement('script');
	s.async = true;
	s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
	document.head.appendChild(s);
	window.dataLayer = window.dataLayer || [];
	function gtag() { dataLayer.push(arguments); }
	gtag('js', new Date());
	gtag('config', id);
})();
