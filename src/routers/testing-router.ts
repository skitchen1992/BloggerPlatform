import { Router } from 'express';
import { PATH_URL } from '../utils/consts';
import { deleteAllDataController } from '../controllers';

export const testingRouter = Router({});

testingRouter.delete(PATH_URL.TESTING.ALL_DATA, deleteAllDataController);
