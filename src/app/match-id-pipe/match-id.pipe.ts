import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'matchId'
})
export class MatchIdPipe implements PipeTransform {

  transform(value: string, users: UserInfo[], rowObject: any): string {
    //HACK: cache result in row object, so that the for-loop doesn't
    // need to be executed on every sort, filter or every time the table reloads

    // return immediately if value was cached before
    // return on !value to get rid of errors (can't be a valid entry)
    if (!value || value.includes(', ')) {
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
