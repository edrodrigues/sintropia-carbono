from playwright.sync_api import sync_playwright

def detailed_test():
    errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        console_messages = []
        
        def on_console(msg):
            console_messages.append(f"[{msg.type}] {msg.text}")
            if msg.type == 'error':
                errors.append(f"URL: {page.url} | Error: {msg.text}")
        
        page.on("console", on_console)
        page.on("pageerror", lambda exc: errors.append(f"Page Error: {exc}"))
        
        # Test home page with more details
        print("=== Testing home page ===")
        page.goto("http://localhost:3000/pt", wait_until="networkidle")
        print(console_messages[-5:] if len(console_messages) > 5 else console_messages)
        console_messages.clear()
        
        # Test home page with English
        print("=== Testing home page (en) ===")
        page.goto("http://localhost:3000/en", wait_until="networkidle")
        print(console_messages[-5:] if len(console_messages) > 5 else console_messages)
        console_messages.clear()
        
        # Test home page with Spanish
        print("=== Testing home page (es) ===")
        page.goto("http://localhost:3000/es", wait_until="networkidle")
        print(console_messages[-5:] if len(console_messages) > 5 else console_messages)
        console_messages.clear()
        
        # Test register page
        print("=== Testing register page ===")
        page.goto("http://localhost:3000/pt/register", wait_until="networkidle")
        print(console_messages[-5:] if len(console_messages) > 5 else console_messages)
        console_messages.clear()
        
        browser.close()
    
    print("\n=== ALL ERRORS ===")
    for err in errors:
        print(err)

if __name__ == "__main__":
    detailed_test()
