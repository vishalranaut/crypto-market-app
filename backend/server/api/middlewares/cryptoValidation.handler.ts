import Joi from 'joi';

export class CryptoValidationHandler {
  validateFetchMarketData = {
    params: Joi.object().keys({
      exchange: Joi.string()
        .valid('binance', 'bybit', 'mexc', 'kucoin')
        .required(),
      market: Joi.string().valid('spot', 'futures').required(),
    }),
    query: Joi.object().keys({
      symbol: Joi.string().required(),
      interval: Joi.string()
        .valid('1m', '5m', '15m', '1h', '4h', '1d')
        .required(),
      limit: Joi.number().integer().min(1).max(1000).required(),
    }),
  };
}

export default new CryptoValidationHandler();
