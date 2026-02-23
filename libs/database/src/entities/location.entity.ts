import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { TransportType } from 'libs/common';

@Entity('locations')
@Index('IDX_locations_user_timestamp', ['userId', 'timestamp'], {
  unique: true,
})
@Index('IDX_locations_user_date', ['userId', 'date'])
export class LocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column('double precision')
  latitude: number;

  @Column('double precision')
  longitude: number;

  @Column('double precision')
  speed: number;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: TransportType,
    name: 'transport_type',
  })
  transportType: TransportType;

  @Column({ type: 'double precision', nullable: true })
  accuracy: number | null;

  @Column({ name: 'is_moving', type: 'boolean', default: false })
  isMoving: boolean;

  @Column({
    name: 'distance_from_prev',
    type: 'double precision',
    nullable: true,
  })
  distanceFromPrev: number | null;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
