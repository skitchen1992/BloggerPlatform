import { SETTINGS } from './utils/settings';
import { app } from './app';
import { db } from './db/connection';


const startApp = async () => {

  if (await db.connect(SETTINGS.MONGO_DB_URL)) {
    app.set('trust proxy', true);

    app.listen(SETTINGS.PORT, () => {
      console.log(`App listening on port ${SETTINGS.PORT}`);
    });
  } else {
    console.log('Failed to connect to database');
    process.exit(1);
  }
};

startApp();
