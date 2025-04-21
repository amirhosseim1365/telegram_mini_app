// Initialize Telegram WebApp
const telegram = window.Telegram.WebApp;

// Get DOM elements
const mainButton = document.getElementById('mainButton');
const colorThemeButton = document.getElementById('colorThemeButton');
const userDataButton = document.getElementById('userDataButton');
const resultDiv = document.getElementById('result');

// API configuration
const API_BASE_URL = "http://185.255.88.105:88";
let userAuthority = 0;
let navigation = "main_menu";

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Expand the WebApp to full height
    telegram.expand();
    
    // Start the app flow similar to Python's start function
    startApp();
    
    // Set up the main button
    telegram.MainButton.setText('منوی اصلی');
    telegram.MainButton.onClick(function() {
        displayMainMenu();
    });
});

// Similar to Python's start function
async function startApp() {
    try {
        // Get user data from Telegram WebApp
        const user = telegram.initDataUnsafe.user;
        
        if (!user) {
            displayResult('خطا در دریافت اطلاعات کاربر');
            return;
        }
        
        // Check if user exists in our system
        let userData = await userByTelegramId(user.id);
        
        if (userData.message === 'failed') {
            // Create new user similar to Python add_user
            const newUserData = {
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
            
            userData = await addUser(user.id, 1, newUserData);
        }
        
        // Store user authority
        userAuthority = userData.authority;
        
        // Add view
        await addView(user.id);
        
        // Display welcome message
        let welcomeMessage = '';
        try {
            welcomeMessage = `${userData.f_name} ${userData.l_name} عزیز`;
        } catch (e) {
            welcomeMessage = 'کاربر عزیز';
        }
        
        displayResult(welcomeMessage);
        
        // Display main menu
        displayMainMenu();
        
    } catch (error) {
        console.error('Error in startApp:', error);
        displayResult('خطا در ارتباط با سرور');
    }
}

// Display main menu based on user authority
function displayMainMenu() {
    navigation = 'main_menu';
    
    const menuMessage = 'به روبات *شرکت مشاور سرمایه‌گذاری کاریزما* خوش آمدید. لطفاً خدمات مورد نظر را انتخاب فرمایید.';
    displayResult(menuMessage);
    
    // Clear existing buttons
    const buttonContainer = document.querySelector('.card');
    const existingButtons = buttonContainer.querySelectorAll('button:not(#mainButton)');
    existingButtons.forEach(button => button.remove());
    
    // Create menu buttons based on authority
    const menuButtons = getMainMenuButtons(userAuthority);
    
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
        
        // Insert before the result div
        buttonContainer.insertBefore(button, resultDiv.parentNode);
    });
}

// Get main menu buttons based on authority (similar to main_menu_keyboard)
function getMainMenuButtons(authority) {
    let buttons = [];
    
    if (authority === 0) {
        buttons = [
            { text: 'اوراق بدهی', action: 'm1' },
            { text: 'اوراق سهامی', action: 'm2' },
            { text: 'آخرین وضعیت بازارها', action: 'm4' }
        ];
    } else if (authority > 0 && authority < 4) {
        buttons = [
            { text: 'مشاور سرمایه‌گذاری کاریزما', action: 'm5' },
            { text: 'اوراق بدهی', action: 'm1' },
            { text: 'اوراق سهامی', action: 'm2' },
            { text: 'آخرین وضعیت بازارها', action: 'm4' }
        ];
    } else if (authority === 4) {
        buttons = [
            { text: 'مشاور سرمایه‌گذاری کاریزما', action: 'm5' },
            { text: 'اوراق بدهی', action: 'm1' },
            { text: 'اوراق سهامی', action: 'm2' },
            { text: 'آخرین وضعیت بازارها', action: 'm4' },
            { text: 'مدیریت کاربران', action: 'm7' }
        ];
    }
    
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

// API Functions

// Check if user exists by Telegram ID (similar to user_by_telegram_id)
async function userByTelegramId(telegramId, authority = 1, checkTelegramId = null) {
    try {
        const data = {
            telegram_id: String(telegramId),
            authority: authority,
            check_telegram_id: checkTelegramId ? String(checkTelegramId) : String(telegramId)
        };
        
        const response = await fetch(`${API_BASE_URL}/user_by_telegram_id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error in userByTelegramId:', error);
        return { message: 'failed', error: error.message };
    }
}

// Add a new user (similar to add_user)
async function addUser(telegramId, authority = 0, userData = null) {
    try {
        const data = {
            telegram_id: telegramId,
            authority: authority,
            user_data: userData
        };
        
        const response = await fetch(`${API_BASE_URL}/add_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error in addUser:', error);
        return { message: 'failed', error: error.message };
    }
}

// Add a view for a user (similar to add_view)
async function addView(telegramId, authority = 0, addViewTelegramId = null) {
    try {
        const data = {
            telegram_id: String(telegramId),
            authority: authority,
            add_view_telegram_id: addViewTelegramId ? String(addViewTelegramId) : String(telegramId)
        };
        
        const response = await fetch(`${API_BASE_URL}/add_view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error in addView:', error);
        return { message: 'failed', error: error.message };
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
    if (telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
        const user = telegram.initDataUnsafe.user;
        displayResult(`کاربر: ${user.first_name} ${user.last_name || ''} (شناسه: ${user.id})`);
    } else {
        displayResult('اطلاعات کاربر در دسترس نیست');
    }
});

// Helper function to display results
function displayResult(text) {
    resultDiv.innerHTML = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    // Send data to the Telegram app
    telegram.sendData(JSON.stringify({
        action: 'display_result',
        text: text
    }));
} 