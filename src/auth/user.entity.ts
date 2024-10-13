import { AccountStatus } from '../../common/util/enums/account-status';
import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Gender } from '../../common/util/enums/gender';
import { Role } from 'src/role/entities/role.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  otherName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({ enum: Gender })
  gender: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ nullable: true })
  image: string;

  @Column()
  lgaOfResidence: string;

  @Column()
  stateOfResidence: string;

  @Index()
  @Column({ enum: AccountStatus, default: AccountStatus.INACTIVE })
  status: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;
}
