import { useState } from 'react';

import styles from '../styles/Dropdown.module.css';

function Dropdown({ items = [], activeKey, setActiveKey, disabled }) {
    const [showItems, setShowItems] = useState(false);

    const activeItem = items.find(item => item.key === activeKey);

    return (
        <div className={"dropdown " + styles.dropdown + (showItems ? ' is-active': '')}>
            <div className="dropdown-trigger">
                <button 
                    className="button is-light" 
                    aria-haspopup="true" 
                    aria-controls="dropdown-menu" 
                    onClick={() => {
                        setShowItems(!showItems);
                    }}
                    disabled={disabled}
                >
                    <span>{(activeItem ? activeItem.fullName : '')}</span>
                    <span className="icon is-small">
                        <i className="fas fa-angle-down" aria-hidden="true"></i>
                    </span>
                </button>
            </div>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
                <div className="dropdown-content">
                    {items.map(item => {
                        const isActive = item.key === activeKey;
                        return (
                            <a 
                                key={item.key}
                                id={item.key}
                                href="#" 
                                className={"dropdown-item" + (isActive ? ' is-active' : '')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveKey(e.target.id);
                                    setShowItems(false);
                                }}
                            >
                                {item.fullName}
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Dropdown;
