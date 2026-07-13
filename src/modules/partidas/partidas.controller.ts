import { Controller } from '@nestjs/common';
import { PartidasService } from './partidas.service';

@Controller('partidas')
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}
}
