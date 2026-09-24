import { ApiProperty } from '@nestjs/swagger';

export class Member {

  @ApiProperty({
    description: 'Le nom de famille du membre',
    example: 'Dupont',
  })
  id: number;
  
  @ApiProperty({
    description: 'Le nom de famille du membre',
    example: 'Dupont',
  })
  name: string;

  @ApiProperty({
    description: 'Le prénom du membre',
    example: 'Jean',
  })
  firstname: string;

  @ApiProperty({
    description: 'L\'âge du membre',
    example: 25,
  })
  age: number;

  @ApiProperty({
    description: 'Le rôle du membre dans l\'association',
    example: 'Président',
  })
  role: string;
}


