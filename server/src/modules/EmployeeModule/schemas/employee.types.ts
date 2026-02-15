export interface Employee {
  id: string;
  positionId: string;
  hireDate: string;
  salary: number;
}

export interface Position {
  id: string;
  name: string;
  description: string;
}

export interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Order {
  id: string;
  status: string;
}
