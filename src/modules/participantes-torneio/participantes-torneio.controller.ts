import { Controller } from '@nestjs/common';
import { ParticipantesTorneioService } from './participantes-torneio.service';

@Controller('participantes-torneio')
export class ParticipantesTorneioController {
  constructor(
    private readonly participantesTorneioService: ParticipantesTorneioService,
  ) {}
}
