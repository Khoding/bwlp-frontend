import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'size'
})
export class SizePipe implements PipeTransform {

  transform(value: number, ...args: any[]): string {
    if (value == 0) {
      return '0 B'
    }
    // get size unit according to scale of value
    const unit_index: number = Math.floor(Math.log2(value) / 10)
    const displayValue: number = value / (Math.pow(1024, unit_index))
    const sizeUnits: string[] = ['B', 'KiB', 'MiB', 'GiB']

    return displayValue.toFixed(1) + sizeUnits[unit_index];
  }
}

