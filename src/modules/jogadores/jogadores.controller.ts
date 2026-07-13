import { Controller, Get } from '@nestjs/common';
import { JogadoresService } from './jogadores.service';

@Controller('jogadores')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Get()
  listarJogadores() {
    return this.jogadoresService.listarJogadores();
  }
}
