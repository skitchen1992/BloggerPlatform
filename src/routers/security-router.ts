import { Router } from 'express';
import { PATH_URL } from '../utils/consts';
import * as controllers from '../controllers';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';

export const securityRouter = Router();

securityRouter.get(
  PATH_URL.SECURITY.DEVICES,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  controllers.getDevicesController
);

securityRouter.delete(
  PATH_URL.SECURITY.DEVICES,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  controllers.deleteDeviceListController
);

securityRouter.delete(
  PATH_URL.SECURITY.DEVICE_ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  // controllers.deleteDeviceController
);
