from playwright.sync_api import sync_playwright
import sys

def test_main_pages():
    errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Capture console errors
        def on_console(msg):
            if msg.type == 'error':
                errors.append(f"Console error: {msg.text}")
        
        page.on("console", on_console)
        
        # Test home page
        print("Testing home page...")
        page.goto("http://localhost:3000/pt", wait_until="networkidle")
        
        # Test categories
        print("Testing categories page...")
        page.goto("http://localhost:3000/pt/categorias", wait_until="networkidle")
        
        # Test carbon pages
        print("Testing carbono-brasil page...")
        page.goto("http://localhost:3000/pt/carbono-brasil", wait_until="networkidle")
        
        # Test feed
        print("Testing feed page...")
        page.goto("http://localhost:3000/pt/feed", wait_until="networkidle")
        
        # Test login page
        print("Testing login page...")
        page.goto("http://localhost:3000/pt/login", wait_until="networkidle")
        
        # Test register page
        print("Testing register page...")
        page.goto("http://localhost:3000/pt/register", wait_until="networkidle")
        
        # Test achievements
        print("Testing conquistas page...")
        page.goto("http://localhost:3000/pt/conquistas", wait_until="networkidle")
        
        browser.close()
    
    if errors:
        print("\n=== ERRORS FOUND ===")
        for err in errors:
            print(err)
    else:
        print("\n=== NO ERRORS FOUND ===")

if __name__ == "__main__":
    test_main_pages()
