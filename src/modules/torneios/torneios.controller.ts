import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OcrPlayerResultDto } from 'src/ocr/dto/ocr-read-response.dto';
import { Usuario } from '../auth/decorators/usuario.decorator';
import { UsuarioPayload } from '../auth/dto/usuario-payload.dto';
import { CriarTorneioDto } from './dto/criar-torneio.dto';
import { InscreverTorneioDto } from './dto/inscrever-torneio.dto';
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

  @Post('lancar-partida/:idTorneio/:numeroRodada')
  async lancarPartida(
    @Param('idTorneio') idTorneio: number,
    @Param('numeroRodada') numeroRodada: number,
    @Body() _partida: OcrPlayerResultDto[],
  ) {
    return await this.torneiosService.lancarPartida(
      idTorneio,
      numeroRodada,
      _partida,
    );
  }

  @Delete(':id')
  async removerSorteio(@Param('id') id: number) {
    return await this.torneiosService.removerSorteio(id);
  }

  @Post('inscricao/:idTorneio')
  async inscreverJogador(
    @Param('idTorneio') idTorneio: number,
    @Usuario() jogador: UsuarioPayload,
    @Body() dto?: InscreverTorneioDto,
  ) {
    return await this.torneiosService.inscreverJogador(
      idTorneio,
      jogador,
      dto?.idsJogadores,
    );
  }
}
