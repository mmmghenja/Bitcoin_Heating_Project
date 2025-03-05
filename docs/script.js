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
    function calculateDailyBtcReward(totalHashRate, year, difficultyGrowth, asicEfficiency) {
        // Базовое вознаграждение на текущий момент (примерно)
        let baseReward = 0.000000566; // TH/s в день

        // Применяем коэффициент эффективности ASIC (по умолчанию 1 для первой генерации)
        baseReward = baseReward * asicEfficiency;

        // Учитываем рост сложности сети с каждым годом
        for (let i = 1; i < year; i++) {
            // baseReward /= (1 + (difficultyGrowth[i-1] / 100));
            baseReward = baseReward * (100 / (100 + difficultyGrowth[i-1]));
        }

        // Учитываем халвинги
        if (year >= 3 && year < 7) {
            baseReward = baseReward / 2; // Первый халвинг
        } else if (year >= 7) {
            baseReward = baseReward / 4; // Второй халвинг
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

    // Обновленная функция для применения инфляции к цене на 9 лет
    document.getElementById('applyInflation').addEventListener('click', function() {
        const inflationRate = getFormValue('defaultInflation', 10) / 100;

        // Начальные значения из первого года
        const baseBtcPrice = parseFloat(document.querySelector('input[name="btcPrice_1"]').value);
        const baseGasPrice = parseFloat(document.querySelector('input[name="gasPrice_1"]').value);
        const baseHeatPrice = parseFloat(document.querySelector('input[name="heatPrice_1"]').value);

        // Применяем инфляцию к каждому году
        for (let year = 2; year <= 9; year++) {
            // Если год халвинга, увеличиваем цену Bitcoin более значительно
            let btcMultiplier = Math.pow(1 + inflationRate, year - 1);

            // Дополнительный множитель для цены Bitcoin после халвинга
            if (year === 3) {
                btcMultiplier *= 1.4; // Первый халвинг
            } else if (year >= 4 && year < 7) {
                btcMultiplier *= 1.4; // После первого халвинга
            } else if (year === 7) {
                btcMultiplier *= 1.4 * 1.4; // Второй халвинг
            } else if (year >= 7) {
                btcMultiplier *= 1.4 * 1.4; // После второго халвинга
            }

            // Цена биткоина
            document.querySelector(`input[name="btcPrice_${year}"]`).value =
                Math.round(baseBtcPrice * btcMultiplier);

            // Цена газа (растет с инфляцией)
            document.querySelector(`input[name="gasPrice_${year}"]`).value =
                (baseGasPrice * Math.pow(1 + inflationRate, year - 1)).toFixed(2);

            // Цена тепла (растет с инфляцией)
            document.querySelector(`input[name="heatPrice_${year}"]`).value =
                Math.round(baseHeatPrice * Math.pow(1 + inflationRate, year - 1));
        }

        alert('Цены на все 9 лет пересчитаны с учетом инфляции!');
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
        const chillerPower = parseFloat(data.chillerPower) || 0.1; // МВт
        const chillerCost = parseFloat(data.chillerCost) || 3750000; // руб
        const coolingTowersPower = parseFloat(data.coolingTowersPower) || 4.6; // МВт
        const coolingTowersCost = parseFloat(data.coolingTowersCost) || 50000000; // руб
        const controlSystemCost = parseFloat(data.controlSystemCost) || 15000000; // руб
        // Get building parameters
        const buildingArea = parseFloat(data.buildingArea) || 300; // м²
        const buildingCostPerMeter = parseFloat(data.buildingCostPerMeter) || 45000; // руб./м²
        const buildingCost = buildingArea * buildingCostPerMeter; // руб.

        // Начальные параметры ASIC
        let minerModel = data.minerModel || 'S19 XP+ Hyd';
        let hashRate = parseFloat(data.hashRate) || 279; // TH/s
        const minerPower = parseFloat(data.minerPower) || 5301; // Вт
        let minerCost = parseFloat(data.minerCost) || 301000; // руб
        let minerCount = parseInt(data.minerCount) || 377; // шт

        // Параметры обновления ASIC
        const asicPerformanceIncrease = parseFloat(data.asicPerformanceIncrease) || 68; // %
        const asicCostIncrease = parseFloat(data.asicCostIncrease) || 56; // %

        const genEfficiencyElec = parseFloat(data.genEfficiencyElec) || 40; // %
        const genEfficiencyHeat = parseFloat(data.genEfficiencyHeat) || 40; // %
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

        for (let year = 1; year <= 9; year++) {
            btcPrice.push(parseFloat(data[`btcPrice_${year}`]) || 6000000);
            difficultyGrowth.push(parseFloat(data[`difficultyGrowth_${year}`]) || 5);
            gasPrice.push(parseFloat(data[`gasPrice_${year}`]) || 6.5);
            heatPrice.push(parseFloat(data[`heatPrice_${year}`]) || 2500);
            utilizationRate.push(parseFloat(data[`utilizationRate_${year}`]) || 95);
        }

        // Рассчитываем исходные капитальные затраты
        const initialMiningFarmCost = minerCount * minerCost;
        const initialCapex = generatorCost + initialMiningFarmCost + heatUtilizationCost +
                           chillerCost + coolingTowersCost + controlSystemCost + buildingCost;

        // Рассчитываем параметры системы
        const generatorPowerKW = generatorPower * 1000; // кВт
        const totalMinerPowerKW = (minerPower * minerCount) / 1000; // кВт

        // Рассчитываем амортизацию (линейная на 9 лет для всего, кроме майнеров)
        const infrastructureCapex = generatorCost + heatUtilizationCost + chillerCost +
                                  coolingTowersCost + controlSystemCost;
        const yearlyInfrastructureDepreciation = infrastructureCapex / 9;

        // Массивы для хранения ежегодных показателей
        const yearlyResults = [];

        // Массивы для хранения информации о поколениях ASIC
        const asicGenerations = [
            {
                generation: 1,
                model: minerModel,
                hashRate: hashRate,
                cost: minerCost,
                count: minerCount,
                efficiencyMultiplier: 1.0
            }
        ];

        // Текущее поколение ASIC для каждого года
        const yearToAsicGeneration = {};

        // Расходы на обновление ASIC в каждом году
        const asicUpgradeCosts = Array(9).fill(0);

        // Общие капитальные затраты с учетом обновлений ASIC
        let totalCapex = initialCapex;

        // Определяем поколения ASIC и расходы на обновление
        for (let year = 1; year <= 9; year++) {
            if (year < 3) {
                // Первые 2 года - первое поколение
                yearToAsicGeneration[year] = 0; // Индекс в массиве asicGenerations
            } else if (year === 3) {
                // 3-й год - обновление до второго поколения ASIC
                const gen2HashRate = hashRate * (1 + asicPerformanceIncrease / 100);
                const gen2Cost = minerCost * (1 + asicCostIncrease / 100);

                asicGenerations.push({
                    generation: 2,
                    model: `${minerModel} Gen2`,
                    hashRate: gen2HashRate,
                    cost: gen2Cost,
                    count: minerCount,
                    efficiencyMultiplier: 1 + (asicPerformanceIncrease / 100)
                });

                yearToAsicGeneration[year] = 1; // Индекс второго поколения

                // Стоимость обновления - полная замена всех ASIC
                asicUpgradeCosts[year-1] = minerCount * gen2Cost;
                totalCapex += asicUpgradeCosts[year-1];
            } else if (year < 7) {
                // Годы 4-6 - второе поколение
                yearToAsicGeneration[year] = 1; // Индекс второго поколения
            } else if (year === 7) {
                // 7-й год - обновление до третьего поколения ASIC
                const gen2HashRate = asicGenerations[1].hashRate;
                const gen2Cost = asicGenerations[1].cost;

                const gen3HashRate = gen2HashRate * (1 + asicPerformanceIncrease / 100);
                const gen3Cost = gen2Cost * (1 + asicCostIncrease / 100);

                asicGenerations.push({
                    generation: 3,
                    model: `${minerModel} Gen3`,
                    hashRate: gen3HashRate,
                    cost: gen3Cost,
                    count: minerCount,
                    efficiencyMultiplier: asicGenerations[1].efficiencyMultiplier * (1 + (asicPerformanceIncrease / 100))
                });

                yearToAsicGeneration[year] = 2; // Индекс третьего поколения

                // Стоимость обновления - полная замена всех ASIC
                asicUpgradeCosts[year-1] = minerCount * gen3Cost;
                totalCapex += asicUpgradeCosts[year-1];
            } else {
                // Годы 8-9 - третье поколение
                yearToAsicGeneration[year] = 2; // Индекс третьего поколения
            }
        }

        // Расчет для каждого года
        for (let year = 1; year <= 9; year++) {
            const yearIndex = year - 1; // Индекс для массивов (0-8)

            // Получаем текущие параметры ASIC
            const currentAsicGeneration = yearToAsicGeneration[year];
            const currentAsic = asicGenerations[currentAsicGeneration];
            const currentHashRate = currentAsic.hashRate;
            const currentMinerCost = currentAsic.cost;
            const totalHashRateTH = currentHashRate * minerCount; // TH/s
            const asicEfficiency = currentAsic.efficiencyMultiplier;

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
            const dailyBtcReward = calculateDailyBtcReward(totalHashRateTH, year, difficultyGrowth, asicEfficiency);
            const yearlyBtcReward = dailyBtcReward * 365 * (utilizationRate[yearIndex] / 100);
            const miningRevenue = yearlyBtcReward * btcPrice[yearIndex]; // руб

            // Расчет тепла от генератора
            const genHeatKW = generatorPowerKW * (genEfficiencyHeat / genEfficiencyElec); // кВт тепла
            const genHeatYearly = kWToGcal(genHeatKW, hoursPerYear); // Гкал в год

            // Расчет тепла от майнеров
            const minerHeatKW = totalMinerPowerKW * (asicHeatRecovery / 100); // кВт тепла
            const minerHeatYearly = kWToGcal(minerHeatKW, hoursPerYear); // Гкал в год

            // Общее количество тепла
            const totalHeatYearly = genHeatYearly + minerHeatYearly; // Гкал в год

            // Доход от реализации тепла
            const heatRevenue = totalHeatYearly * heatPrice[yearIndex]; // руб

            // Эксплуатационные расходы без учета обновления ASIC
            const maintenanceCost = infrastructureCapex * (maintenancePercent / 100); // руб в год
            const operatingExpenses = gasCostYearly + maintenanceCost + additionalTaxes; // руб в год

            // Расходы на обновление ASIC в текущем году
            const currentYearAsicUpgrade = asicUpgradeCosts[yearIndex];

            // Прибыль до вычета налогов, процентов и амортизации (EBITDA)
            const ebitda = miningRevenue + heatRevenue - operatingExpenses;

            // Прибыль до вычета налогов (EBT)
            // Амортизация только для инфраструктуры, ASIC списываются при обновлении
            const ebt = ebitda - yearlyInfrastructureDepreciation - currentYearAsicUpgrade;

            // Расчет налога на майнинг (25% от прибыли майнинга после вычета расходов)
            // Расходы на майнинг: пропорциональная часть общих расходов + затраты на обновление ASIC
            const miningExpenseShare = (totalMinerPowerKW / generatorPowerKW) * operatingExpenses;
            const miningProfit = miningRevenue - miningExpenseShare - currentYearAsicUpgrade;
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
                asicGeneration: currentAsic.generation,
                asicModel: currentAsic.model,
                asicHashRate: currentHashRate,
                asicCost: currentMinerCost,
                asicUpgradeCost: currentYearAsicUpgrade,
                ebitda,
                yearlyDepreciation: yearlyInfrastructureDepreciation,
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
        markdown += `- **Мощность газопоршневого генератора**: ${generatorPower} МВт\n`;
        markdown += `- **Стратегия обновления**: Замена ASIC-майнеров после каждого халвинга\n\n`;

        markdown += `## 2. Капитальные затраты (CAPEX)\n\n`;
        markdown += `### 2.1 Первоначальные капитальные затраты\n\n`;
        markdown += `| Компонент | Мощность/Количество | Стоимость (руб.) |\n`;
        markdown += `|-----------|---------------------|------------------|\n`;
        markdown += `| Газопоршневой генератор | ${generatorPower} МВт | ${formatNumber(generatorCost)} |\n`;
        markdown += `| Майнинг-ферма | ${minerCount} ASIC-майнеров | ${formatNumber(initialMiningFarmCost)} |\n`;
        markdown += `| Система утилизации тепла | - | ${formatNumber(heatUtilizationCost)} |\n`;
        markdown += `| Абсорбционный холодильник | ${chillerPower} МВт | ${formatNumber(chillerCost)} |\n`;
        markdown += `| Градирни | ${coolingTowersPower} МВт | ${formatNumber(coolingTowersCost)} |\n`;
        markdown += `| АСУ (автоматизированная система управления) | - | ${formatNumber(controlSystemCost)} |\n`;
        markdown += `| Здание | ${buildingArea} м² | ${formatNumber(buildingCost)} |\n`;
        markdown += `| **ИТОГО первоначальные CAPEX** | | **${formatNumber(initialCapex)}** |\n\n`;

        // Затраты на обновление ASIC
        markdown += `### 2.2 Затраты на обновление ASIC\n\n`;
        markdown += `| Год | Поколение ASIC | Хешрейт (TH/s) | Стоимость одного (руб.) | Общие затраты (руб.) |\n`;
        markdown += `|-----|----------------|----------------|-------------------------|---------------------|\n`;

        // Первая строка - первоначальные ASIC
        markdown += `| 1-2 | ${asicGenerations[0].model} (Gen 1) | ${asicGenerations[0].hashRate.toFixed(1)} | ${formatNumber(asicGenerations[0].cost)} | ${formatNumber(initialMiningFarmCost)} |\n`;
        // Затраты на обновление ASIC в году 3
        if (asicGenerations.length > 1) {
            markdown += `| 3-6 | ${asicGenerations[1].model} | ${asicGenerations[1].hashRate.toFixed(1)} | ${formatNumber(asicGenerations[1].cost)} | ${formatNumber(asicUpgradeCosts[2])} |\n`;
        }
        // Затраты на обновление ASIC в году 7
        if (asicGenerations.length > 2) {
            markdown += `| 7-9 | ${asicGenerations[2].model} | ${asicGenerations[2].hashRate.toFixed(1)} | ${formatNumber(asicGenerations[2].cost)} | ${formatNumber(asicUpgradeCosts[6])} |\n`;
        }

        markdown += `| **ИТОГО затраты на обновление ASIC** | | | | **${formatNumber(asicUpgradeCosts.reduce((a, b) => a + b, 0))}** |\n\n`;

        markdown += `### 2.3 Общие капитальные затраты\n\n`;
        markdown += `- **Первоначальные CAPEX**: ${formatNumber(initialCapex)} руб.\n`;
        markdown += `- **Затраты на обновление ASIC**: ${formatNumber(asicUpgradeCosts.reduce((a, b) => a + b, 0))} руб.\n`;
        markdown += `- **ИТОГО CAPEX за 9 лет**: ${formatNumber(totalCapex)} руб.\n\n`;

        markdown += `## 3. Технические характеристики\n\n`;
        markdown += `### 3.1 Параметры майнинга\n\n`;
        markdown += `- **Первоначальная модель майнера**: ${minerModel}\n`;
        markdown += `- **Хешрейт одного майнера**: ${hashRate} TH/s\n`;
        markdown += `- **Общий хешрейт фермы**: ${formatNumber(hashRate * minerCount)} TH/s\n`;
        markdown += `- **Энергопотребление одного майнера**: ${minerPower} Вт\n`;
        markdown += `- **Общее энергопотребление фермы**: ${formatNumber(totalMinerPowerKW)} кВт\n\n`;

        markdown += `### 3.2 Улучшение ASIC после халвинга\n\n`;
        markdown += `- **Рост производительности новой генерации**: ${asicPerformanceIncrease}%\n`;
        markdown += `- **Рост стоимости новой генерации**: ${asicCostIncrease}%\n\n`;

        markdown += `### 3.3 Параметры генератора и утилизации тепла\n\n`;
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
        markdown += `| Себестоимость электроэнергии (руб./кВт·ч) | ${yearlyResults.map(r => r.electricityCostPerKWh.toFixed(2)).join(' | ')} |\n`;
        markdown += `| Поколение ASIC | ${yearlyResults.map(r => r.asicGeneration).join(' | ')} |\n`;
        markdown += `| Хешрейт одного ASIC (TH/s) | ${yearlyResults.map(r => r.asicHashRate.toFixed(1)).join(' | ')} |\n\n`;

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
        markdown += `| Амортизация инфраструктуры | ${yearlyResults.map(r => formatNumber(Math.round(r.yearlyDepreciation / 1000))).join(' | ')} |\n`;
        markdown += `| Затраты на обновление ASIC | ${yearlyResults.map(r => formatNumber(Math.round(r.asicUpgradeCost / 1000))).join(' | ')} |\n`;
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
            const totalExpenses = r.operatingExpenses + r.asicUpgradeCost;
            cumulativeProfit += r.netProfit;

            markdown += `| ${r.year} | ${formatNumber(Math.round(totalRevenue / 1000))} | ${formatNumber(Math.round(totalExpenses / 1000))} | ${formatNumber(Math.round(r.ebitda / 1000))} | ${formatNumber(Math.round(r.netProfit / 1000))} | ${formatNumber(Math.round(cumulativeProfit / 1000))} |\n`;
        }

        markdown += '\n';

        // Расчет накопленной чистой прибыли и срока окупаемости
        cumulativeProfit = 0;
        let paybackYear = 0;
        let paybackMonth = 0;
        let paybackCosts = initialCapex; // Начальные затраты

        for (let i = 0; i < yearlyResults.length; i++) {
            // Добавляем затраты на обновление ASIC к сумме, которую нужно окупить
            if (yearlyResults[i].asicUpgradeCost > 0) {
                paybackCosts += yearlyResults[i].asicUpgradeCost;
            }

            // Прибыль накапливается
            cumulativeProfit += yearlyResults[i].netProfit;

            if (cumulativeProfit >= paybackCosts && paybackYear === 0) {
                paybackYear = i + 1;

                // Расчет месяцев
                const previousYearCumulative = cumulativeProfit - yearlyResults[i].netProfit;
                const remainingToPayback = paybackCosts - previousYearCumulative;
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
        const avgYearlyProfit = totalProfit / 9;
        const simpleROI = (avgYearlyProfit / totalCapex) * 100;

        markdown += `## 5. Показатели эффективности проекта\n\n`;
        markdown += `- **Общие капитальные затраты за 9 лет**: ${formatNumber(totalCapex)} руб.\n`;
        markdown += `- **Суммарная чистая прибыль за 9 лет**: ${formatNumber(Math.round(totalProfit))} руб.\n`;

        if (paybackYear > 0) {
            markdown += `- **Срок окупаемости (с учетом обновления ASIC)**: ${paybackYear} лет ${paybackMonth} месяцев\n`;
        } else {
            markdown += `- **Срок окупаемости**: более 9 лет\n`;
        }

        markdown += `- **Средняя годовая рентабельность инвестиций**: ${simpleROI.toFixed(2)}%\n\n`;

        markdown += `## 6. Анализ рисков\n\n`;
        markdown += `### Ключевые риски проекта:\n\n`;
        markdown += `1. **Волатильность цены Bitcoin** - значительное падение стоимости криптовалюты может существенно снизить доходность проекта.\n`;
        markdown += `2. **Рост сложности майнинга** - более быстрый рост сложности, чем прогнозируется, приведет к снижению добычи Bitcoin.\n`;
        markdown += `3. **Изменение регуляторной среды** - ужесточение законодательства в отношении майнинга или повышение налоговой нагрузки.\n`;
        markdown += `4. **Рост цен на газ** - повышение стоимости газа выше прогнозных значений увеличит операционные расходы.\n`;
        markdown += `5. **Технологические риски** - выход из строя оборудования, снижение эффективности утилизации тепла.\n`;
        markdown += `6. **Риски при обновлении ASIC** - задержки поставок нового оборудования, его недоступность или значительно более высокая стоимость.\n\n`;

        markdown += `### Меры по снижению рисков:\n\n`;
        markdown += `1. Хеджирование риска волатильности цены Bitcoin через финансовые инструменты.\n`;
        markdown += `2. Регулярное обновление майнингового оборудования для поддержания конкурентоспособности.\n`;
        markdown += `3. Заключение долгосрочных контрактов на поставку газа по фиксированной цене.\n`;
        markdown += `4. Диверсификация бизнеса за счет максимизации дохода от реализации тепла.\n`;
        markdown += `5. Комплексная система мониторинга и профилактического обслуживания оборудования.\n`;
        markdown += `6. Создание резервного фонда для своевременного обновления ASIC-майнеров и предварительное планирование заказов.\n\n`;

        // Формируем заключение
        markdown += `## 7. Заключение\n\n`;

        if (paybackYear <= 4) {
            markdown += `Проект Bitcoin Heating демонстрирует высокую эффективность с периодом окупаемости ${paybackYear} лет ${paybackMonth} месяцев и средней годовой рентабельностью ${simpleROI.toFixed(2)}%. Стратегия обновления ASIC-майнеров после каждого халвинга позволяет поддерживать конкурентоспособность майнинговой фермы, несмотря на рост сложности сети и уменьшение вознаграждения за блок. Комбинирование майнинга криптовалюты с утилизацией тепла создает синергетический эффект и снижает зависимость от волатильности рынка криптовалют. Проект рекомендуется к реализации.`;
        } else if (paybackYear <= 7) {
            markdown += `Проект Bitcoin Heating имеет умеренную эффективность с периодом окупаемости ${paybackYear} лет ${paybackMonth} месяцев и средней годовой рентабельностью ${simpleROI.toFixed(2)}%. Стратегия обновления ASIC-майнеров после каждого халвинга увеличивает капитальные затраты, но позволяет поддерживать стабильный уровень дохода от майнинга. Несмотря на длительный срок окупаемости, проект обеспечивает стабильный денежный поток и имеет потенциал для улучшения показателей при благоприятном изменении рыночных условий. Проект может быть рекомендован к реализации при наличии долгосрочной инвестиционной стратегии.`;
        } else {
            markdown += `Проект Bitcoin Heating демонстрирует длительный срок окупаемости (более ${paybackYear} лет) и среднюю годовую рентабельность ${simpleROI.toFixed(2)}%. Значительные затраты на обновление ASIC-майнеров после каждого халвинга оказывают существенное влияние на экономику проекта. Рекомендуется пересмотреть ключевые параметры проекта для улучшения экономических показателей: рассмотреть возможность частичного обновления оборудования, поиска более эффективных ASIC-майнеров или увеличения доходов от реализации тепла. Также стоит рассмотреть альтернативные варианты инвестирования с более высокой доходностью и меньшим сроком окупаемости.`;
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