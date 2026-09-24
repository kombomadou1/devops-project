import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { Association } from './association.entity';
import { User } from 'src/users/user.entity';
import { ApiTags, ApiCreatedResponse, ApiParam } from '@nestjs/swagger';
import { AssociationInput } from './AssociationInput';
import { AssociationDTO } from './association.dto';
import { Minute } from 'src/minutes/minutes.entity';
import { Member } from './association.member';

@ApiTags('associations')
@Controller('associations')
export class AssociationsController {
  constructor(private service: AssociationsService) {}

  @Get()
  @ApiCreatedResponse({
    description: 'Liste des associations',
    type: [Association],
  })
  async getAll(): Promise<AssociationDTO[]> {
    return await this.service.getAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Association ID' })
  @ApiCreatedResponse({
    description: "L'association correspondante",
    type: Association,
  })
  async getById(@Param() parameter): Promise<AssociationDTO> {
    return await this.service.getById(parameter.id);
  }

  @Get(':id/members')
  @ApiParam({ name: 'id', description: 'Association ID' })
  @ApiCreatedResponse({
    description: "Liste des membres de l'association",
    type: [User],
  })
  async getMembersById(@Param() parameter): Promise<Member[]> {
    return await this.service.getMembersById(parameter.id);
  }

  @Get(':id/minutes')
@ApiParam({ name: 'id', description: 'Association ID' })
@ApiCreatedResponse({
  description: "Liste des procès verbaux d'une association",
  type: [Minute],
})
async getMinutesById(@Param('id') id: number, @Query('sort') sort?: string, @Query('order') order?: 'ASC' | 'DESC',): Promise<Minute[]> {
  return this.service.getMinutesById( Number(id), sort as 'date' | undefined, order,);
}


  @Post()
  @ApiCreatedResponse({
    description: "L'association a été créée avec succès",
    type: Association,
  })
  async create(@Body() input: AssociationInput): Promise<Association> {
    return await this.service.create(input.name);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Association ID' })
  @ApiCreatedResponse({
    description: "L'association a été mise à jour avec succès",
    type: Association,
  })
  async update(
    @Param() parameter,
    @Body() input: AssociationInput,
  ): Promise<Association> {
    return await this.service.update(parameter.id, input.name);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Association ID' })
  @ApiCreatedResponse({
    description: "L'association a été supprimée avec succès",
    type: Boolean,
  })
  async delete(@Param() parameter): Promise<boolean> {
    return await this.service.delete(parameter.id);
  }
}
