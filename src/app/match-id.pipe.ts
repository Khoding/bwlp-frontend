import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'matchId'
})
export class MatchIdPipe implements PipeTransform {

  transform(value: string, users: UserInfo[]): string {
    for (let i = 0; i < users.length; i++) {
      if (value === users[i].userId) {
        value = users[i].lastName + ', ' + users[i].firstName;
        break;
      }
    }
    return value
  }

}
