
// ---- МАССИВЫ И КОНСТАНТЫ ----
const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const monthNamesYa = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const weekdays = [
    'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'
];

const mealColors = {
    breakfast: '#ff914d',
    lunch: '#ffbd59',
    dinner: '#ffde59'
};

// ---- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ----
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

// Объект для хранения данных привычек
// Структура: { "2025-05-12": { breakfast: true, lunch: false, ... } }
let habitData = {};

// ---- ФУНКЦИИ ----

function updateHeader(month) {
    const header = document.querySelector('.left-header h1');
    if (header) {
        header.textContent = `Мой минимум (${monthNames[month]})`;
    }
}

function renderCalendar(year, month) {
    const calendarContainer = document.querySelector('.left-calendar');
    calendarContainer.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1);
    let firstWeekday = firstDayOfMonth.getDay();
    firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;

    let startDate = new Date(year, month, 1);
    startDate.setDate(1 - (firstWeekday + 14));

    for (let i = 0; i < 9 * 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.textContent = currentDate.getDate();
        
        // Сохраняем полную дату в атрибут
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        dayCell.dataset.date = dateKey;

        calendarContainer.appendChild(dayCell);
    }

    // После отрисовки календаря навешиваем обработчики кликов
    attachCalendarClickHandlers();
}

function attachCalendarClickHandlers() {
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.addEventListener('click', () => {
            // Удаляем класс selected у всех ячеек
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            // Добавляем класс текущей ячейке
            day.classList.add('selected');
            
            const dateKey = day.dataset.date;
            displayDateInSidebar(dateKey);
        });
    });
}

// Выделяем сегодняшний день и показываем его данные
function selectToday() {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const todayCell = document.querySelector(`.calendar-day[data-date="${todayKey}"]`);
    if (todayCell) {
        // Убираем класс selected у всех ячеек
        document.querySelectorAll('.calendar-day').forEach(cell => {
            cell.classList.remove('selected');
        });
        // Добавляем класс текущей ячейке
        todayCell.classList.add('selected');
        // Загружаем данные для этой даты в правую секцию
        displayDateInSidebar(todayKey);
    }
}

function updateLabels(dateKey) {
    const labelsContainer = document.querySelector('.right-labels');
    if (!labelsContainer) return;
    
    const habits = habitData[dateKey] || {};
    
    // Цвета для каждой привычки (фоновые)
    const habitColors = {
        sleep: '#bc84f5',       // фиолетовый
        shower: '#a9e0ff',      // голубой
        work: '#9af587'         // зелёный
    };
    
    // Отображаемые названия (с иконками)
    const habitNames = {
        sleep: 'Сон 9ч',
        shower: 'Душ',
        work: 'Работа'
    };
    
    // Собираем лейблы для сна, душа, работы
    const activeLabels = [];
    for (const [habit, isChecked] of Object.entries(habits)) {
        if (isChecked && habitColors[habit] && habitNames[habit]) {
            activeLabels.push({ habit, name: habitNames[habit], color: habitColors[habit] });
        }
    }
    
    // Проверяем, отмечены ли все три приёма пищи
    const allMealsChecked = habits.breakfast && habits.lunch && habits.dinner;
    if (allMealsChecked) {
        activeLabels.push({
            habit: 'meals',
            name: '3 приёма пищи',
            color: '#ffde59'      // можно выбрать любой цвет, например жёлтый
        });
    }


    if (activeLabels.length === 0) {
        labelsContainer.innerHTML = '';
    } else {
        // Создаём лейблы с inline-стилем для цвета фона
        const labelsHtml = activeLabels.map(label => 
            `<span class="label" style="background-color: ${label.color};">${label.name}</span>`
        ).join(' ');
        labelsContainer.innerHTML = labelsHtml;
    }
}

function displayDateInSidebar(dateKey) {
    // Парсим дату из формата "2025-5-12"
    const [year, month, day] = dateKey.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    // Форматируем: "12 мая" и день недели
    const formattedDate = `${day} ${monthNamesYa[month - 1]}`;
    const weekday = weekdays[(dateObj.getDay() + 6) % 7]; // преобразуем вс(0) -> вс(6), пн(1)->пн(0)
    
    // Обновляем правую секцию
    const rightData = document.querySelector('.right-data');
    if (rightData) {
        // Предполагаем, что в right-data два элемента: <h2>Число и месяц</h2> и <h2>День</h2>
        const children = rightData.children;
        if (children.length >= 2) {
            children[0].textContent = formattedDate;
            children[1].textContent = weekday;
        }
    }
    
    // Загружаем отметки привычек для этой даты
    loadHabitsForDate(dateKey);
    
    // Запоминаем текущую дату в глобальную переменную, если нужно для чекбоксов
    window.currentDisplayedDate = dateKey;
}

function loadHabitsForDate(dateKey) {
    // Чекбоксы
    const habits = habitData[dateKey] || {};
    document.querySelectorAll('.right-checks .habit-check').forEach(checkbox => {
        const habitName = checkbox.getAttribute('data-habit');
        checkbox.checked = !!habits[habitName];
    });

    // Заметки (только загружаем значение)
    const notesField = document.getElementById('habit-notes');
    if (notesField) notesField.value = habitData[dateKey]?.notes || '';

    // Планы (только загружаем значение)
    const plansField = document.getElementById('plan-notes');
    if (plansField) plansField.value = habitData[dateKey]?.plans || '';

    updateLabels(dateKey);
}

