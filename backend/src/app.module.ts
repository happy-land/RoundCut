import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CsvModule } from './csv/csv.module';
import { PriceitemsModule } from './priceitems/priceitems.module';
import { Priceitem } from './priceitems/entities/priceitem.entity';
import { WarehousesModule } from './warehouses/warehouses.module';
import { MarkupsModule } from './markups/markups.module';
import { Warehouse } from './warehouses/entities/warehouse.entity';
import { Markup } from './markups/entities/markup.entity';
import { CutsModule } from './cuts/cuts.module';
import { Cut } from './cuts/entities/cut.entity';
import { CutitemsModule } from './cutitems/cutitems.module';
import { Cutitem } from './cutitems/entities/cutitem.entity';
import { CategoriesModule } from './categories/categories.module';
import { CategoriesRepository } from './categories.repository/categories.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      schema: process.env.POSTGRES_SCHEMA,
      entities: [User, Priceitem, Warehouse, Markup, Cut, Cutitem],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CsvModule,
    PriceitemsModule,
    WarehousesModule,
    MarkupsModule,
    CutsModule,
    CutitemsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [CategoriesRepository],
})
export class AppModule {}
