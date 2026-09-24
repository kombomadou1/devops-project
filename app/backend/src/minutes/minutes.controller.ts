import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MinutesService } from './minutes.service';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { Minute } from './minutes.entity';
import { MinuteInput } from './MinuteInput';
import { MinuteUpdate } from './MinuteUpdate';

@Controller('minutes')
export class MinutesController {
    constructor(private minuteService: MinutesService) {}
    
    @Get(':id')
    @ApiCreatedResponse({
        description: "La minute correspondante",
        type: Minute,
    })
    async getById(@Param() parameter): Promise<Minute> {
        return await this.minuteService.getById(parameter.id);
    }

    @Post()
    @ApiCreatedResponse({
        description: "La minute a été créée avec succès.",
        type: Minute,
    })
    async create(@Body() input: MinuteInput): Promise<Minute> {
        return await this.minuteService.create(input.date, input.content, input.idAssociation, input.idVoters);
    }

    @Put(':id')
    @ApiCreatedResponse({
        description: "La minute a été mise à jour avec succès.",
        type: Minute,
    })
    async update(@Param() parameter, @Body() input: MinuteUpdate): Promise<Minute> {
        return await this.minuteService.update(parameter.id, input.date, input.content, input.idAssociation, input.idVoters);
    }

    @Delete(':id')
    @ApiCreatedResponse({
        description: "La minute a été supprimée avec succès.",
        type: Boolean,
    })
    async delete(@Param() parameter): Promise<boolean> {
        return await this.minuteService.delete(parameter.id);
    }
}
