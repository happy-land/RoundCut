import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CutsService } from './cuts.service';
import { CreateCutDto } from './dto/create-cut.dto';
import { UpdateCutDto } from './dto/update-cut.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('cuts')
export class CutsController {
  constructor(private readonly cutsService: CutsService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createCutDto: CreateCutDto) {
    return this.cutsService.create(createCutDto);
  }

  @Get()
  findAll() {
    return this.cutsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.cutsService.findOneById(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCutDto: UpdateCutDto) {
    return this.cutsService.update(+id, updateCutDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cutsService.remove(+id);
  }
}
