from playwright.sync_api import sync_playwright

def verify_blog_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the Blog page
        # Assuming frontend runs on 5173 which is default for vite
        try:
            page.goto("http://localhost:5173/blog")

            # Wait for content to load
            page.wait_for_selector('h1', timeout=10000)

            # Take a screenshot
            page.screenshot(path="verification/blog_page.png")
            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Error: {e}")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_blog_page()
