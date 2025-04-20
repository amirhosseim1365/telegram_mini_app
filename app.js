// Initialize Telegram WebApp
const telegram = window.Telegram.WebApp;

// Get DOM elements
const mainButton = document.getElementById('mainButton');
const colorThemeButton = document.getElementById('colorThemeButton');
const userDataButton = document.getElementById('userDataButton');
const resultDiv = document.getElementById('result');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Expand the WebApp to full height
    telegram.expand();
    
    // Show the Main Button in Telegram UI
    telegram.MainButton.setText('دکمه اصلی');
    telegram.MainButton.onClick(function() {
        displayResult('دکمه اصلی در رابط کاربری تلگرام کلیک شد!');
    });
});

// Button event handlers
mainButton.addEventListener('click', function() {
    telegram.MainButton.show();
    displayResult('دکمه اصلی در رابط کاربری تلگرام نمایش داده شد');
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
    resultDiv.innerHTML = text;
    
    // Send data to the Telegram app
    telegram.sendData(JSON.stringify({
        action: 'display_result',
        text: text
    }));
} 