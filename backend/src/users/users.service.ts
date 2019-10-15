import { Injectable, HttpException } from '@nestjs/common';
import { USERS } from '../mocks/users.mocks';
import { User } from '../interfaces/users.interface';

@Injectable()
export class UsersService {
  users: User[] = USERS;

  getUser(userId: string): Promise<User> {
    return new Promise(res => {
      const user = this.users.filter(user => user.id === userId)[0];
      if (user !== undefined) {
        res(user);
      } else {
        throw new Error(`User doesn't exist!`);
      }
    });
  }

  addUser(user: User): Promise<any> {
    return new Promise(resolve => {
      const exist = this.users.findIndex(one => one.id === user.id);
      // console.log(exist);
      if (exist === -1) {
        this.users.push(user);
      }
      resolve(this.users);
    });
  }

  updateUser(updatedUser: User): Promise<any> {
    return new Promise(res => {
      this.users.forEach(user => {
        if (user.id === updatedUser.id) {
          user = updatedUser;
        }
      });
      res(this.users);
    });
  }

  deleteUser(userId: string): Promise<any> {
    return new Promise(resolve => {
      const index = this.users.findIndex(user => user.id === userId);
      if (index === -1) {
        throw new HttpException(`User doesn't exist!`, 404);
      }
      this.users.splice(index, 1);
      resolve(this.users);
    });
  }
}
