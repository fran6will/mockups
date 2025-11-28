'use client';

import Script from 'next/script';

export default function GoogleAds() {
    return (
        <Script id="google-ads-conversion" strategy="afterInteractive">
            {`
        function gtag_report_conversion(url) {
          var callback = function () {
            if (typeof(url) != 'undefined') {
              window.location = url;
            }
          };
          // Check if gtag is defined (it should be by GoogleAnalytics)
          if (typeof gtag === 'function') {
            gtag('event', 'conversion', {
                'send_to': 'AW-17764244503/1nGKCKndv8gbEJe405ZC',
                'transaction_id': '',
                'event_callback': callback
            });
          } else {
            console.warn('gtag not defined, redirecting anyway');
            if (callback) callback();
          }
          return false;
        }
        
        // Expose to window so it can be called globally if needed
        window.gtag_report_conversion = gtag_report_conversion;
      `}
        </Script>
    );
}
