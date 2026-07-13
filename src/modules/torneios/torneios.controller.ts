import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OcrPlayerResultDto } from 'src/ocr/dto/ocr-read-response.dto';
import { CriarTorneioDto } from './dto/criar-torneio.dto';
import { TorneiosService } from './torneios.service';

@Controller('torneios')
export class TorneiosController {
  constructor(private readonly torneiosService: TorneiosService) {}

  @Post()
  async criarTorneio(@Body() torneio: CriarTorneioDto) {
    console.log('Torneio recebido no controller:', torneio);
    return await this.torneiosService.criarTorneio(torneio);
  }

  @Get()
  async buscarTorneios() {
    return await this.torneiosService.buscarTorneios();
  }

  @Post('lancar-partida/:idTorneio')
  async lancarPartida(
    @Param('idTorneio') idTorneio: number,
    @Body() _partida: OcrPlayerResultDto[],
  ) {
    return await this.torneiosService.lancarPartida(idTorneio, _partida);
  }
}
