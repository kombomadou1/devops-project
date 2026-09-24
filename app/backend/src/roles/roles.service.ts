import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Role } from './role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Association } from 'src/associations/association.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Association)
        private associationRepository: Repository<Association>
    ) {}

    async getUserRoleInAssociation(userId, associationId): Promise<Role> {
        const role = await this.roleRepository.findOne({where: {idUser: userId, idAssociation: associationId}});
        if (!role) {
            throw new HttpException('Role ou association non trouvé', HttpStatus.NOT_FOUND);
        }
        return role;
    }
    
    async getUsersHavingRole(name: string): Promise<User[]> {
        const roles = await this.roleRepository.find({where: {name: name}});
        if (!roles) 
            throw new HttpException('Role trouvé', HttpStatus.NOT_FOUND);
        const ids = roles.map(r => r.idUser);
        const users = await this.userRepository.find({where: { id: In(ids) },});
        
        return users;
    }

    async create(name: string, idUser: number, idAssociation: number): Promise<Role> {
        const user = await this.userRepository.findOne({ where: { id: idUser } });
        if (!user) throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);

        const association = await this.associationRepository.findOne({ where: { id: idAssociation } });
        if (!association) throw new HttpException('Association non trouvée', HttpStatus.NOT_FOUND);

        const role = new Role();
        role.idUser = user.id;
        role.idAssociation = association.id;
        role.name = name;
        role.user = user;
        role.association = association;

        return await this.roleRepository.save(role);
    }

    async update(idUser: number, idAssociation: number, name: string): Promise<Role> {
        const role = await this.roleRepository.findOne({where: {idUser:idUser, idAssociation: idAssociation} });
        if (!role) throw new HttpException('Role non trouvé', HttpStatus.NOT_FOUND);
        role.name = name;

        return await this.roleRepository.save(role);
  }

  async delete(idUser: number, idAssociation: number): Promise<boolean> {
    const role = await this.roleRepository.findOne({where: {idUser:idUser, idAssociation: idAssociation} });
    if (!role) throw new HttpException('Role non trouvé', HttpStatus.NOT_FOUND);
    await this.roleRepository.remove(role);
    return true;
  }
}




