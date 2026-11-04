import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { SchemesService } from './schemes.service';
import { UpdateSchemeStatusDto } from './dto/update-scheme-status.dto';

@UseGuards(JwtGuard)
@Controller('schemes')
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  /** POST /schemes/from-order/:orderId — сформировать схему из заказа */
  @Post('from-order/:orderId')
  generateFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: any,
  ) {
    return this.schemesService.generateFromOrder(orderId, req.user);
  }

  /** GET /schemes — список схем */
  @Get()
  findAll() {
    return this.schemesService.findAll();
  }

  /** GET /schemes/:id — документ целиком */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schemesService.findOne(id);
  }

  /** PATCH /schemes/:id/status — Принято / Выполнено (менеджер, админ) */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSchemeStatusDto,
  ) {
    return this.schemesService.updateStatus(id, dto);
  }
}

