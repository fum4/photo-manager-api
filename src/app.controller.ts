import { Controller, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

const ephemeralCollections =  process.env.NODE_ENV === 'development' ? [ 'users' ] : [];

@Controller()
export class AppController implements OnModuleDestroy {
  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleDestroy() {
    await Promise.all(ephemeralCollections.map(this.dropCollection));
  }

  dropCollection = async(collection: string)  =>{
    try {
      await this.connection.dropCollection(collection);
      console.log(`[DEV] Successfully dropped ${collection} collection`);
    } catch(error) {
      console.error(error);
      console.error(`[DEV] Failed dropping ${collection} collection`);
    }
  }
}
