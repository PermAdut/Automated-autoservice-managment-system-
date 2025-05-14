export interface Employee {
  id: number;
  positionId: number;
  hireDate: string;
  salary: number;
}

export interface Position {
  id: number;
  name: string;
  description: string;
}

export interface Schedule {
  id: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Order {
  id: number;
  status: string;
}
