/* Google Analytics 4 (ga4-tags-01): the one third party every page carries, through js/ga4.js. The CSP hosts are
   Google's list for "Google Analytics without Ads features" (developers.google.com/tag-platform/security/guides/csp).
   The browser checks stub these hosts, so a local run never reaches Google or lands in the live property. */
export const GA4_FILE = 'js/ga4.js';
export const GA4_CSP = {
	'script-src': ['https://www.googletagmanager.com'],
	'img-src': ['https://www.googletagmanager.com', 'https://*.google-analytics.com'],
	'connect-src': ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.google.com'],
};
export const GA4_HOST = /(?:^|\.)(?:googletagmanager\.com|google-analytics\.com|google\.com)$/;
export const stubGa4 = (ctx) => ctx.route((url) => GA4_HOST.test(url.hostname), (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
