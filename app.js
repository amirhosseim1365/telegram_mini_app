// Initialize Telegram WebApp
const telegram = window.Telegram.WebApp;

// Get DOM elements
const mainButton = document.getElementById('mainButton');
const colorThemeButton = document.getElementById('colorThemeButton');
const userDataButton = document.getElementById('userDataButton');
const resultDiv = document.getElementById('result');

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
    
    // Show loading state with sand clock
    showLoadingState();
    
    // Start the app flow similar to Python's start function
    startApp();
    
    // Set up the main button
    telegram.MainButton.setText('منوی اصلی');
    telegram.MainButton.onClick(function() {
        displayMainMenu();
    });
});

// Hide all buttons initially
function hideAllButtons() {
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.style.display = 'none';
    });
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
    const buttons = document.querySelectorAll('.button');
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
        
        // Use a try-catch block for the API calls
        try {
            // Get user data with explicit debugging
            console.log("Fetching user data for:", user.id);
            const userData = await userByTelegramId(user.id);
            console.log("Complete user data object:", userData);
            
            // Check for success
            if (userData.message !== 'successful') {
                console.log("User not found or API error, creating new user");
                // Create new user with basic information
                const newUserData = {
                    api_key: API_KEY,
                    authority: 0,
                    views: 0,
                    rasmio_date: 0,
                    rasmio_count: 0,
                    rasmio_count_total: 40,
                    telegram_id: user.id
                };
                
                // Add user name data if available
                if (user.first_name) newUserData.f_name = user.first_name;
                if (user.last_name) newUserData.l_name = user.last_name;
                if (user.username) newUserData.telegram_username = user.username;
                
                console.log("Adding new user with data:", newUserData);
                const addResult = await addUser(newUserData);
                console.log("Add user result:", addResult);
                
                // Use the new user data
                userAuthority = 0;
            } else {
                // Use the retrieved user data
                console.log("User found, setting authority level");
                
                // Force authority to be a number
                userAuthority = Number(userData.authority);
                console.log("Authority set to:", userAuthority, "type:", typeof userAuthority);
                
                // Add view count silently
                try {
                    await addView(user.id);
                } catch (viewError) {
                    console.error("View counting error (non-critical):", viewError);
                }
                
                // Create welcome message with the user's name
                let welcomeMessage = '';
                if (userData.f_name && userData.l_name) {
                    welcomeMessage = `*${userData.f_name} ${userData.l_name}* عزیز\nبه روبات شرکت مشاور سرمایه‌گذاری کاریزما خوش آمدید!`;
                    console.log("Using personalized welcome with names:", userData.f_name, userData.l_name);
                } else {
                    welcomeMessage = 'کاربر عزیز\nبه روبات شرکت مشاور سرمایه‌گذاری کاریزما خوش آمدید!';
                    console.log("Using generic welcome message");
                }
                
                // Show the welcome message and menu
                console.log("Final welcome message:", welcomeMessage);
                displayResult(welcomeMessage);
                displayMainMenu();
                showButtons();
            }
        } catch (apiError) {
            console.error("API communication error:", apiError);
            displayResult(`خطا در ارتباط با سرور: ${apiError.message || 'خطای نامشخص'}`);
            showButtons();
        }
    } catch (generalError) {
        console.error('General error in startApp:', generalError);
        displayResult(`خطا در راه‌اندازی برنامه: ${generalError.message || 'خطای نامشخص'}`);
        showButtons();
    }
}

// API Functions

// Check if user exists by Telegram ID
async function userByTelegramId(telegramId) {
    return new Promise((resolve, reject) => {
        // Create data object to send as JSON
        const data = {
            api_key: API_KEY,
            telegram_id: parseInt(telegramId),
            authority: 1,
            check_telegram_id: 34905150
        };
        
        // Direct XMLHttpRequest implementation for maximum control
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/user_by_telegram_id`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
            console.log("XHR status:", xhr.status);
            console.log("Raw response:", xhr.responseText);
            
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    // Parse JSON response
                    let userData = JSON.parse(xhr.responseText);
                    
                    // Ensure userData is an object
                    if (typeof userData === 'string') {
                        userData = JSON.parse(userData); // Double-parse if needed
                    }
                    
                    console.log("Parsed user data:", userData);
                    console.log("User data properties:", Object.keys(userData));
                    console.log("First name:", userData.f_name);
                    console.log("Last name:", userData.l_name);
                    console.log("Authority:", userData.authority);
                    
                    resolve(userData);
                } catch (e) {
                    console.error("JSON parse error:", e);
                    console.error("Failed response text:", xhr.responseText);
                    resolve({ message: 'failed', error: 'Invalid JSON response' });
                }
            } else {
                console.error("HTTP error:", xhr.status, xhr.statusText);
                resolve({ message: 'failed', error: xhr.statusText });
            }
        };
        
        xhr.onerror = function(e) {
            console.error("Network error:", e);
            resolve({ message: 'failed', error: 'Network error' });
        };
        
        console.log("Sending request with data:", data);
        xhr.send(JSON.stringify(data));
    });
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
        // Replace existing content
        resultDiv.innerHTML = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
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
        
        // Clear existing buttons
        const buttonContainer = document.querySelector('.card');
        if (!buttonContainer) {
            console.error("Button container not found!");
            return;
        }
        
        const existingButtons = buttonContainer.querySelectorAll('button:not(#mainButton)');
        existingButtons.forEach(button => button.remove());
        
        // Create menu buttons based on authority
        const menuButtons = getMainMenuButtons(userAuthority);
        
        // Find the result div directly
        const resultDiv = document.getElementById('result');
        
        // Add buttons to the DOM
        menuButtons.forEach(buttonInfo => {
            const button = document.createElement('button');
            button.className = 'button';
            button.style.backgroundColor = "#D32127";
            button.style.color = "white";
            button.innerText = buttonInfo.text;
            button.setAttribute('data-action', buttonInfo.action);
            button.addEventListener('click', function() {
                handleMenuAction(buttonInfo.action);
            });
            
            // Insert the button before the existing main button
            const mainButton = document.getElementById('mainButton');
            if (mainButton && mainButton.parentNode) {
                buttonContainer.insertBefore(button, mainButton);
            } else {
                // Fallback: just append to container
                buttonContainer.appendChild(button);
            }
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
    
    // Convert authority to a number to ensure correct comparison
    const authorityLevel = parseInt(authority);
    console.log("Authority level (as number):", authorityLevel);
    
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
        console.log("Using admin menu");
        buttons = [
            { text: 'مشاور سرمایه‌گذاری کاریزما', action: 'm5' },
            { text: 'اوراق بدهی', action: 'm1' },
            { text: 'اوراق سهامی', action: 'm2' },
            { text: 'آخرین وضعیت بازارها', action: 'm4' },
            { text: 'مدیریت کاربران', action: 'm7' }
        ];
    }
    
    console.log("Returning buttons:", buttons);
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

// Original button event handlers
mainButton.addEventListener('click', function() {
    displayMainMenu();
});

colorThemeButton.addEventListener('click', function() {
    const colorTheme = {
        bg_color: telegram.themeParams.bg_color,
        text_color: telegram.themeParams.text_color,
        hint_color: telegram.themeParams.hint_color,
        link_color: telegram.themeParams.link_color,
        button_color: telegram.themeParams.button_color,
        button_text_color: telegram.themeParams.button_text_color
    };
    
    displayResult('رنگ‌های تم: ' + JSON.stringify(colorTheme, null, 2));
});

userDataButton.addEventListener('click', function() {
    // Use test telegram ID for testing
    testWithTelegramId();
}); 