// Initialize Telegram WebApp
const telegram = window.Telegram.WebApp;

// Get DOM elements
const resultDiv = document.getElementById('result');
const menuButtonsContainer = document.getElementById('menuButtons');

// API configuration
const API_BASE_URL = "http://185.255.88.105:88";
const API_KEY = "fuglvrROvYI0sxieqrqnJmzL3n9ZL1P5";
let userAuthority = 0;
let navigation = "main_menu";
const TEST_TELEGRAM_ID = '34905150';

// Simple focused API call function
function callApi(endpoint, data) {
    return new Promise((resolve, reject) => {
        // Explicitly set xhr as variable for debugging
        const xhr = new XMLHttpRequest();
        
        // Open as asynchronous request
        xhr.open('POST', `${API_BASE_URL}/${endpoint}`, true);
        
        // Set the correct Content-Type header - CRITICAL for the server's request.get_json()
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        // Track and display all information about the request and response
        let requestInfo = {
            url: `${API_BASE_URL}/${endpoint}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            jsonData: JSON.stringify(data)
        };
        
        // Set up completion handler
        xhr.onload = function() {
            // Capture all response information
            const responseInfo = {
                status: xhr.status,
                statusText: xhr.statusText,
                responseType: xhr.responseType,
                responseText: xhr.responseText,
                responseHeaders: xhr.getAllResponseHeaders(),
                rawHeaders: xhr.getAllResponseHeaders()
            };
            
            // Log everything for debugging (but don't display in UI)
            console.log(`API response for ${endpoint}:`, responseInfo);
            
            // Try to parse as JSON if successful
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    // Parse JSON response
                    const response = JSON.parse(xhr.responseText);
                    console.log(`Parsed JSON response:`, response);
                    resolve(response);
                } catch (error) {
                    console.error('Error parsing JSON response:', error);
                    console.log('Raw response:', xhr.responseText);
                    resolve({ 
                        message: 'failed', 
                        error: 'Invalid JSON response',
                        rawResponse: xhr.responseText
                    });
                }
            } else {
                console.error(`API request failed with status ${xhr.status}:`, xhr.statusText);
                resolve({ 
                    message: 'failed', 
                    error: xhr.statusText,
                    rawResponse: xhr.responseText,
                    status: xhr.status
                });
            }
        };
        
        // Set up error handler
        xhr.onerror = function() {
            console.error('Network error occurred');
            console.error('Request info:', requestInfo);
            
            resolve({ 
                message: 'failed', 
                error: 'Network error',
                requestInfo: requestInfo
            });
        };
        
        // Log what we're sending
        console.log(`Sending API request to ${endpoint}:`, data);
        
        // Convert data to JSON string
        const jsonData = JSON.stringify(data);
        console.log('JSON payload:', jsonData);
        
        // Send the request with JSON data
        xhr.send(jsonData);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Expand the WebApp to full height
    telegram.expand();
    
    // Hide all buttons initially
    hideAllButtons();
    
    // Show loading state at the beginning
    showLoadingState();
    
    // Start the app flow similar to Python's start function
    startApp();
});

// Hide all buttons initially
function hideAllButtons() {
    // Hide all buttons in the menu container
    menuButtonsContainer.style.display = 'none';
}

// Show loading state with sand clock
function showLoadingState() {
    resultDiv.innerHTML = `
        <div class="loading-container">
            <div class="hourglass">⌛</div>
            <div style="font-weight: bold; color: #555;">لطفاً منتظر بمانید...</div>
        </div>
    `;
}

// Show all buttons after loading
function showButtons() {
    // Show the menu container with all its buttons
    menuButtonsContainer.style.display = 'block';
    
    // Make sure all buttons inside are visible
    const buttons = menuButtonsContainer.querySelectorAll('.button');
    buttons.forEach(button => {
        button.style.display = 'block';
    });
}

// Similar to Python's start function
async function startApp() {
    try {
        console.log("Starting app initialization...");
        
        // Show loading state at the beginning
        showLoadingState();
        
        // Get user data from Telegram WebApp
        const user = telegram.initDataUnsafe?.user || {id: TEST_TELEGRAM_ID, first_name: 'Test', last_name: 'User'};
        console.log("User data from Telegram or test:", user);
        
        if (!user) {
            displayResult('خطا در دریافت اطلاعات کاربر');
            showButtons(); // Show buttons even if there's an error
            return;
        }
        
        // Get user data from API
        console.log("Checking if user exists:", user.id);
        let userData = await userByTelegramId(user.id);
        console.log("FINAL USER DATA IN START APP:", userData);
        
        // Set properties directly from our manually processed object
        // This ensures they're available regardless of how the JSON was parsed
        const firstName = userData.f_name || '';
        const lastName = userData.l_name || '';
        const authority = userData.authority;
        
        console.log("Final extracted values:");
        console.log("- firstName:", firstName);
        console.log("- lastName:", lastName);
        console.log("- authority:", authority);
        
        // Handle user creation if needed
        if (userData.message !== 'successful') {
            console.log("Creating new user");
            const newUserData = {
                api_key: API_KEY,
                authority: 0,
                views: 0,
                rasmio_date: 0,
                rasmio_count: 0,
                rasmio_count_total: 40,
                telegram_id: user.id
            };
            
            if (user.first_name) newUserData.f_name = user.first_name;
            if (user.last_name) newUserData.l_name = user.last_name;
            if (user.username) newUserData.telegram_username = user.username;
            
            userData = await addUser(newUserData);
            console.log("New user created:", userData);
        }
        
        // Set user authority (convert to number to ensure proper comparison)
        // FORCED conversion and assignment - this is critical
        userAuthority = Number(authority);
        console.log("FINAL User authority:", userAuthority, "type:", typeof userAuthority);
        
        // Add view silently
        try {
            await addView(user.id);
        } catch (e) {
            console.warn("Error adding view (non-critical):", e);
        }
        
        // Force a specific value if you're testing authority = 4
        // Uncomment this line ONLY for testing
        // userAuthority = 4;
        
        // Prepare welcome message
        let welcomeMessage = '';
        if (firstName && lastName) {
            welcomeMessage = `*${firstName} ${lastName}* عزیز\nبه روبات شرکت مشاور سرمایه‌گذاری کاریزما خوش آمدید!`;
            console.log("Using names:", firstName, lastName);
        } else {
            welcomeMessage = 'کاربر عزیز\nبه روبات شرکت مشاور سرمایه‌گذاری کاریزما خوش آمدید!';
            console.log("Using generic greeting");
        }
        
        // Display welcome message and show buttons
        console.log("Displaying welcome message:", welcomeMessage);
        displayResult(welcomeMessage);
        console.log("Showing main menu with authority:", userAuthority);
        displayMainMenu();
        showButtons();
        
    } catch (error) {
        console.error('Error in startApp:', error);
        displayResult(`خطا در راه‌اندازی برنامه: ${error.message || 'خطای نامشخص'}`);
        showButtons(); // Show buttons even if there's an error
    }
}

// API Functions

// Check if user exists by Telegram ID
async function userByTelegramId(telegramId) {
    try {
        // Create data object to send as JSON
        const data = {
            api_key: API_KEY,
            telegram_id: parseInt(telegramId),
            authority: 1,
            check_telegram_id: 34905150
        };
        
        // Use XMLHttpRequest with a Promise wrapper
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_BASE_URL}/user_by_telegram_id`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = function() {
                console.log("RAW RESPONSE TEXT:", xhr.responseText);
                
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Use our manual response processor instead of standard JSON.parse
                    const processedResponse = manualProcessResponse(xhr.responseText);
                    console.log("MANUALLY PROCESSED RESPONSE:", processedResponse);
                    resolve(processedResponse);
                } else {
                    console.error("HTTP error:", xhr.status);
                    resolve({ message: 'failed', error: xhr.statusText });
                }
            };
            
            xhr.onerror = function() {
                console.error("Network error");
                resolve({ message: 'failed', error: 'Network error' });
            };
            
            xhr.ontimeout = function() {
                console.error("Request timeout");
                resolve({ message: 'failed', error: 'Timeout' });
            };
            
            // Send the request
            console.log("Sending user data request:", data);
            xhr.send(JSON.stringify(data));
        });
    } catch (error) {
        console.error("Error in userByTelegramId:", error);
        return { message: 'failed', error: error.message };
    }
}

