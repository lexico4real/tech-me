import { User } from '../../auth/user.entity';
import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';

@Entity()
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable()
  permissions: Permission[];

  @Column({ nullable: true })
  description: string;
}
