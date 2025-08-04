// Ждём, пока весь HTML-код загрузится
document.addEventListener('DOMContentLoaded', () => {

    // 1. Логика переключения разделов
    // Находим все кнопки навигации
    const navButtons = document.querySelectorAll('.nav-button');
    // Находим все разделы с контентом
    const contentSections = document.querySelectorAll('.content-section');

    // Перебираем каждую кнопку и добавляем "слушателя" кликов
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Удаляем класс 'active' со всех кнопок
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем класс 'active' только на нажатую кнопку
            button.classList.add('active');

            // Получаем id раздела, который нужно показать, из атрибута 'data-target'
            const targetId = button.dataset.target;

            // Удаляем класс 'active' со всех разделов
            contentSections.forEach(section => section.classList.remove('active'));
            // Находим нужный раздел по id и добавляем ему класс 'active'
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // 2. Базовая интеграция с Telegram Mini Apps
    // Убедимся, что Telegram Web Apps SDK доступен
    if (window.Telegram && window.Telegram.WebApp) {
        // Инициализируем SDK
        const webApp = window.Telegram.WebApp;

        // Отправляем обратную связь в Telegram при нажатии кнопки "Контакты"
        const contactButton = document.querySelector('.nav-button[data-target="contact"]');
        if (contactButton) {
            contactButton.addEventListener('click', () => {
                // Это пример. Можно, например, отправить в Telegram, что пользователь открыл раздел "Контакты"
                // В реальном приложении здесь может быть отправка формы
                webApp.sendData(JSON.stringify({ event: 'contact_section_opened' }));

                // При необходимости, можно попросить Telegram закрыть Mini App
                // webApp.close();
            });
        }
    }
});
