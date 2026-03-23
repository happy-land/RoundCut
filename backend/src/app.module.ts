import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { Category } from './categories/entities/category.entity';
import { CartModule } from './cart/cart.module';
import { CartItem } from './cart/entities/cartitem.entity';
// import { MailerModule } from '@nestjs-modules/mailer';
import { AppService } from './app.service';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    // MailerModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     transport: {
    //       host: configService.get<string>('MAIL_HOST'),
    //       port: configService.get<string>('MAIL_PORT'),
    //       secure: false,
    //       auth: {
    //         user: configService.get<string>('MAIL_USER'),
    //         pass: configService.get<string>('MAIL_PASSWORD'),
    //       },
    //     },
    //     defaults: {
    //       from: configService.get<string>('MAIL_SENDER'),
    //     },
    //   }),
    // }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      schema: process.env.POSTGRES_SCHEMA,
      entities: [User, Priceitem, Warehouse, Markup, Cut, Cutitem, Category, CartItem],
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
    CartModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
