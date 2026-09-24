import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserInput } from './UserInput';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/role.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  
  @Get()
  @ApiCreatedResponse({
      description: 'Liste des utilisateurs',
      type: [User],
  })
  async getAll(): Promise<User[]> {
    return await this.service.getAll();
  }
  
  //@UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiCreatedResponse({
      description: "L'utilisateur correspondant",
      type: User,
  })
  async getById(@Param() parameter): Promise<User> {
    return await this.service.getById(parameter.id);
  }
  
  @Get(':id/roles')
  @ApiCreatedResponse({
      description: "Les roles de l'utilisateur",
      type: User,
  })
  async getRoles(@Param() parameter): Promise<Role[]> {
    return await this.service.getRoles(parameter.id);
  }

  @Post()
  @ApiCreatedResponse({
      description: "L'utilisateur a été créé avec succès.",
      type: User,
  })
  async create(@Body() input: UserInput): Promise<User> {
    const password: string = input.password;
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return await this.service.create(input.lastname, input.firstname, input.age, hash);
  }

  @Put(':id')
  @ApiCreatedResponse({
      description: "L'utilisateur a été mis à jour avec succès.",
      type: User,
  })
  async update(@Param() parameter, @Body() input: UserInput): Promise<User> {
    return await this.service.update(
      parameter.id,
      input.lastname,
      input.firstname,
      input.age,
      input.password
    );
  }

  @Delete(':id')
  @ApiCreatedResponse({
      description: "L'utilisateur a été supprimé avec succès.",
      type: Boolean,
  })
  async delete(@Param() parameter): Promise<boolean> {
    return await this.service.delete(parameter.id);
  }
}




