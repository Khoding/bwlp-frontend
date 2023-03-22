import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'matchId'
})
export class MatchIdPipe implements PipeTransform {

  transform(value: string, users: UserInfo[], rowObject: any): string {
    //HACK: cache result in row object, so that sorting or filtering
    // doesn't need to run it everytime

    // return immediately if value was cached before
    if (value.includes(', ')) {
      return value
    }
    for (let i = 0; i < users.length; i++) {
      if (value === users[i].userId) {
        value = users[i].lastName + ', ' + users[i].firstName;
        break;
      }
    }
    // cache value
    if (rowObject) {
      rowObject.ownerId = value
    }

    return value
  }

}
