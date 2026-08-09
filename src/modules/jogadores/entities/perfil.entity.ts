import { PerfilEnum } from 'src/enums/app-enums';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('perfis')
export class Perfil {
  @PrimaryColumn({ name: 'id_perfil', type: 'integer' })
  idPerfil: number;

  @Column({ name: 'nome', type: 'varchar' })
  nome: PerfilEnum;
}
