import { ApiProperty } from '@nestjs/swagger';
import { Member } from './association.member';


export class AssociationDTO {
  @ApiProperty({
    description: 'L\'Id de l\'association',
    example: '1',
  })
  id: number;

  @ApiProperty({
    description: 'Le nom de l\'association',
    example: 'Club de Football',
  })
  name: string;

  @ApiProperty({
    description: 'La liste des membres avec leurs rôles',
    type: [Member],
  })
  members: Member[];
}


