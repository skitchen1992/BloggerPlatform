import { SETTINGS } from './utils/settings';
import { app } from './app';
import { connectToDb } from './db/collection';

const url = SETTINGS.MONGO_DB_URL;

const startApp = async () => {
  if (url) {
    if (!(await connectToDb(url))) {
      console.log('Not connected to data base');
      process.exit(1);
    }
    app.set('trust proxy', true);
    app.listen(SETTINGS.PORT, () => {
      console.log(`App listening on port ${SETTINGS.PORT}`);
    });
  } else {
    console.log('URL not found');
    process.exit(1);
  }
};

startApp();
