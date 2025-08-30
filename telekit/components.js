// telekit/components.js

class TK_Header extends TeleKitComponent {
	constructor(tk) { super(tk); }
    render(props = {}) {
        const title = props.title || 'Page Title';
        return `<h1 class="tk-header">${title}</h1>`;
    }
}

class TK_Button extends TeleKitComponent {
	constructor(tk) { super(tk); }
    render(props = {}) {
        const text = props.text || 'Click Me';
        const onClickAction = props.onClick || "TK.showAlert('Button clicked')";
        const className = props.className || '';
        return `<button class="tk-button ${className}" onclick="${onClickAction}">${text}</button>`;
    }
}

class TK_Card extends TeleKitComponent {
	constructor(tk) { super(tk); }
    render(props = {}) {
        const title = props.title ? `<h3 class="tk-card-title">${props.title}</h3>` : '';
        const content = props.content || 'Card content goes here.';
        return `
            <div class="tk-card">
                ${title}
                <p class="tk-card-content">${content}</p>
            </div>
        `;
    }
}

class TK_List extends TeleKitComponent {
	constructor(tk) { super(tk); }
    render(props = {}) {
        const items = props.items || [];
        const listItems = items.map(item => `<li class="tk-list-item">${item}</li>`).join('');
        return `<ul class="tk-list">${listItems}</ul>`;
    }
}

class TK_Input extends TeleKitComponent {
    constructor(tk) { super(tk); }
    render(props = {}) {
        const id = props.id || 'tk-input-' + Math.random().toString(36).substr(2, 9);
        const label = props.label || '';
        const placeholder = props.placeholder || '';
        const value = props.value || '';
        
        // --- THIS IS THE CHANGE ---
        const onInput = props.onInput || '';
        const onChange = props.onChange || ''; // Add this line

        const labelHtml = label ? `<label for="${id}" class="tk-input-label">${label}</label>` : '';
        return `
            <div class="tk-input-wrapper">
                ${labelHtml}
                <input
                    type="text"
                    id="${id}"
                    class="tk-input"
                    placeholder="${placeholder}"
                    value="${value}"
                    oninput="${onInput}"
                    onchange="${onChange}" 
                />
            </div>
        `;
    }
}

class TK_Modal extends TeleKitComponent {
	constructor(tk) { super(tk); }
    render(props = {}) {
        const id = props.id;
        const title = props.title || 'Modal';
        const content = props.content || '';
        const closeButtonProps = JSON.stringify({
            text: "Close",
            onClick: `TK.components.TK_Modal.hide('${id}')`
        });
        return `
            <div class="tk-modal-overlay" id="${id}-overlay" onclick="TK.components.TK_Modal.hide('${id}')">
                <div class="tk-modal-content" onclick="event.stopPropagation()">
                    <h2 class="tk-modal-title">${title}</h2>
                    <p>${content}</p>
                    <TK_Button props='${closeButtonProps}' />
                </div>
            </div>
        `;
    }
    static show(id) { /* ... same as before ... */ }
    static hide(id) { /* ... same as before ... */ }
}

class TK_NavBar extends TeleKitComponent {
	constructor(tk) { super(tk); }
    render(props = {}) {
        const activeTab = props.active || 'home';
        const tabs = [
            { id: 'home', label: 'Home' },
            { id: 'profile', label: 'Profile' },
            { id: 'settings', label: 'Settings' },
            { id: 'about', label: 'About' }
        ];

        const buttonsHtml = tabs.map(tab => {
            const isActive = tab.id === activeTab;
            const activeClass = isActive ? 'active' : '';
            return `
                <button class="tk-navbar-button ${activeClass}" onclick="TK.navigateTo('${tab.id}')">
                    <span>${tab.label}</span>
                </button>
            `;
        }).join('');

        return `<div class="tk-navbar">${buttonsHtml}</div>`;
    }
}

class TK_Navigation extends TeleKitComponent {
    constructor(tk) {
        super(tk);
		
        // Register this specific instance with the main framework
        // This is the key that connects the instance to the controller
        this.tk.navigation = this;
    }
    
    render(props = {}) {
		
        if (this.tk.config.navStyle === 'drawer') {
            return this.renderDrawer(props);
        } else {
            return this.renderBar(props);
        }
    }

    renderDrawer(props) {
        const title = props.title || 'TeleKit App';
        this.renderDrawerMenu(props.active || 'home');

        return `
            <div class="tk-top-bar">
                <!-- THIS ONCLICK IS NOW FIXED -->
                <button class="tk-hamburger-button" onclick="TK.openDrawer()">
                    <span></span><span></span><span></span>
                </button>
                <h1 class="tk-top-bar-title">${title}</h1>
            </div>
        `;
    }

