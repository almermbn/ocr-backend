import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Jogadores } from '../../jogadores/entities/jogadores.entity';
import { Torneio } from '../../torneios/entities/torneio.entity';

@Entity('participantes_torneio')
export class ParticipantesTorneio {
  @PrimaryGeneratedColumn({ name: 'id_participante_torneio' })
  idParticipanteTorneio: number;

  @ManyToOne(() => Torneio, (torneio) => torneio.participantes)
  @JoinColumn({ name: 'id_torneio', referencedColumnName: 'idTorneio' })
  torneio: Torneio;

  @ManyToOne(() => Jogadores, {})
  @JoinColumn({ name: 'id_jogador' })
  jogador: Jogadores;
}
