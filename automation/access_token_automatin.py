from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import random
import time

# Your API key
api_key = "j1z0yebn5wxfo74p"

# Generate the login URL
kite_login_url = f"https://kite.zerodha.com/connect/login?v=3&api_key={api_key}"

# Random password for testing
# password = ''.join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=10))
password = "gaamekmaK@03"

# Set up Chrome WebDriver (ensure chromedriver is installed)
driver = webdriver.Chrome()

try:
    # Open login page
    driver.get(kite_login_url)
    time.sleep(2)

    # Enter dummy credentials
    driver.find_element(By.ID, "userid").send_keys("XV2830")
    driver.find_element(By.ID, "password").send_keys(password)

    # Click Login
    driver.find_element(By.XPATH, "//button[@type='submit']").click()

    print("✅ Login button clicked with dummy credentials")

except Exception as e:
    print("❌ Error:", e)

finally:
    time.sleep(5)  # To view result
    driver.quit()
