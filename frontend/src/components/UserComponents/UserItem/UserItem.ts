import { UserDetailed } from "../../../api/usersApi";

export interface UserItemProps {
  id: number;
  name: string;
  secondName: string;
  orders?: Order[];
  onDelete: () => void;
  onUpdate: (userData: Partial<UserDetailed>) => void;
}

export interface Order {
  title: string;
  description?: string;
  dateStart: string;
  dateEnd: string;
}
