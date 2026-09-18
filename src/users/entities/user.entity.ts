import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', length: 255, unique: true })
  email: string;

  @Column({ type: 'character varying', length: 255 })
  password: string;

  @Column({ type: 'text', array: true, default: [] })
  roles: string[];
}
