import { Injectable, HttpException } from '@nestjs/common';
import { USERS } from '../../mocks/users.mocks';
import { User, Users } from '../../interfaces/users.interface';

@Injectable()
export class UsersService {
  users: Users = USERS;

  async getUser(userId: string): Promise<User> {
    if (userId in this.users) {
      return this.users[userId];
    } else {
      throw new Error(`User doesn't exist!`);
    }
  }

  async addUser(user: User): Promise<Users> {
    const userExist = user.id in this.users;
    const nameExist = Object.values(this.users).findIndex(
      each => each.name === user.name
    );
    // console.log(exist);
    if (userExist) {
      throw new Error('User exists!');
    } else if (nameExist !== -1) {
      throw new Error('Duplicated name!');
    }
    this.users[user.id] = user;
    return this.users;
  }

  async updateUser(updatedUser: User): Promise<Users> {
    this.users[updatedUser.id] = updatedUser;
    return this.users;
  }

  async deleteUser(userId: string): Promise<Users> {
    delete this.users[userId];
    return this.users;
  }
}
