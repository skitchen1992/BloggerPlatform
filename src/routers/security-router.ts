import { Router } from 'express';
import { PATH_URL } from '../utils/consts';
import { errorHandlingMiddleware } from '../middlewares/error-handling-middleware';
import { sanitizerQueryMiddleware } from '../middlewares/sanitizer-query-middleware';
import { securityController } from '../compositions/composition-root';

export const securityRouter = Router();

securityRouter.get(
  PATH_URL.SECURITY.DEVICES,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  securityController.getDevices.bind(securityController),
);

securityRouter.delete(
  PATH_URL.SECURITY.DEVICES,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  securityController.deleteDeviceList.bind(securityController),
);

securityRouter.delete(
  PATH_URL.SECURITY.DEVICE_ID,
  sanitizerQueryMiddleware(),
  errorHandlingMiddleware,
  securityController.deleteDevice.bind(securityController),
);
