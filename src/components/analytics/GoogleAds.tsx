'use client';

import Script from 'next/script';

export default function GoogleAds() {
  return (
    <Script id="google-ads-conversion" strategy="afterInteractive">
      {`
        // Google Ads Conversion Tracking
        // Conversion ID: AW-17764244503
        
        // Main conversion function with value support
        function gtag_report_conversion(url, value, currency) {
          var callback = function () {
            if (typeof(url) != 'undefined') {
              window.location = url;
            }
          };
          
          if (typeof gtag === 'function') {
            var transactionId = 'txn_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
            
            // Use Free Trial conversion label when value is provided (subscription/purchase)
            var conversionLabel = value 
              ? 'AW-17764244503/_2VqCKKuoc4bEJe405ZC'  // Free Trial conversion
              : 'AW-17764244503/1nGKCKndv8gbEJe405ZC'; // General click conversion
            
            var eventParams = {
              'send_to': conversionLabel,
              'transaction_id': transactionId,
              'event_callback': callback
            };
            
            // Add value tracking for purchases/trials
            if (value) {
              eventParams.value = value;
              eventParams.currency = currency || 'CAD';
            }
            
            gtag('event', 'conversion', eventParams);
          } else {
            console.warn('gtag not defined, redirecting anyway');
            if (callback) callback();
          }
          return false;
        }
        
        // Expose to window
        window.gtag_report_conversion = gtag_report_conversion;
      `}
    </Script>
  );
}