        renderDrawerMenu(activeTab) {
        const drawerContainer = document.getElementById('drawer-container');
        if (!drawerContainer) return;

        const tabs = [
            { id: 'home', label: 'Home' },
            { id: 'profile', label: 'Profile' },
            { id: 'settings', label: 'Settings' },
            { id: 'about', label: 'About' }
        ];

        const linksHtml = tabs.map(tab => {
            const activeClass = (tab.id === activeTab) ? 'active' : '';
            // --- THIS IS THE CORRECTED LINE ---
            // It now correctly calls the global TK controller method
            return `<a class="tk-drawer-link ${activeClass}" onclick="TK.handleNavLinkClick('${tab.id}')">${tab.label}</a>`;
        }).join('');

        drawerContainer.innerHTML = `
            <div class="tk-drawer-overlay" id="drawer-overlay" onclick="TK.closeDrawer()"></div>
            <div class="tk-drawer-panel" id="drawer-panel">
                <h2 class="tk-drawer-header">Menu</h2>
                <div class="tk-drawer-links">${linksHtml}</div>
            </div>
        `;
    }
    
    // Renders the bottom tab bar (the old logic)
    renderBar(props) {
        const activeTab = props.active || 'home';
        // ... (the exact same render logic from the old TK_NavBar) ...
        const tabs = [ /* ... */ ];
        // ...
        return `<div class="tk-navbar">${buttonsHtml}</div>`;
    }

    // --- These are now regular instance methods, called by the TK controller ---
    openDrawer() {
        document.getElementById('drawer-overlay')?.classList.add('visible');
        document.getElementById('drawer-panel')?.classList.add('visible');
        this.tk.hapticFeedback.impactOccurred('light'); 
    }
    closeDrawer() {
        document.getElementById('drawer-overlay')?.classList.remove('visible');
        document.getElementById('drawer-panel')?.classList.remove('visible');
    }
    handleLinkClick(pageName) {
        this.closeDrawer();
        setTimeout(() => {
            this.tk.navigateTo(pageName);
        }, 200);
    }
}

class TK_Toggle extends TeleKitComponent {
	constructor(tk) { super(tk); }
    render(props = {}) {
        const label = props.label || '';
        const checked = props.checked ? 'checked' : '';
        const onChange = props.onChange || '';
        return `
            <label class="tk-toggle-wrapper">
                <span class="tk-toggle-label">${label}</span>
                <div class="tk-toggle">
                    <input type="checkbox" ${checked} onchange="${onChange}">
                    <span class="tk-toggle-slider"></span>
                </div>
            </label>
        `;
    }
}

class TK_Checkbox extends TeleKitComponent {
	constructor(tk) { super(tk); }
    render(props = {}) {
        const label = props.label || '';
        const checked = props.checked ? 'checked' : '';
        const onChange = props.onChange || '';
        return `
            <label class="tk-checkbox-wrapper">
                <div class="tk-checkbox">
                    <input type="checkbox" ${checked} onchange="${onChange}">
                    <svg viewBox="0 0 24 24" class="tk-checkbox-checkmark">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span class="tk-checkbox-label">${label}</span>
            </label>
        `;
    }
}

class TK_Select extends TeleKitComponent {
	constructor(tk) { super(tk); }
    render(props = {}) {
        const label = props.label || '';
        const selectedValue = props.selectedValue || '';
        const onChange = props.onChange || '';
        const options = props.options || [];

        const optionsHtml = options.map(opt => {
            const selected = opt.value === selectedValue ? 'selected' : '';
            return `<option value="${opt.value}" ${selected}>${opt.text}</option>`;
        }).join('');

        return `
            <div class="tk-select-wrapper">
                <label class="tk-select-label">${label}</label>
                <div class="tk-select-container">
                    <select class="tk-select" onchange="${onChange}">${optionsHtml}</select>
                </div>
            </div>
        `;
    }
}

function registerTeleKitComponents(tkInstance) {
    // No changes here, just registering the component classes
    tkInstance.addComponent('TK_Header', TK_Header);
    tkInstance.addComponent('TK_Button', TK_Button);
    tkInstance.addComponent('TK_Card', TK_Card);
    tkInstance.addComponent('TK_List', TK_List);
    tkInstance.addComponent('TK_Input', TK_Input);
    tkInstance.addComponent('TK_Modal', TK_Modal);
    tkInstance.addComponent('TK_Navigation', TK_Navigation);
    tkInstance.addComponent('TK_Toggle', TK_Toggle);
    tkInstance.addComponent('TK_Checkbox', TK_Checkbox);
    tkInstance.addComponent('TK_Select', TK_Select);
}