// Manual response processor for when JSON.parse fails
function manualProcessResponse(responseText) {
    try {
        // First try standard JSON.parse
        return JSON.parse(responseText);
    } catch (e) {
        console.warn("Standard JSON parse failed, trying manual processing", e);
        
        try {
            // If the response looks like the example you provided, manually extract values
            if (responseText.includes("'message':") && responseText.includes("'f_name':") && 
                responseText.includes("'l_name':") && responseText.includes("'authority':")) {
                
                console.log("Response looks like expected format, manually extracting");
                
                // Extract values using regex or string operations
                // This is a simplified version - will need improvement based on actual response format
                const extractValue = (key) => {
                    const regex = new RegExp(`'${key}':\\s*'?([^',}]*)'?`);
                    const match = responseText.match(regex);
                    return match ? match[1] : null;
                };
                
                const extractNumValue = (key) => {
                    const regex = new RegExp(`'${key}':\\s*([0-9]+)`);
                    const match = responseText.match(regex);
                    return match ? Number(match[1]) : 0;
                };
                
                // Build a synthetic response object
                const result = {
                    message: extractValue('message') || 'failed',
                    f_name: extractValue('f_name') || '',
                    l_name: extractValue('l_name') || '',
                    authority: extractNumValue('authority'),
                    // Add other fields as needed
                    telegram_username: extractValue('telegram_username') || '',
                    position: extractValue('position') || '',
                    api_key: extractValue('api_key') || ''
                };
                
                console.log("Manually extracted values:", result);
                return result;
            }
            
            // If response doesn't match expected format, try a last resort
            // Replace single quotes with double quotes
            const fixedJson = responseText.replace(/'/g, '"');
            console.log("Trying with replaced quotes:", fixedJson);
            return JSON.parse(fixedJson);
        } catch (manualError) {
            console.error("Manual processing also failed", manualError);
            // Return a default object with failures
            return { 
                message: 'failed', 
                error: 'JSON parsing failed',
                f_name: '',
                l_name: '',
                authority: 0
            };
        }
    }
}

// Add a new user
async function addUser(userData) {
    try {
        return await callApi('add_user', userData);
    } catch (error) {
        console.error('Error in addUser:', error);
        return { message: 'failed', error: error.message };
    }
}

// Add view count for a user
async function addView(telegramId) {
    try {
        const data = {
            api_key: API_KEY,
            telegram_id: parseInt(telegramId),
            authority: 0,
            add_view_telegram_id: 34905150
        };
        
        return await callApi('add_view', data);
    } catch (error) {
        console.error('Error in addView:', error);
        return { message: 'failed', error: error.message };
    }
}

// Helper function to display results
function displayResult(text, append = false) {
    if (append) {
        // Add timestamp and append to existing content
        const timestamp = new Date().toLocaleTimeString();
        resultDiv.innerHTML += `<hr><div class="timestamp">${timestamp}</div>${text.replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}`;
    } else {
        // Replace existing content with properly formatted text
        resultDiv.innerHTML = `<div class="welcome-text">${text.replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>`;
        resultDiv.style.marginBottom = '20px'; // Add space between welcome message and buttons
    }
}

// Clear the result div
function clearResults() {
    resultDiv.innerHTML = '';
}

// Make a very simple, focused test with minimal output
async function makeSimpleTest() {
    try {
        // Create data object for the test
        const data = {
            api_key: API_KEY,
            telegram_id: parseInt(TEST_TELEGRAM_ID),
            authority: 1,
            check_telegram_id: 34905150
        };
        
        // Use XMLHttpRequest for direct control and simplicity
        const xhr = new XMLHttpRequest();
        
        // Open the connection (synchronous for simplicity) with POST method
        xhr.open('POST', `${API_BASE_URL}/user_by_telegram_id`, false);
        
        // Set content type header for JSON
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        // Send the POST request with JSON data
        xhr.send(JSON.stringify(data));
        
        // Only log results, don't display in UI
        console.log(`Test API response status: ${xhr.status}`);
        console.log(`Test API response data:`, xhr.responseText);
        
        return {
            success: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            response: xhr.responseText
        };
    } catch (error) {
        console.error('Simple test error:', error);
        // Don't display error in UI either, just log it
        return {
            success: false,
            error: error.message
        };
    }
}

// Test function with specific telegram_id
async function testWithTelegramId() {
    try {
        // Clear previous results
        clearResults();
        
        displayResult('درحال آزمایش با شناسه تلگرام: ' + TEST_TELEGRAM_ID);
        
        // Run test but don't display intermediate results
        const testResult = await makeSimpleTest();
        console.log("Test completed successfully:", testResult);
        
        if (testResult.success) {
            // If test was successful, display a simple confirmation
            displayResult('آزمایش با موفقیت انجام شد. ارتباط با سرور برقرار است.', true);
        } else {
            // If test failed, show a simple error
            displayResult('خطا در آزمایش: ارتباط با سرور برقرار نشد.', true);
        }
        
        // Set a test authority
        userAuthority = 1;
        displayMainMenu();
    } catch (error) {
        console.error('Error in test method:', error);
        displayResult('خطا در آزمایش: ' + error.message, true);
    }
}

// Display main menu based on user authority
function displayMainMenu() {
    navigation = 'main_menu';
    
    try {
        console.log("Displaying main menu, authority:", userAuthority);
        
        // Clear existing buttons in the menu container
        menuButtonsContainer.innerHTML = '';
        
        // Create menu buttons based on authority
        const menuButtons = getMainMenuButtons(userAuthority);
        
        // Add buttons to the menu container
        menuButtons.forEach(buttonInfo => {
            const button = document.createElement('button');
            button.className = 'button';
            button.style.backgroundColor = "#D32127";
            button.style.color = "white";
            button.style.display = 'block'; // Make sure it's visible
            button.innerText = buttonInfo.text;
            button.setAttribute('data-action', buttonInfo.action);
            button.addEventListener('click', function() {
                handleMenuAction(buttonInfo.action);
            });
            
            // Add to the menu buttons container
            menuButtonsContainer.appendChild(button);
        });
        
        console.log("Main menu displayed successfully");
    } catch (error) {
        console.error("Error displaying main menu:", error);
    }
}

// Get main menu buttons based on authority
function getMainMenuButtons(authority) {
    console.log("Getting menu buttons for authority level:", authority);
    let buttons = [];
    
    // Ensure authority is a number and log its type
    const authorityLevel = Number(authority);
    console.log("Authority level (as number):", authorityLevel, "type:", typeof authorityLevel);
    
    // Log exact comparison results for debugging
    console.log("Authority === 0:", authorityLevel === 0);
    console.log("Authority === 4:", authorityLevel === 4);
    console.log("Authority > 0:", authorityLevel > 0);
    console.log("Authority < 4:", authorityLevel < 4);
    
    // Determine which set of buttons to show based on authority level
    if (authorityLevel === 0) {
        console.log("Using regular user menu");
        buttons = [
            { text: 'اوراق بدهی', action: 'm1' },
            { text: 'اوراق سهامی', action: 'm2' },
            { text: 'آخرین وضعیت بازارها', action: 'm4' }
        ];
    } else if (authorityLevel > 0 && authorityLevel < 4) {
        console.log("Using standard authorized user menu");
        buttons = [
            { text: 'مشاور سرمایه‌گذاری کاریزما', action: 'm5' },
            { text: 'اوراق بدهی', action: 'm1' },
            { text: 'اوراق سهامی', action: 'm2' },
            { text: 'آخرین وضعیت بازارها', action: 'm4' }
        ];
    } else if (authorityLevel === 4) {
        console.log("Using admin menu (authority 4)");
        buttons = [
            { text: 'مشاور سرمایه‌گذاری کاریزما', action: 'm5' },
            { text: 'اوراق بدهی', action: 'm1' },
            { text: 'اوراق سهامی', action: 'm2' },
            { text: 'آخرین وضعیت بازارها', action: 'm4' },
            { text: 'مدیریت کاربران', action: 'm7' }
        ];
    } else {
        // Fallback for any other authority value
        console.log("Using fallback menu for unknown authority:", authorityLevel);
        buttons = [
            { text: 'اوراق بدهی', action: 'm1' },
            { text: 'اوراق سهامی', action: 'm2' },
            { text: 'آخرین وضعیت بازارها', action: 'm4' }
        ];
    }
    
    console.log("Returning buttons:", buttons.map(b => b.text).join(", "));
    return buttons;
}

// Handle menu button actions
function handleMenuAction(action) {
    switch(action) {
        case 'm1':
            displayResult('بخش اوراق بدهی انتخاب شد');
            // Implement logic for اوراق بدهی
            break;
        case 'm2':
            displayResult('بخش اوراق سهامی انتخاب شد');
            // Implement logic for اوراق سهامی
            break;
        case 'm4':
            displayResult('بخش آخرین وضعیت بازارها انتخاب شد');
            // Implement logic for آخرین وضعیت بازارها
            break;
        case 'm5':
            displayResult('بخش مشاور سرمایه‌گذاری کاریزما انتخاب شد');
            // Implement logic for مشاور سرمایه‌گذاری کاریزما
            break;
        case 'm7':
            displayResult('بخش مدیریت کاربران انتخاب شد');
            // Implement logic for مدیریت کاربران
            break;
        default:
            displayResult('گزینه نامعتبر');
    }
} 