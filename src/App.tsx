import { useState } from 'react';
import './App.css';
import { Menu, MenuConfig } from './menuconfig';

const MenuLocalStorageKey = 'WebGlFundamentalsMenu';
let defaultMenu = MenuConfig[0];

const data = window.localStorage.getItem(MenuLocalStorageKey);
if (data) {
    const menuId = JSON.parse(data) as number;
    const menuInfo = MenuConfig.find(item => item.id === menuId);
    if (menuInfo) {
        defaultMenu = menuInfo;
    }
}

function App() {
    const [menu, setMenu] = useState<Menu>(defaultMenu);

    const handleClickMenu = (menuItem: Menu) => {
        setMenu(menuItem);
        window.localStorage.setItem(MenuLocalStorageKey, JSON.stringify(menuItem.id));
    };

    return (
        <div className='App'>
            <ol className='menu'>
                {MenuConfig.map(item => (
                    <li key={item.id} className={`menu-item${menu.id === item.id ? ' selected' : ''}`} onClick={() => handleClickMenu(item)}>
                        {item.name}
                    </li>
                ))}
            </ol>
            <main className='container'>
                <menu.component />
            </main>
        </div>
    );
}

export default App;
