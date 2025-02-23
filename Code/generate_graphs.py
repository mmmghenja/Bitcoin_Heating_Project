import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import matplotlib.dates as mdates
from datetime import datetime

# Данные для графиков 1-3
historical_dates = [
    datetime(2012, 11, 28),  # Первый халвинг
    datetime(2016, 7, 9),    # Второй халвинг
    datetime(2020, 5, 11),   # Третий халвинг
    datetime(2024, 4, 19),   # Четвертый халвинг
    datetime(2025, 2, 20)    # Текущая дата
]
historical_prices = [12, 650, 8800, 70000, 97000]

# Даты халвингов
halving_dates = [datetime(2012, 11, 28), datetime(2016, 7, 9), datetime(2020, 5, 11), datetime(2024, 4, 19)]

# Периоды и CAGR
periods = ["2012-2016", "2016-2020", "2020-2024"]
cagr_values = [196, 96, 70]

# Данные для прогноза (короткий диапазон для третьего графика)
forecast_dates_short = [datetime(2024, 4, 19), datetime(2025, 2, 20), datetime(2025, 10, 1), datetime(2026, 2, 20)]
forecast_prices_short = [70000, 97000, 280000, 150000]

# Загрузка детализированных данных для четвертого графика из CSV
df = pd.read_csv('Documentation/Analysis/bitcoin_prices.csv')
df['Date'] = pd.to_datetime(df['Date'])
detailed_historical_dates = df['Date'].tolist()
detailed_historical_prices = df['Price'].tolist()

# Прогнозные данные для четвертого графика
forecast_dates = [datetime(2025, 2, 1), datetime(2025, 10, 1), datetime(2026, 2, 1)]
forecast_prices = [97000, 280000, 150000]

# Настройка стиля
plt.style.use('seaborn-v0_8')  # Актуальный стиль для новых версий Matplotlib

# График 1: Исторические цены Биткоина с отметками халвингов
plt.figure(figsize=(12, 6))
plt.plot(historical_dates, historical_prices, marker='o', color='blue', label='Цена Биткоина')
for hd in halving_dates:
    plt.axvline(x=hd, color='red', linestyle='--', label='Халвинг' if hd == halving_dates[0] else "")
plt.yscale('log')
plt.gca().xaxis.set_major_locator(mdates.YearLocator())
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
plt.title('Исторические цены Биткоина с отметками халвингов')
plt.xlabel('Год')
plt.ylabel('Цена (USD, лог. шкала)')
plt.legend()
plt.grid(True, which="both", ls="--")
for i, (date, price) in enumerate(zip(historical_dates, historical_prices)):
    plt.annotate(f'${price}', (date, price), textcoords="offset points", xytext=(0,10), ha='center')
plt.savefig('Documentation/Analysis/Graphs/historical_prices.png')
plt.close()

# График 2: Средний годовой рост (CAGR) между халвингами
plt.figure(figsize=(8, 5))
bars = plt.bar(periods, cagr_values, color='green')
plt.title('Средний годовой рост (CAGR) между халвингами')
plt.xlabel('Периоды')
plt.ylabel('CAGR (%)')
for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2, yval + 1, f'{yval}%', ha='center')
plt.savefig('Documentation/Analysis/Graphs/cagr_between_halvings.png')
plt.close()

# График 3: Прогнозный график цены Биткоина до февраля 2026 года (короткий диапазон)
plt.figure(figsize=(12, 6))
plt.plot(forecast_dates_short[:2], forecast_prices_short[:2], marker='o', color='blue', label='Исторические данные')
plt.plot(forecast_dates_short[1:], forecast_prices_short[1:], marker='o', linestyle='--', color='orange', label='Прогноз')
plt.gca().xaxis.set_major_locator(mdates.MonthLocator(interval=3))
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
plt.title('Прогноз цены Биткоина до февраля 2026 года (короткий диапазон)')
plt.xlabel('Дата')
plt.ylabel('Цена (USD)')
plt.legend()
plt.grid(True)
for i, (date, price) in enumerate(zip(forecast_dates_short, forecast_prices_short)):
    plt.annotate(f'${price}', (date, price), textcoords="offset points", xytext=(0,10), ha='center')
plt.savefig('Documentation/Analysis/Graphs/price_forecast_short.png')
plt.close()

# График 4: Детализированная история и прогноз
plt.figure(figsize=(14, 7))
plt.plot(detailed_historical_dates, detailed_historical_prices, color='blue', label='Исторические данные')
plt.plot(forecast_dates, forecast_prices, linestyle='--', color='orange', label='Прогноз')
for hd in halving_dates:
    plt.axvline(x=hd, color='red', linestyle='--', label='Халвинг' if hd == halving_dates[0] else "")
plt.yscale('log')
plt.gca().xaxis.set_major_locator(mdates.YearLocator())
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
plt.title('Детализированная история и прогноз цены Биткоина до февраля 2026 года')
plt.xlabel('Год')
plt.ylabel('Цена (USD, лог. шкала)')
plt.legend()
plt.grid(True, which="both", ls="--")
# Аннотации только для халвингов и прогнозных точек
key_dates = halving_dates + forecast_dates
key_prices = [12, 650, 8800, 70000, 97000, 280000, 150000]  # Цены для аннотаций
for date, price in zip(key_dates, key_prices):
    plt.annotate(f'${price}', (date, price), textcoords="offset points", xytext=(0,10), ha='center')
plt.savefig('Documentation/Analysis/Graphs/full_detailed_history_and_forecast.png')
plt.close()