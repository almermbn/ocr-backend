import { Controller, Get, Param } from '@nestjs/common';
import { PartidasService } from './partidas.service';

@Controller('partidas')
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}

  @Get('/:id')
  async listarPartidasTorneio(@Param('id') id: number) {
    return await this.partidasService.listarPartidasTorneio(id);
  }
}
