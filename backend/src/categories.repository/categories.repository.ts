import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesRepository {
  public categories: string[] = [];
  public flag = 'begin';

  save(category: string) {
    if (this.categories.find((cat) => cat === category)) {
      // throw new Error('Category already exists');
      // console.log(`Category ${category} already exists in ${this.categories}`);
    } else {
      this.categories.push(category);
    }

    return category;
  }

  switchFlag() {
    this.flag = 'end';
  }
}
