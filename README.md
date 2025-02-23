# Bitcoin Heating Project

## Описание проекта
Bitcoin Heating Project — это инициатива по использованию тепла, выделяемого при майнинге биткоина, для обогрева многоквартирных домов и обеспечения горячего водоснабжения. Проект также включает систему охлаждения для летнего периода, что делает его круглогодичным и эффективным решением.

## Цели проекта
- Эффективное использование отходящего тепла от майнинг-фермы и газопоршневого генератора.  
- Снижение затрат на отопление и горячее водоснабжение для многоквартирных домов.  
- Обеспечение охлаждения помещений в летний период.  
- Создание экологически чистого и экономически выгодного решения для энергоснабжения.

## Основные компоненты
- **Газопоршневой генератор (2.2 МВт)**: Обеспечивает электроэнергию для майнинг-фермы и тепло для системы.  
- **Майнинг-ферма (377 ASIC-майнеров)**: Выполняет вычисления для майнинга биткоина и выделяет тепло, которое утилизируется.  
- **Котёл-утилизатор**: Улавливает тепло от генератора для отопления и горячего водоснабжения.  
- **Абсорбирующая установка (2 МВт)**: Использует тепло для охлаждения в летний период.  
- **Система утилизации тепла**: Собирает и распределяет тепло от генератора и майнинг-фермы.  
- **Градирни**: Отводят избыточное тепло в летний период и в случае отказа системы кондиционирования.

## Структура каталогов
- **`Code/`**: Скрипты для анализа данных и генерации графиков.  
  - `create_bitcoin_prices.py`: Сбор данных о ценах на биткоин.  
  - `generate_graphs.py`: Генерация графиков для анализа.  
  - `requirements.txt`: Зависимости для установки.  
- **`Documentation/`**: Документация проекта.  
  - `Analysis/`: Анализ данных, включая цены на биткоин и энергоэффективность.  
  - `Technical_Design/`: Техническое описание компонентов системы.  
  - `Project_Management/`: Управление проектом, включая бюджет, риски и сроки.  
  - `Reports/`: Итоговые отчёты и сводки. 
- **`README.md`**: Общее описание проекта и инструкции.

## Инструкции по установке и использованию
1. **Установка зависимостей**:  
   - Установите необходимые пакеты из файла `requirements.txt`:  
     ```bash
     pip install -r Code/requirements.txt
     ```  
2. **Запуск скриптов**:  
   - Для сбора данных о ценах на биткоин:  
     ```bash
     python Code/create_bitcoin_prices.py
     ```  
   - Для генерации графиков:  
     ```bash
     python Code/generate_graphs.py
     ```  
3. **Просмотр документации**:  
   - Документация находится в папке `Documentation/`.  
   - Итоговые отчёты — в `Documentation/Reports/`.

## Лицензия
Проект находится в стадии разработки и не имеет лицензии на данный момент.