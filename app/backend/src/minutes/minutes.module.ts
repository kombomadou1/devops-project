import { Module } from '@nestjs/common';
import { MinutesController } from './minutes.controller';
import { MinutesService } from './minutes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Minute } from './minutes.entity';
import { Association } from 'src/associations/association.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Minute,Association, User])],
  controllers: [MinutesController],
  providers: [MinutesService]
})
export class MinutesModule {}
