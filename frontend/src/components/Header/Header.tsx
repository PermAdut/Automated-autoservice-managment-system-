import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CarIcon, 
  UserIcon, 
  WrenchIcon, 
  CalendarIcon, 
  LogoutIcon 
} from '../icons';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-black shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center">
          <WrenchIcon className="w-10 h-10 mr-3" />
          <h1 className="text-2xl font-bold">АвтоСервис</h1>
        </div>
        <nav className="flex space-x-6">
          <Link 
            to="/dashboard" 
            className="flex items-center hover:text-blue-200 transition"
          >
            <CarIcon className="w-5 h-5 mr-2" />
            Машины
          </Link>
          <Link 
            to="/orders" 
            className="flex items-center hover:text-blue-200 transition"
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            Заказы
          </Link>
          <Link 
            to="/clients" 
            className="flex items-center hover:text-blue-200 transition"
          >
            <UserIcon className="w-5 h-5 mr-2" />
            Клиенты
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {/* //{username && ( */}
            <div className="flex items-center">
              <UserIcon className="w-6 h-6 mr-2" />
              <span>*Заглушка*</span>
            </div>
          {/* //)} */}
          
          {/* {onLogout && ( */}
            <button 
              onClick={() => {console.log(1)}}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded flex items-center"
            >
              <LogoutIcon className="w-5 h-5 mr-2" />
              Выход
            </button>
          {/* )} */}
        </div>
      </div>
    </header>
  );
};

export default Header;