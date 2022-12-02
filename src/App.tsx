import { useState } from 'react';
import HelloWebGL from './01-hello-webgl';
import ImageProcess from './02-image-process';
import Orthographic from './03-orthographic';
import Perspective from './04-perspective';
import DirectionalLight from './05-directional-light';
import PointLight from './06-point-light';
import './App.css';

interface Menu {
    id: number;
    name: string;
    component: () => JSX.Element;
}

const Menu: Menu[] = [
    {
        id: 0,
        name: 'Hello WebGL',
        component: HelloWebGL,
    },
    {
        id: 1,
        name: 'Image Process',
        component: ImageProcess,
    },
    {
        id: 2,
        name: 'Orthographic',
        component: Orthographic,
    },
    {
        id: 3,
        name: 'Perspective',
        component: Perspective,
    },
    {
        id: 4,
        name: 'Directional Light',
        component: DirectionalLight,
    },
    {
        id: 5,
        name: 'Point Light',
        component: PointLight,
    },
];

const MenuLocalStorageKey = 'WebGlFundamentalsMenu';
let defaultMenu = Menu[0];

const data = window.localStorage.getItem(MenuLocalStorageKey);
if (data) {
    const menuId = JSON.parse(data) as number;
    const menuInfo = Menu.find(item => item.id === menuId);
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
            <ul className='menu'>
                {Menu.map((item, idx) => (
                    <li key={item.id} className={`menu-item${menu.id === item.id ? ' selected' : ''}`} onClick={() => handleClickMenu(item)}>
                        {`${idx + 1}. ${item.name}`}
                    </li>
                ))}
            </ul>
            <main className='container'>
                <menu.component />
            </main>
        </div>
    );
}

export default App;
