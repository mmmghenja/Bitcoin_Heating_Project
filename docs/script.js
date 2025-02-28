document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('instructionBtn').addEventListener('click', function() {
        // Создаем модальное окно, если еще не создано
        const instructionModal = new bootstrap.Modal(document.getElementById('instructionModal'));

        // Загружаем содержимое инструкции
        fetch('instruction.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить инструкцию');
                }
                return response.text();
            })
            .then(markdownText => {
                // Преобразуем Markdown в HTML с помощью библиотеки marked
                const htmlContent = marked.parse(markdownText);

                // Вставляем HTML в модальное окно
                document.getElementById('instructionContent').innerHTML = htmlContent;

                // Показываем модальное окно
                instructionModal.show();
            })
            .catch(error => {
                console.error('Ошибка при загрузке инструкции:', error);
                document.getElementById('instructionContent').innerHTML =
                    '<div class="alert alert-danger">Не удалось загрузить инструкцию. Пожалуйста, обновите страницу и попробуйте снова.</div>';
                instructionModal.show();
            });
    });

    // Управление видимостью годовых столбцов на мобильных устройствах
    document.querySelectorAll('.year-selector').forEach(selector => {
        selector.addEventListener('change', function() {
            const selectedYear = this.value;

            if (selectedYear === 'all') {
                // Показываем все столбцы
                document.querySelectorAll('.year-column').forEach(col => {
                    col.style.display = '';
                });
            } else {
                // Показываем только выбранный год
                document.querySelectorAll('.year-column').forEach(col => {
                    if (col.classList.contains(`year-${selectedYear}`)) {
                        col.style.display = '';
                    } else {
                        col.style.display = 'none';
                    }
                });
            }

            // Обновляем стили для лучшего визуального отображения
            if (selectedYear !== 'all') {
                document.querySelectorAll('.sticky-year-column').forEach(col => {
                    col.style.borderRight = '2px solid #dee2e6';
                });
            } else {
                document.querySelectorAll('.sticky-year-column').forEach(col => {
                    col.style.borderRight = '';
                });
            }
        });
    });

    // Сделать таблицы в отчете горизонтально прокручиваемыми
    document.getElementById('generateReportBtn').addEventListener('click', function() {
        // Существующий код генерации отчета...

        // Добавить после генерации отчета:
        setTimeout(() => {
            const tables = document.querySelectorAll('#reportPreview table');
            tables.forEach(table => {
                if (!table.parentElement.classList.contains('table-responsive')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'table-responsive';
                    table.parentNode.insertBefore(wrapper, table);
                    wrapper.appendChild(table);
                }
            });
        }, 100);
    });

    // Функция для получения ежедневного вознаграждения BTC с учетом сложности и халвингов
    function calculateDailyBtcReward(totalHashRate, year, difficultyGrowth) {
        // Базовое вознаграждение на текущий момент (примерно)
        let baseReward = 0.000000466; // TH/s в день

        // Учитываем рост сложности сети с каждым годом
        for (let i = 1; i < year; i++) {
            baseReward = baseReward * (1 - (difficultyGrowth[i-1] / 100));
        }

        // Учитываем халвинг в 4-м году
        if (year >= 4) {
            baseReward = baseReward / 2;
        }

        // Рассчитываем итоговое вознаграждение
        return totalHashRate * baseReward;
    }

    // Функция для форматирования чисел с разделителями тысяч
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Пересчет кВт в Гкал
    function kWToGcal(kW, hours) {
        // 1 кВт·ч = 0.000860 Гкал
        return kW * hours * 0.000860;
    }

    // Вспомогательная функция для получения значения из формы
    function getFormValue(id, defaultValue = 0) {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) || defaultValue : defaultValue;
    }

    // Применение инфляции к ценам
    document.getElementById('applyInflation').addEventListener('click', function() {
        const inflationRate = getFormValue('defaultInflation', 10) / 100;

        // Начальные значения из первого года
        const baseBtcPrice = parseFloat(document.querySelector('input[name="btcPrice_1"]').value);
        const baseGasPrice = parseFloat(document.querySelector('input[name="gasPrice_1"]').value);
        const baseHeatPrice = parseFloat(document.querySelector('input[name="heatPrice_1"]').value);

        // Применяем инфляцию к каждому году
        for (let year = 2; year <= 7; year++) {
            // Цена биткоина (растет с инфляцией)
            document.querySelector(`input[name="btcPrice_${year}"]`).value =
                Math.round(baseBtcPrice * Math.pow(1 + inflationRate, year - 1));

            // Цена газа (растет с инфляцией)
            document.querySelector(`input[name="gasPrice_${year}"]`).value =
                (baseGasPrice * Math.pow(1 + inflationRate, year - 1)).toFixed(2);

            // Цена тепла (растет с инфляцией)
            document.querySelector(`input[name="heatPrice_${year}"]`).value =
                Math.round(baseHeatPrice * Math.pow(1 + inflationRate, year - 1));
        }

        alert('Цены на все 7 лет пересчитаны с учетом инфляции!');
    });

    // Сохранение данных в localStorage
    document.getElementById('saveDataBtn').addEventListener('click', function() {
        const formData = new FormData(document.getElementById('projectDataForm'));
        const data = {};

        // Преобразуем FormData в объект
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Сохранение данных
        localStorage.setItem('bitcoinHeatingData', JSON.stringify(data));
        alert('Данные успешно сохранены!');
    });

    // Загрузка данных из localStorage
    document.getElementById('loadDataBtn').addEventListener('click', function() {
        const savedData = localStorage.getItem('bitcoinHeatingData');
        if (savedData) {
            const data = JSON.parse(savedData);

            // Заполняем все поля формы
            const form = document.getElementById('projectDataForm');
            for (const key in data) {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = data[key];
                }
            }

            alert('Данные успешно загружены!');
        } else {
            alert('Нет сохраненных данных!');
        }
    });

    // Генерация отчета
    document.getElementById('generateReportBtn').addEventListener('click', function() {
        // Собираем все данные формы
        const formData = new FormData(document.getElementById('projectDataForm'));
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Получаем базовые параметры
        const generatorPower = parseFloat(data.generatorPower) || 2.2; // МВт
        const generatorCost = parseFloat(data.generatorCost) || 75000000; // руб
        const heatUtilizationCost = parseFloat(data.heatUtilizationCost) || 18859764; // руб
        const chillerPower = parseFloat(data.chillerPower) || 2; // МВт
        const chillerCost = parseFloat(data.chillerCost) || 75000000; // руб
        const coolingTowersPower = parseFloat(data.coolingTowersPower) || 4.1; // МВт
        const coolingTowersCost = parseFloat(data.coolingTowersCost) || 50000000; // руб
        const controlSystemCost = parseFloat(data.controlSystemCost) || 15000000; // руб

        const minerModel = data.minerModel || 'S19 XP+ Hyd';
        const hashRate = parseFloat(data.hashRate) || 279; // TH/s
        const minerPower = parseFloat(data.minerPower) || 5301; // Вт
        const minerCost = parseFloat(data.minerCost) || 301000; // руб
        const minerCount = parseInt(data.minerCount) || 377; // шт

        const genEfficiencyElec = parseFloat(data.genEfficiencyElec) || 40; // %
        const genEfficiencyHeat = parseFloat(data.genEfficiencyHeat) || 80; // %
        const gasConsumption = parseFloat(data.gasConsumption) || 0.3; // м³/кВт·ч
        const asicHeatRecovery = parseFloat(data.asicHeatRecovery) || 90; // %
        const maintenancePercent = parseFloat(data.maintenancePercent) || 5; // %
        const additionalTaxes = parseFloat(data.additionalTaxes) || 0; // руб

        // Получаем параметры по годам
        const btcPrice = [];
        const difficultyGrowth = [];
        const gasPrice = [];
        const heatPrice = [];
        const utilizationRate = [];

        for (let year = 1; year <= 7; year++) {
            btcPrice.push(parseFloat(data[`btcPrice_${year}`]) || 6000000);
            difficultyGrowth.push(parseFloat(data[`difficultyGrowth_${year}`]) || 5);
            gasPrice.push(parseFloat(data[`gasPrice_${year}`]) || 6.5);
            heatPrice.push(parseFloat(data[`heatPrice_${year}`]) || 2500);
            utilizationRate.push(parseFloat(data[`utilizationRate_${year}`]) || 95);
        }

        // Рассчитываем капитальные затраты
        const miningFarmCost = minerCount * minerCost;
        const totalCapex = generatorCost + miningFarmCost + heatUtilizationCost +
                           chillerCost + coolingTowersCost + controlSystemCost;

        // Рассчитываем параметры системы
        const generatorPowerKW = generatorPower * 1000; // кВт
        const totalMinerPowerKW = (minerPower * minerCount) / 1000; // кВт
        const totalHashRateTH = hashRate * minerCount; // TH/s

        // Рассчитываем амортизацию (линейная на 7 лет)
        const yearlyDepreciation = totalCapex / 7;
        const minerDepreciation = miningFarmCost / 7;

        // Массивы для хранения ежегодных показателей
        const yearlyResults = [];

        // Расчет для каждого года
        for (let year = 1; year <= 7; year++) {
            const yearIndex = year - 1; // Индекс для массивов (0-6)

            // Количество рабочих часов в году с учетом коэффициента использования
            const hoursPerYear = 365 * 24 * (utilizationRate[yearIndex] / 100);

            // Расход газа
            const gasConsumptionYearly = generatorPowerKW * gasConsumption * hoursPerYear; // м³
            const gasCostYearly = gasConsumptionYearly * gasPrice[yearIndex]; // руб

            // Себестоимость электроэнергии
            const electricityCostPerKWh = gasPrice[yearIndex] * gasConsumption; // руб/кВт·ч

            // Производство электроэнергии
            const electricityProduction = generatorPowerKW * hoursPerYear; // кВт·ч

            // Доход от майнинга
            const dailyBtcReward = calculateDailyBtcReward(totalHashRateTH, year, difficultyGrowth);
            const yearlyBtcReward = dailyBtcReward * 365 * (utilizationRate[yearIndex] / 100);
            const miningRevenue = yearlyBtcReward * btcPrice[yearIndex]; // руб

            // Расчет тепла от генератора
            const genHeatKW = generatorPowerKW * ((genEfficiencyHeat - genEfficiencyElec) / 100); // кВт тепла
            const genHeatYearly = kWToGcal(genHeatKW, hoursPerYear); // Гкал в год

            // Расчет тепла от майнеров
            const minerHeatKW = totalMinerPowerKW * (asicHeatRecovery / 100); // кВт тепла
            const minerHeatYearly = kWToGcal(minerHeatKW, hoursPerYear); // Гкал в год

            // Общее количество тепла
            const totalHeatYearly = genHeatYearly + minerHeatYearly; // Гкал в год

            // Доход от реализации тепла
            const heatRevenue = totalHeatYearly * heatPrice[yearIndex]; // руб

            // Эксплуатационные расходы
            const maintenanceCost = totalCapex * (maintenancePercent / 100); // руб в год
            const operatingExpenses = gasCostYearly + maintenanceCost + additionalTaxes; // руб в год

            // Прибыль до вычета налогов, процентов и амортизации (EBITDA)
            const ebitda = miningRevenue + heatRevenue - operatingExpenses;

            // Прибыль до вычета налогов (EBT)
            const ebt = ebitda - yearlyDepreciation;

            // Расчет налога на майнинг (25% от прибыли майнинга после вычета расходов)
            // Расходы на майнинг: пропорциональная часть общих расходов + амортизация майнеров
            const miningExpenseShare = (totalMinerPowerKW / generatorPowerKW) * operatingExpenses;
            const miningProfit = miningRevenue - miningExpenseShare - minerDepreciation;
            const miningTax = Math.max(0, miningProfit * 0.25);

            // Чистая прибыль
            const netProfit = ebt - miningTax;

            // Сохраняем результаты года
            yearlyResults.push({
                year,
                utilizationRate: utilizationRate[yearIndex],
                hoursPerYear,
                btcPrice: btcPrice[yearIndex],
                difficultyGrowth: difficultyGrowth[yearIndex],
                gasPrice: gasPrice[yearIndex],
                heatPrice: heatPrice[yearIndex],
                gasConsumptionYearly,
                gasCostYearly,
                electricityCostPerKWh,
                electricityProduction,
                dailyBtcReward,
                yearlyBtcReward,
                miningRevenue,
                genHeatYearly,
                minerHeatYearly,
                totalHeatYearly,
                heatRevenue,
                maintenanceCost,
                operatingExpenses,
                ebitda,
                yearlyDepreciation,
                ebt,
                miningProfit,
                miningTax,
                netProfit
            });
        }

        // Формируем Markdown отчет
        let markdown = `# Bitcoin Heating Project - Финансовая модель\n\n`;
        markdown += `## 1. Общая информация\n\n`;
        markdown += `- **Дата расчета**: ${new Date().toLocaleDateString()}\n`;
        markdown += `- **Модель ASIC майнера**: ${minerModel}\n`;
        markdown += `- **Количество майнеров**: ${minerCount} шт.\n`;
        markdown += `- **Мощность газопоршневого генератора**: ${generatorPower} МВт\n\n`;

        markdown += `## 2. Капитальные затраты (CAPEX)\n\n`;
        markdown += `| Компонент | Мощность/Количество | Стоимость (руб.) |\n`;
        markdown += `|-----------|---------------------|------------------|\n`;
        markdown += `| Газопоршневой генератор | ${generatorPower} МВт | ${formatNumber(generatorCost)} |\n`;
        markdown += `| Майнинг-ферма | ${minerCount} ASIC-майнеров | ${formatNumber(miningFarmCost)} |\n`;
        markdown += `| Система утилизации тепла | - | ${formatNumber(heatUtilizationCost)} |\n`;
        markdown += `| Абсорбционный холодильник | ${chillerPower} МВт | ${formatNumber(chillerCost)} |\n`;
        markdown += `| Градирни | ${coolingTowersPower} МВт | ${formatNumber(coolingTowersCost)} |\n`;
        markdown += `| АСУ (автоматизированная система управления) | - | ${formatNumber(controlSystemCost)} |\n`;
        markdown += `| **ИТОГО CAPEX** | | **${formatNumber(totalCapex)}** |\n\n`;

        markdown += `## 3. Технические характеристики\n\n`;
        markdown += `### 3.1 Параметры майнинга\n\n`;
        markdown += `- **Модель майнера**: ${minerModel}\n`;
        markdown += `- **Хешрейт одного майнера**: ${hashRate} TH/s\n`;
        markdown += `- **Общий хешрейт фермы**: ${formatNumber(totalHashRateTH)} TH/s\n`;
        markdown += `- **Энергопотребление одного майнера**: ${minerPower} Вт\n`;
        markdown += `- **Общее энергопотребление фермы**: ${formatNumber(totalMinerPowerKW)} кВт\n\n`;

        markdown += `### 3.2 Параметры генератора и утилизации тепла\n\n`;
        markdown += `- **Мощность генератора**: ${generatorPower} МВт\n`;
        markdown += `- **КПД по электричеству**: ${genEfficiencyElec}%\n`;
        markdown += `- **КПД по теплу**: ${genEfficiencyHeat}%\n`;
        markdown += `- **Расход газа**: ${gasConsumption} м³/кВт·ч\n`;
        markdown += `- **Утилизация тепла от асиков**: ${asicHeatRecovery}%\n`;
        markdown += `- **Себестоимость электроэнергии (1-й год)**: ${(gasPrice[0] * gasConsumption).toFixed(2)} руб./кВт·ч\n\n`;

        markdown += `## 4. Операционные показатели по годам\n\n`;

        // 4.1 Базовые параметры - таблица
        markdown += `### 4.1 Базовые параметры\n\n`;
        markdown += `| Показатель | ${yearlyResults.map(r => `Год ${r.year}`).join(' | ')} |\n`;
        markdown += `|------------|${yearlyResults.map(() => '------').join('|')}|\n`;
        markdown += `| Цена Bitcoin (руб.) | ${yearlyResults.map(r => formatNumber(r.btcPrice)).join(' | ')} |\n`;
        markdown += `| Рост сложности майнинга (%) | ${yearlyResults.map(r => r.difficultyGrowth.toFixed(1)).join(' | ')} |\n`;
        markdown += `| Цена газа (руб./м³) | ${yearlyResults.map(r => r.gasPrice.toFixed(2)).join(' | ')} |\n`;
        markdown += `| Цена тепла (руб./Гкал) | ${yearlyResults.map(r => formatNumber(r.heatPrice)).join(' | ')} |\n`;
        markdown += `| Коэффициент использования (%) | ${yearlyResults.map(r => r.utilizationRate.toFixed(1)).join(' | ')} |\n`;
        markdown += `| Себестоимость электроэнергии (руб./кВт·ч) | ${yearlyResults.map(r => r.electricityCostPerKWh.toFixed(2)).join(' | ')} |\n\n`;

        // 4.2 Производство и потребление - таблица
        markdown += `### 4.2 Производство и потребление\n\n`;
        markdown += `| Показатель | ${yearlyResults.map(r => `Год ${r.year}`).join(' | ')} |\n`;
        markdown += `|------------|${yearlyResults.map(() => '------').join('|')}|\n`;
        markdown += `| Производство электроэнергии (МВт·ч) | ${yearlyResults.map(r => formatNumber(Math.round(r.electricityProduction / 1000))).join(' | ')} |\n`;
        markdown += `| Расход газа (тыс. м³) | ${yearlyResults.map(r => formatNumber(Math.round(r.gasConsumptionYearly / 1000))).join(' | ')} |\n`;
        markdown += `| Добыча Bitcoin в день (BTC) | ${yearlyResults.map(r => r.dailyBtcReward.toFixed(8)).join(' | ')} |\n`;
        markdown += `| Добыча Bitcoin за год (BTC) | ${yearlyResults.map(r => r.yearlyBtcReward.toFixed(6)).join(' | ')} |\n`;
        markdown += `| Производство тепла от генератора (Гкал) | ${yearlyResults.map(r => formatNumber(Math.round(r.genHeatYearly))).join(' | ')} |\n`;
        markdown += `| Производство тепла от майнеров (Гкал) | ${yearlyResults.map(r => formatNumber(Math.round(r.minerHeatYearly))).join(' | ')} |\n`;
        markdown += `| Общее производство тепла (Гкал) | ${yearlyResults.map(r => formatNumber(Math.round(r.totalHeatYearly))).join(' | ')} |\n\n`;

        // 4.3 Финансовые показатели - таблица
        markdown += `### 4.3 Финансовые показатели (тыс. руб.)\n\n`;
        markdown += `| Показатель | ${yearlyResults.map(r => `Год ${r.year}`).join(' | ')} |\n`;
        markdown += `|------------|${yearlyResults.map(() => '------').join('|')}|\n`;
        markdown += `| Доход от майнинга | ${yearlyResults.map(r => formatNumber(Math.round(r.miningRevenue / 1000))).join(' | ')} |\n`;
        markdown += `| Доход от реализации тепла | ${yearlyResults.map(r => formatNumber(Math.round(r.heatRevenue / 1000))).join(' | ')} |\n`;
        markdown += `| Затраты на газ | ${yearlyResults.map(r => formatNumber(Math.round(r.gasCostYearly / 1000))).join(' | ')} |\n`;
        markdown += `| Затраты на обслуживание | ${yearlyResults.map(r => formatNumber(Math.round(r.maintenanceCost / 1000))).join(' | ')} |\n`;
        markdown += `| Операционные расходы (всего) | ${yearlyResults.map(r => formatNumber(Math.round(r.operatingExpenses / 1000))).join(' | ')} |\n`;
        markdown += `| EBITDA | ${yearlyResults.map(r => formatNumber(Math.round(r.ebitda / 1000))).join(' | ')} |\n`;
        markdown += `| Амортизация | ${yearlyResults.map(r => formatNumber(Math.round(r.yearlyDepreciation / 1000))).join(' | ')} |\n`;
        markdown += `| Прибыль до налогообложения | ${yearlyResults.map(r => formatNumber(Math.round(r.ebt / 1000))).join(' | ')} |\n`;
        markdown += `| Налог на майнинг (25%) | ${yearlyResults.map(r => formatNumber(Math.round(r.miningTax / 1000))).join(' | ')} |\n`;
        markdown += `| Чистая прибыль | ${yearlyResults.map(r => formatNumber(Math.round(r.netProfit / 1000))).join(' | ')} |\n\n`;

        // 4.4 Сводные финансовые показатели
        markdown += `### 4.4 Сводные финансовые показатели\n\n`;
        markdown += `| Год | Общий доход | Общие расходы | EBITDA | Чистая прибыль | Накопленная прибыль |\n`;
        markdown += `|-----|------------|---------------|--------|----------------|--------------------|\n`;

        let cumulativeProfit = 0;
        for (let i = 0; i < yearlyResults.length; i++) {
            const r = yearlyResults[i];
            const totalRevenue = r.miningRevenue + r.heatRevenue;
            cumulativeProfit += r.netProfit;

            markdown += `| ${r.year} | ${formatNumber(Math.round(totalRevenue / 1000))} | ${formatNumber(Math.round(r.operatingExpenses / 1000))} | ${formatNumber(Math.round(r.ebitda / 1000))} | ${formatNumber(Math.round(r.netProfit / 1000))} | ${formatNumber(Math.round(cumulativeProfit / 1000))} |\n`;
        }

        markdown += '\n';

        // Расчет накопленной чистой прибыли и срока окупаемости
        cumulativeProfit = 0;
        let paybackYear = 0;
        let paybackMonth = 0;

        for (let i = 0; i < yearlyResults.length; i++) {
            cumulativeProfit += yearlyResults[i].netProfit;

            if (cumulativeProfit >= totalCapex && paybackYear === 0) {
                paybackYear = i + 1;

                // Расчет месяцев
                const previousYearCumulative = cumulativeProfit - yearlyResults[i].netProfit;
                const remainingToPayback = totalCapex - previousYearCumulative;
                const monthlyProfit = yearlyResults[i].netProfit / 12;
                paybackMonth = Math.ceil(remainingToPayback / monthlyProfit);

                if (paybackMonth > 12) {
                    paybackYear++;
                    paybackMonth = paybackMonth - 12;
                }
            }
        }

        // Расчет IRR (простое приближение)
        const totalProfit = yearlyResults.reduce((sum, year) => sum + year.netProfit, 0);
        const avgYearlyProfit = totalProfit / 7;
        const simpleROI = (avgYearlyProfit / totalCapex) * 100;

        markdown += `## 5. Показатели эффективности проекта\n\n`;
        markdown += `- **Общие капитальные затраты**: ${formatNumber(totalCapex)} руб.\n`;
        markdown += `- **Суммарная чистая прибыль за 7 лет**: ${formatNumber(Math.round(totalProfit))} руб.\n`;

        if (paybackYear > 0) {
            markdown += `- **Срок окупаемости**: ${paybackYear} лет ${paybackMonth} месяцев\n`;
        } else {
            markdown += `- **Срок окупаемости**: более 7 лет\n`;
        }

        markdown += `- **Средняя годовая рентабельность инвестиций**: ${simpleROI.toFixed(2)}%\n\n`;

        markdown += `## 6. Анализ рисков\n\n`;
        markdown += `### Ключевые риски проекта:\n\n`;
        markdown += `1. **Волатильность цены Bitcoin** - значительное падение стоимости криптовалюты может существенно снизить доходность проекта.\n`;
        markdown += `2. **Рост сложности майнинга** - более быстрый рост сложности, чем прогнозируется, приведет к снижению добычи Bitcoin.\n`;
        markdown += `3. **Изменение регуляторной среды** - ужесточение законодательства в отношении майнинга или повышение налоговой нагрузки.\n`;
        markdown += `4. **Рост цен на газ** - повышение стоимости газа выше прогнозных значений увеличит операционные расходы.\n`;
        markdown += `5. **Технологические риски** - выход из строя оборудования, снижение эффективности утилизации тепла.\n\n`;

        markdown += `### Меры по снижению рисков:\n\n`;
        markdown += `1. Хеджирование риска волатильности цены Bitcoin через финансовые инструменты.\n`;
        markdown += `2. Регулярное обновление майнингового оборудования для поддержания конкурентоспособности.\n`;
        markdown += `3. Заключение долгосрочных контрактов на поставку газа по фиксированной цене.\n`;
        markdown += `4. Диверсификация бизнеса за счет максимизации дохода от реализации тепла.\n`;
        markdown += `5. Комплексная система мониторинга и профилактического обслуживания оборудования.\n\n`;

        // Формируем заключение
        markdown += `## 7. Заключение\n\n`;

        if (paybackYear <= 4) {
            markdown += `Проект Bitcoin Heating демонстрирует высокую эффективность с периодом окупаемости ${paybackYear} лет ${paybackMonth} месяцев и средней годовой рентабельностью ${simpleROI.toFixed(2)}%. Комбинирование майнинга криптовалюты с утилизацией тепла позволяет достичь синергетического эффекта и снизить зависимость от волатильности рынка криптовалют. Проект рекомендуется к реализации.`;
        } else if (paybackYear <= 6) {
            markdown += `Проект Bitcoin Heating имеет умеренную эффективность с периодом окупаемости ${paybackYear} лет ${paybackMonth} месяцев и средней годовой рентабельностью ${simpleROI.toFixed(2)}%. Несмотря на длительный срок окупаемости, проект обеспечивает стабильный денежный поток и имеет потенциал для улучшения показателей при благоприятном изменении рыночных условий. Проект может быть рекомендован к реализации при наличии долгосрочной инвестиционной стратегии.`;
        } else {
            markdown += `Проект Bitcoin Heating демонстрирует длительный срок окупаемости (более 7 лет) и среднюю годовую рентабельность ${simpleROI.toFixed(2)}%. Рекомендуется пересмотреть ключевые параметры проекта для улучшения экономических показателей, либо рассмотреть альтернативные варианты инвестирования с более высокой доходностью и меньшим сроком окупаемости.`;
        }

        // Сохраняем сгенерированный отчет
        localStorage.setItem('bitcoinHeatingReport', markdown);

        // Отображаем отчет
        document.getElementById('reportPreview').innerHTML = marked.parse(markdown);

        // Улучшение стилизации таблиц в отчете
        setTimeout(() => {
            // Обернем все таблицы для прокрутки на мобильных
            const tables = document.querySelectorAll('#reportPreview table');
            tables.forEach(table => {
                // Добавляем контейнер для горизонтальной прокрутки
                if (!table.parentElement.classList.contains('table-responsive')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'table-responsive';
                    table.parentNode.insertBefore(wrapper, table);
                    wrapper.appendChild(table);
                }

                // Выделим итоговые строки
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const firstCell = row.cells[0];
                    if (firstCell && (
                        firstCell.textContent.includes('ИТОГО') ||
                        firstCell.textContent.includes('Всего') ||
                        firstCell.textContent.includes('CAPEX') ||
                        firstCell.textContent.includes('Чистая прибыль') ||
                        firstCell.textContent.includes('Общее производство')
                    )) {
                        row.classList.add('total-row');
                    }
                });
            });
        }, 100);

        // Переключаемся на вкладку отчета
        document.getElementById('report-tab').click();
    });

    // Копирование Markdown в буфер обмена
    document.getElementById('copyMarkdownBtn').addEventListener('click', function() {
        const report = localStorage.getItem('bitcoinHeatingReport');
        if (report) {
            navigator.clipboard.writeText(report)
                .then(() => alert('Markdown успешно скопирован в буфер обмена!'))
                .catch(err => console.error('Не удалось скопировать текст: ', err));
        } else {
            alert('Сначала сгенерируйте отчет!');
        }
    });

    // Экспорт в PDF
    document.getElementById('exportPdfBtn').addEventListener('click', function() {
        const element = document.getElementById('reportPreview');
        if (element.textContent.trim() === 'Отчет будет отображен здесь после генерации') {
            alert('Сначала сгенерируйте отчет!');
            return;
        }

        // Создаем клон элемента для экспорта с улучшенными стилями
        const pdfElement = element.cloneNode(true);
        pdfElement.style.padding = '20px';
        pdfElement.style.fontSize = '12pt';
        pdfElement.style.lineHeight = '1.5';

        // Добавляем специальные стили для таблиц в PDF
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; border: 1px solid #666; }
            th { background-color: #f0f4f8; font-weight: bold; text-align: center; }
            td { text-align: right; }
            td:first-child { text-align: left; font-weight: 500; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total-row td { font-weight: bold; background-color: #e6f3ff; }
        `;
        pdfElement.appendChild(styleElement);

        const opt = {
            margin: [15, 10, 15, 10],
            filename: 'Bitcoin_Heating_Project_Report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(pdfElement).save();
    });
});