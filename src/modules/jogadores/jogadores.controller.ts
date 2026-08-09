import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { JogadoresService } from './jogadores.service';

@Controller('jogadores')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Public()
  @Post()
  async criarJogador(@Body() dto: CriarJogadorDto) {
    return this.jogadoresService.criarJogador(dto);
  }

  @Get()
  listarJogadores() {
    return this.jogadoresService.listarJogadores();
  }
}
