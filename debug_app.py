from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Capture console logs
    console_logs = []
    page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
    
    # Navigate to the page
    page.goto('http://localhost:8000/irec-brasil.html')
    page.wait_for_load_state('networkidle')
    
    # Wait a bit more for data to load
    time.sleep(2)
    
    # Take screenshot
    page.screenshot(path='debug_irec_brasil.png', full_page=True)
    
    # Print console logs
    print("=== CONSOLE LOGS ===")
    for log in console_logs:
        try:
            print(log.encode('utf-8', errors='ignore').decode('utf-8'))
        except:
            print("[Error printing log]")
    
    # Check if table has data or error message
    print("\n=== TABLE STATUS ===")
    try:
        table_text = page.locator('#irec-table').inner_text()
        if "Erro ao carregar" in table_text:
            print("ERROR: Table shows 'Erro ao carregar dados'")
        elif table_text.strip():
            print("SUCCESS: Table has data")
            print(f"First few rows: {table_text[:200]}")
        else:
            print("WARNING: Table is empty")
    except Exception as e:
        print(f"Error accessing table: {e}")
    
    # Check if dados.json exists by trying to fetch it
    print("\n=== CHECKING dados.json ===")
    result = page.evaluate("""async () => {
        try {
            const response = await fetch('./dados/dados.json');
            return {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            };
        } catch (e) {
            return { error: e.message };
        }
    }""")
    print(f"Fetch result: {result}")
    
    # Try to load the data and see what happens
    print("\n=== TESTING DATA LOADING ===")
    data_result = page.evaluate("""async () => {
        try {
            const response = await fetch('./dados/dados.json');
            if (!response.ok) {
                return { error: `HTTP ${response.status}: ${response.statusText}` };
            }
            const data = await response.json();
            return { 
                success: true, 
                hasData: !!data.irecBrasil,
                dataLength: data.irecBrasil ? data.irecBrasil.length : 0
            };
        } catch (e) {
            return { error: e.message, stack: e.stack };
        }
    }""")
    print(f"Data loading result: {data_result}")
    
    browser.close()
    
    print("\nScreenshot saved as debug_irec_brasil.png")
