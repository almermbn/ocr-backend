import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantesTorneio } from './entities/participantes-torneio.entity';
import { ParticipantesTorneioController } from './participantes-torneio.controller';
import { ParticipantesTorneioService } from './participantes-torneio.service';

@Module({
  imports: [TypeOrmModule.forFeature([ParticipantesTorneio])],
  controllers: [ParticipantesTorneioController],
  providers: [ParticipantesTorneioService],
})
export class ParticipantesTorneioModule {}
