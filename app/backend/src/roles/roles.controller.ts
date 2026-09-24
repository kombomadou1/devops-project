import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Role } from './role.entity';
import { RolesService } from './roles.service';
import { RoleInput } from './RoleInput';
import { RoleUpdate } from './RoleUpdate';
import { User } from 'src/users/user.entity';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
    constructor(private roleService: RolesService) {}
    
    @Get('users/:name')
    @ApiCreatedResponse({
        description: "Les utilisateurs ayant le rôle donné",
        type: User,
    })
    async getUsersHavingRole(@Param() parameter): Promise<User[]> {
        console.log("the name is: "+parameter.name);
        return await this.roleService.getUsersHavingRole(parameter.name);
    }

    @Get(':idUser/:idAssociation')
    @ApiCreatedResponse({
        description: "Le rôle correspondant",
        type: Role,
    })
    async getUserRoleInAssociation(@Param() parameter): Promise<Role> {
        return await this.roleService.getUserRoleInAssociation(parameter.idUser, parameter.idAssociation);
    }
    
    @Post()
    @ApiCreatedResponse({
        description: "Le rôle a été créé avec succès.",
        type: Role,
    })
    async create(@Body() input: RoleInput): Promise<Role> {
        return await this.roleService.create(input.name, input.idUser, input.idAssociation);
    }

    @Put(':idUser/:idAssociation')
    @ApiCreatedResponse({
        description: "Le rôle a été mis à jour avec succès.",
        type: Role,
    })
    async update(@Param() parameter, @Body() input: RoleUpdate): Promise<Role> {
        return await this.roleService.update(
            parameter.idUser,
            parameter.idAssociation,
            input.name
        );
    }

    @Delete(':idUser/:idAssociation')
    @ApiCreatedResponse({
        description: "Le rôle a été supprimé avec succès.",
        type: Boolean,
    })
    async delete(@Param() parameter): Promise<boolean> {
        return await this.roleService.delete(parameter.idUser, parameter.idAssociation);
    }
}




