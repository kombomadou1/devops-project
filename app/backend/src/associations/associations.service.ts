import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Association } from './association.entity';
import { User } from 'src/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { map } from 'rxjs';
import { Role } from 'src/roles/role.entity';
import { AssociationDTO } from './association.dto';
import { Minute } from 'src/minutes/minutes.entity';
import { Member } from './association.member';

@Injectable()
export class AssociationsService {
  constructor(
    @InjectRepository(Association)
    private repository: Repository<Association>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Minute)
    private minuteRepository: Repository<Minute>,
  ) {}

  async getAll(): Promise<AssociationDTO[]> {
      const associations = await this.repository.find({
      relations: ['roles', 'roles.user'],
    });
    
    return associations.map(association => this.toDTO(association));
  }

  async getById(id): Promise<AssociationDTO> {
    const association = await this.repository.findOne({ where: { id: id }, relations: ['roles','roles.user'] });
    if (!association) {
      throw new HttpException('Association non trouvé', HttpStatus.NOT_FOUND);
    }
    console.log(association); 
    
    return this.toDTO(association);
  }

  async getMembersById(id): Promise<Member[]>  {
    const association = await this.getById(id);
    //const users = association.roles.map(role => role.user);
    return association.members;
  }

  async getMinutesById(id: number, sort: 'date' | undefined, order: 'ASC' | 'DESC' | undefined): Promise<Minute[]> {
    const sortField = sort === 'date' ? 'date' : undefined;
    const sortOrder: 'ASC' | 'DESC' = order === 'DESC' ? 'DESC' : 'ASC';

    const association = await this.repository.findOne({ where: { id } });
    if (!association) {
      throw new HttpException('Association non trouvée', HttpStatus.NOT_FOUND);
    }

    if (sortField) {
      return this.minuteRepository.find({
        where: { association: { id } },
        order: { [sortField]: sortOrder },
      });
    }

    return this.minuteRepository.find({ where: { association: { id } } });
  }


  async create(name: string): Promise<Association> {

    const association = this.repository.create({ name });
    await this.repository.save(association);
    return association;
  }

  async update(id: number, name: string): Promise<Association> {
    const association = await this.repository.findOne({ where: { id: id }, relations: ['roles','roles.user'] });
    if (!association) {
      throw new HttpException('Association non trouvé', HttpStatus.NOT_FOUND);
    }
    association.name = name;
    await this.repository.save(association);
    return association;
  }


  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Association non trouvée', HttpStatus.NOT_FOUND);
    }
    return true;
  }

  private toDTO(association: Association): AssociationDTO {
      const dto = new AssociationDTO();
      dto.name = association.name;
      dto.id = association.id;
      
    dto.members = association.roles.map(role => {
      const member = new Member();
      member.id = role.user.id;
      member.name = role.user.lastname;
      member.firstname = role.user.firstname;
      member.age = role.user.age;
      member.role = role.name;
      return member;
    });
    
    return dto;
  }

}


