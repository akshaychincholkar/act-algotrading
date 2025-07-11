# Algorithmic Trading Project

This project implements an algorithmic trading screener that filters stocks from NSE India based on various technical indicators. The screener operates on a daily time frame and applies multiple filters to identify potential trading opportunities in midcap stocks.

## Project Structure

```
algorithmic-trading-project
├── src
│   ├── main.py                # Entry point of the application
│   ├── filters                # Contains filter implementations
│   │   ├── ema_filter.py      # Filter for EMA conditions
│   │   ├── rsi_filter.py      # Filter for RSI conditions
│   │   ├── macd_filter.py     # Filter for MACD conditions
│   │   ├── adx_filter.py      # Filter for ADX conditions
│   │   ├── bollinger_filter.py # Filter for Bollinger Bands conditions
│   │   └── volume_filter.py    # Filter for volume conditions
│   ├── utils                  # Contains utility functions and classes
│   │   ├── nse_data_fetcher.py # Fetches stock data from NSE India
│   │   ├── stock_screener.py   # Applies all filters to stock data
│   │   └── indicators.py        # Contains functions for technical indicators
│   └── config                 # Configuration settings
│       └── settings.py        # API keys and constants
├── requirements.txt           # Project dependencies
└── README.md                  # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd algorithmic-trading-project
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Configure any necessary settings in `src/config/settings.py`.

## Usage

To run the stock screener, execute the following command:
```
python src/main.py
```

## Functionality

The stock screener applies the following filters to identify potential trading opportunities:

1. **EMA Filter**: Today's close must be greater than the 5, 13, and 26 EMA values.
2. **RSI Filter**: RSI should be greater than 50.
3. **MACD Filter**: MACD should be positive on a weekly time frame.
4. **ADX Filter**: Positive ADX must be greater than negative ADX and ADX must be greater than 30.
5. **Bollinger Band Filter**: Upper Bollinger band must be greater than today's close.
6. **Volume Filter**: Today's close must be greater than yesterday's close and volume must be greater than the 20-day average volume.

All stocks filtered are midcap stocks from NSE India.