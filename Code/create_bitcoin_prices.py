import pandas as pd
from datetime import datetime

# Данные для CSV (примерные, с ключевыми скачками)
data = [
    ("2012-11-01", 12),    # Первый халвинг
    ("2012-12-01", 13),
    ("2013-01-01", 17),
    ("2013-04-01", 100),   # Первый заметный скачок
    ("2013-11-01", 200),
    ("2013-12-01", 700),   # Пик 2013 года
    ("2014-01-01", 800),
    ("2014-12-01", 300),   # Спад после пика
    ("2015-01-01", 250),
    ("2016-01-01", 400),
    ("2016-07-01", 650),   # Второй халвинг
    ("2016-12-01", 900),
    ("2017-01-01", 1000),
    ("2017-12-01", 15000), # Пик 2017 года
    ("2018-01-01", 13000),
    ("2018-12-01", 3500),  # Спад 2018 года
    ("2019-01-01", 3700),
    ("2019-06-01", 10000), # Скачок 2019 года
    ("2020-01-01", 8000),
    ("2020-05-01", 8800),  # Третий халвинг
    ("2020-12-01", 20000), # Начало роста 2020
    ("2021-01-01", 30000),
    ("2021-04-01", 60000), # Пик апреля 2021
    ("2021-11-01", 69000), # Абсолютный пик 2021
    ("2022-01-01", 40000), # Спад 2022
    ("2022-12-01", 16000), # Дно 2022
    ("2023-01-01", 20000),
    ("2023-12-01", 40000), # Восстановление 2023
    ("2024-01-01", 50000),
    ("2024-04-01", 70000), # Четвертый халвинг
    ("2024-06-01", 80000),
    ("2024-12-01", 96000),
    ("2025-02-01", 97000), # Текущая точка
]

# Создание DataFrame
df = pd.DataFrame(data, columns=["Date", "Price"])

# Сохранение в CSV
df.to_csv("Documentation/Analysis/bitcoin_prices.csv", index=False)
print("Файл bitcoin_prices.csv создан в Documentation/Analysis/")