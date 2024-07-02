import { Router } from 'express';
import { PATH_URL } from '../utils/consts';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { securityController } from '../controllers/device-controller';

export const securityRouter = Router();

securityRouter.get(
  PATH_URL.SECURITY.DEVICES,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  securityController.getDevices,
);

securityRouter.delete(
  PATH_URL.SECURITY.DEVICES,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  securityController.deleteDeviceList,
);

securityRouter.delete(
  PATH_URL.SECURITY.DEVICE_ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  securityController.deleteDevice,
);
