import { ApiProperty } from "@nestjs/swagger";

export class AssociationInput {
    @ApiProperty({
        description: 'The name of the association',
        example: "Sports Club",
        type: String,
    })
    public name: string;
}


