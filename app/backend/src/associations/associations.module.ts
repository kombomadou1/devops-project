import { Module } from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { AssociationsController } from './associations.controller';
import { User } from 'src/users/user.entity';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Association } from './association.entity';
import { RolesModule } from 'src/roles/roles.module';
import { Role } from 'src/roles/role.entity';
import { Minute } from 'src/minutes/minutes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Association, User, Role, Minute]), UsersModule, RolesModule],
  providers: [AssociationsService],
  controllers: [AssociationsController],
})
export class AssociationsModule {}


