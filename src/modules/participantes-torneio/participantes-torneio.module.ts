import { Module } from '@nestjs/common';
import { ParticipantesTorneioService } from './participantes-torneio.service';
import { ParticipantesTorneioController } from './participantes-torneio.controller';

@Module({
  controllers: [ParticipantesTorneioController],
  providers: [ParticipantesTorneioService],
})
export class ParticipantesTorneioModule {}
