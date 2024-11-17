import { Module } from '@nestjs/common';
import { CutsService } from './cuts.service';
import { CutsController } from './cuts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cut } from './entities/cut.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cut])],
  controllers: [CutsController],
  providers: [CutsService],
  exports: [CutsService],
})
export class CutsModule {}
