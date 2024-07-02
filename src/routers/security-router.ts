import { Router } from 'express';
import { PATH_URL } from '../utils/consts';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { deviceController } from '../controllers/device-controller';

export const securityRouter = Router();

securityRouter.get(
  PATH_URL.SECURITY.DEVICES,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  deviceController.getDevices,
);

securityRouter.delete(
  PATH_URL.SECURITY.DEVICES,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  deviceController.deleteDeviceList,
);

securityRouter.delete(
  PATH_URL.SECURITY.DEVICE_ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  deviceController.deleteDevice,
);
