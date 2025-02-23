import express from 'express';
import Controller from './controller';

import validate from '../../middlewares/validation.handler';
import cryptoValidation from '../../middlewares/cryptoValidation.handler';
export default express
  .Router()
  .get(
    '/:exchange/:market',
    validate(cryptoValidation.validateFetchMarketData),
    Controller.fetchMarketData
  );
