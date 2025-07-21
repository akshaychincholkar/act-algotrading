


from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options
import time
import urllib.parse




def open_chartink_browser_and_print_scan_clause(scanner_name):
    """
    Opens the Chartink screener URL in a browser, intercepts the /backtest/process request,
    prints the scan_clause from the payload, and keeps the browser open for 10 seconds.
    """
    screener_url = f"https://chartink.com/screener/{scanner_name}"
    chrome_options = Options()
    # Run in headless mode so the browser window does not open
    chrome_options.add_argument("--headless")
    driver = webdriver.Chrome(options=chrome_options)
    driver.get(screener_url)
    scan_clause = None
    # Wait for network requests to be made
    for _ in range(5):
        for request in driver.requests:
            if request.method == 'POST' and 'backtest/process' in request.url:
                if request.body:
                    body = request.body.decode('utf-8')
                    params = urllib.parse.parse_qs(body)
                    if 'scan_clause' in params:
                        scan_clause = params['scan_clause'][0]
                        print("scan_clause:", scan_clause)
                        return scan_clause
        if scan_clause:
            return scan_clause
        time.sleep(1)
    if not scan_clause:
        print("scan_clause not found in network requests.")
        driver.quit()
        return scan_clause
    driver.quit()

# Example usage:
# open_chartink_browser_and_print_scan_clause("https://chartink.com/screener/bittu-daily-trading")
