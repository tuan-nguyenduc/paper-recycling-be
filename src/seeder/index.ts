import {AppDataSource} from "../data-source";
import SchoolClassSeeder from "./school-class-seeder";

async function main() {
  await SchoolClassSeeder.run();
}

AppDataSource.initialize()
  .then(main)
  .catch((error) => {
    console.log('init error: ' + error);
  });
