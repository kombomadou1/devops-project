import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService,
        private jwtService: JwtService
        
    ) {}

    public async validateUser(id: number, password: string) : Promise<User|undefined> {
        const user = await this.usersService.getById(id);
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (user && passwordMatch) {
            return user;
        }
        return undefined;
    }

    async login(user: any) {
        const payload = { username: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}


