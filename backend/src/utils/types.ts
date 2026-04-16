import { User } from 'src/users/entities/user.entity';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';

export interface RequestUser extends Request {
  user: User;
}

export interface RequestWarehouse extends Request {
  warehouse: Warehouse;
}
