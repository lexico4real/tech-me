import { Role } from '../../role/entities/role.entity';
import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity()
export class Permission extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @Column({ nullable: true })
  description: string;
}
