import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Association } from 'src/associations/association.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, Association])],
  controllers: [RolesController],
  providers: [RolesService]
})
export class RolesModule {}


