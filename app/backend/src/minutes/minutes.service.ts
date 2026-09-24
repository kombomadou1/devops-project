import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Minute } from './minutes.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Association } from 'src/associations/association.entity';

@Injectable()
export class MinutesService {
    constructor(
        @InjectRepository(Minute)
        private minuteRepository: Repository<Minute>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Association)
        private associationRepository: Repository<Association>
    ) {}

    async getById(id): Promise<Minute> {
        const minute = await this.minuteRepository.findOne({where: {id: id}});
        if (!minute) throw new HttpException('Minute non trouvée', HttpStatus.NOT_FOUND);
        return minute;
      }

    async create(date: string, content: string, idAssociation: number, idVoters: number[]): Promise<Minute> {
        const users = await this.userRepository.find({where: {id: In(idVoters)}});
        if (!users) throw new HttpException('Users non trouvés', HttpStatus.NOT_FOUND);
        const association = await this.associationRepository.findOne({where: {id: idAssociation}});
        if (!association) throw new HttpException('Association non trouvée', HttpStatus.NOT_FOUND);
        
        const minute = this.minuteRepository.create({ date, content, association, users });
        await this.minuteRepository.save(minute);
        return minute;
    }

    async update(id: number, date: string, content: string, idAssociation: number, idVoters: number[]): Promise<Minute> {
        const minute = await this.minuteRepository.findOne({where: {id: id}});
        if (!minute) throw new HttpException('Minute non trouvée', HttpStatus.NOT_FOUND);

        const users = await this.userRepository.find({where: {id: In(idVoters)}});
        if (!users) throw new HttpException('Users non trouvés', HttpStatus.NOT_FOUND);

        const association = await this.associationRepository.findOne({where: {id: idAssociation}});
        if (!association) throw new HttpException('Association non trouvée', HttpStatus.NOT_FOUND);
        
        minute.date = date;
        minute.content = content;
        minute.association = association;
        minute.users = users;
        await this.minuteRepository.save(minute);
        return minute;
  }

  async delete(id): Promise<boolean> {
    const minute = await this.getById(id);
    await this.minuteRepository.remove(minute);
    return true;
  }

}
