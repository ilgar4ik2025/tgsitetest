document.addEventListener('DOMContentLoaded', () => {
    const webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.disableClosingConfirmation();

    const navButtons = document.querySelectorAll('.nav-button');
    const contentSections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const targetId = button.dataset.target;

            contentSections.forEach(section => section.classList.remove('active'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            const telegramUser = webApp.initDataUnsafe.user;
            const userDetails = telegramUser ? `
                От пользователя Telegram:
                Имя: ${telegramUser.first_name} ${telegramUser.last_name || ''}
                Username: @${telegramUser.username || 'Не указан'}
                ID: ${telegramUser.id}` : 'Информация о пользователе недоступна.';

            const message = `
                🚀 Новая заявка через Mini App!
                ${userDetails}
                ---
                Имя: ${data.name}
                Email: ${data.email}
                Сообщение: ${data.message}
            `;

            webApp.sendData(message);
            webApp.showAlert('✅ Спасибо! Ваша заявка отправлена. Я скоро свяжусь с вами.');
            
            contactForm.reset();
        });
    }
});