function setupCheckboxes() {
    document.querySelectorAll('.habit-check').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const dateKey = window.currentDisplayedDate;
            if (!dateKey) return; // если ни один день не выбран
            
            // Убедимся, что для этой даты есть объект в habitData
            if (!habitData[dateKey]) habitData[dateKey] = {};
            
            const habitName = checkbox.getAttribute('data-habit');
            habitData[dateKey][habitName] = checkbox.checked;
            
            // Сохраняем в localStorage
            saveData();
            
            // В конце setupCheckboxes, после сохранения
            updateCellColor(dateKey);

            updateMealBlocks(dateKey);

            updateLabels(dateKey);
        });
    });
}

function initTextFields() {
    const notesField = document.getElementById('habit-notes');
    if (notesField) {
        notesField.addEventListener('input', (e) => {
            if (!window.currentDisplayedDate) return;
            if (!habitData[window.currentDisplayedDate]) habitData[window.currentDisplayedDate] = {};
            habitData[window.currentDisplayedDate].notes = e.target.value;
            saveData();
        });
    }

    const plansField = document.getElementById('plan-notes');
    if (plansField) {
        plansField.addEventListener('input', (e) => {
            if (!window.currentDisplayedDate) return;
            if (!habitData[window.currentDisplayedDate]) habitData[window.currentDisplayedDate] = {};
            habitData[window.currentDisplayedDate].plans = e.target.value;
            saveData();
        });
    }
}

function updateCellColor(dateKey) {
    const cell = document.querySelector(`.calendar-day[data-date="${dateKey}"]`);
    if (!cell) return;
    
    const habits = habitData[dateKey] || {};
    
    // Список цветов для каждой привычки (порядок важен для градиента)
    const colorMap = {
        sleep: '#bc84f5',   // фиолетовый
        shower: '#a9e0ff',  // голубой
        work: '#9af587'     // зелёный
    };
    
    // Собираем цвета активных привычек
    const activeColors = [];
    if (habits.sleep) activeColors.push(colorMap.sleep);
    if (habits.shower) activeColors.push(colorMap.shower);
    if (habits.work) activeColors.push(colorMap.work);
    
    // Применяем стиль
    if (activeColors.length === 0) {
        cell.style.background = ''; // сброс к стандартному фону
        cell.style.backgroundImage = '';
    } else if (activeColors.length === 1) {
        cell.style.background = activeColors[0];
        cell.style.backgroundImage = '';
    } else {
        // Создаём линейный градиент из активных цветов
        const gradient = `linear-gradient(180deg, ${activeColors.join(', ')})`;
        cell.style.background = gradient;
    }
}

// Перебираем все ячейки и обновляем цвета
function updateAllCellColors() {
    document.querySelectorAll('.calendar-day').forEach(cell => {
        const dateKey = cell.dataset.date;
        if (dateKey) updateCellColor(dateKey);
    });
}

function updateMealBlocks(dateKey) {
    const cell = document.querySelector(`.calendar-day[data-date="${dateKey}"]`);
    if (!cell) return;
    
    // Удаляем старый контейнер
    const oldBlocks = cell.querySelector('.meal-blocks');
    if (oldBlocks) oldBlocks.remove();
    
    const habits = habitData[dateKey] || {};
    
    // Создаём контейнер
    const blocksContainer = document.createElement('div');
    blocksContainer.className = 'meal-blocks';
    
    // Создаём три блока в фиксированном порядке (ужин, обед, завтрак)
    const mealOrder = ['dinner', 'lunch', 'breakfast'];
    
    mealOrder.forEach(meal => {
        const block = document.createElement('div');
        block.className = 'meal-block';
        if (habits[meal]) {
            block.classList.add(meal); // добавляем цвет
        } else {
            block.classList.add('inactive'); // делаем невидимым
        }
        blocksContainer.appendChild(block);
    });
    
    cell.appendChild(blocksContainer);
}

function updateAllMealBlocks() {
    document.querySelectorAll('.calendar-day').forEach(cell => {
        const dateKey = cell.dataset.date;
        if (dateKey) updateMealBlocks(dateKey);
    });
}

function saveData() {
    localStorage.setItem('habitCalendar', JSON.stringify(habitData));
}

function loadData() {
    const saved = localStorage.getItem('habitCalendar');
    if (saved) {
        habitData = JSON.parse(saved);
    }
}

// ---- ИНИЦИАЛИЗАЦИЯ ----
renderCalendar(currentYear, currentMonth);
updateHeader(currentMonth);
loadData();
updateAllCellColors();
updateAllMealBlocks();
selectToday();
setupCheckboxes();
initTextFields();

// Прокрутка к центру (2 недели вниз)
const scrollContainer = document.querySelector('.left-scroll');
if (scrollContainer) {
    const weekHeight = scrollContainer.scrollHeight / 9;
    scrollContainer.scrollTop = weekHeight * 2;
}