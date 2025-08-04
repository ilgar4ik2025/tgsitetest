document.addEventListener('DOMContentLoaded', () => {
    const webApp = window.Telegram.WebApp;
    // Готовим приложение, чтобы оно отображалось корректно
    webApp.ready();

    // 1. Логика переключения разделов
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

    // 2. Логика для формы обратной связи
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Отменяем стандартную отправку формы

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Добавляем информацию о пользователе из Telegram, если она доступна
            const telegramUser = webApp.initDataUnsafe.user;
            const userDetails = telegramUser ? `
                От пользователя Telegram:
                Имя: ${telegramUser.first_name} ${telegramUser.last_name || ''}
                Username: @${telegramUser.username || 'Не указан'}
                ID: ${telegramUser.id}` : 'Информация о пользователе недоступна.';

            // Создаём сообщение для отправки в Telegram
            const message = `
                Новая заявка через Mini App!
                ${userDetails}
                ---
                Имя: ${data.name}
                Email: ${data.email}
                Сообщение: ${data.message}
            `;

            // Отправляем данные в Telegram
            webApp.sendData(message);

            // Показываем пользователю, что сообщение отправлено
            webApp.showAlert('Спасибо! Ваше сообщение отправлено.');

            // Очищаем форму
            contactForm.reset();
        });
    }
});
