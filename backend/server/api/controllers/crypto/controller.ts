import { Request, Response } from 'express';
import SetResponse from '../../../common/response.handler';
import * as Interfaces from '../../interfaces';
import httpStatus from 'http-status';
import MESSAGES from '../../constant/response.message';
import CryptoService from '../../services/crypto.service';
import l from '../../../common/logger';
class Controller {
  public async fetchMarketData(req: Request, res: Response): Promise<Response> {
    try {
      const { exchange, market } = req.params;
      const { symbol, interval, limit } = req.query;

      if (!exchange || !market || !symbol || !interval || !limit) {
        return SetResponse.error(res, httpStatus.BAD_REQUEST, {
          message: MESSAGES.INVALID_REQUEST,
          error: true,
        });
      }

      const validMarkets: Set<string> = new Set(['spot', 'futures']);
      if (!validMarkets.has(market)) {
        return SetResponse.error(res, httpStatus.BAD_REQUEST, {
          message: `Invalid market type: ${market}. Allowed values: 'spot', 'futures'.`,
          error: true,
        });
      }

      const parsedLimit = parseInt(limit as string, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return SetResponse.error(res, httpStatus.BAD_REQUEST, {
          message: 'Invalid limit value. Must be a positive number.',
          error: true,
        });
      }

      const response = await CryptoService.fetchMarketData(
        exchange as string,
        market as 'spot' | 'futures',
        symbol as string,
        interval as string,
        parsedLimit
      );

      return SetResponse.success(res, httpStatus.OK, {
        data: response,
        message: MESSAGES.CRYPTO.SUCCESS,
        error: false,
      });
    } catch (error: any) {
      l.error('Error fetching market data:', error);
      return SetResponse.error(
        res,
        error.status || httpStatus.INTERNAL_SERVER_ERROR,
        {
          message: error.message || MESSAGES.CRYPTO.ERROR,
          error: true,
        }
      );
    }
  }
}

export default new Controller();
