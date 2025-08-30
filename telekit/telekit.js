// telekit/telekit.js

class TeleKit {
    constructor(config = {}) {
        this.config = config;
        this.app = Telegram.WebApp;
        this.app.ready();

        this.pages = {};
        this.components = {};
        this.currentPage = null;
        this.currentPageProps = {};
		
		// We will now store the persistent instance of the current page
        this.currentPageInstance = null; 
		
        // --- ADD THIS PROPERTY ---
        this.navigation = null; // Will hold the active navigation component instance

        this._state = new Proxy(config.state || {}, {
            set: (target, property, value) => {
                target[property] = value;
                this.renderCurrentPage();
                return true;
            }
        });

        this.api = {
            baseUrl: config.apiBaseUrl || '',
            request: async (endpoint, options = {}) => {
                const headers = { 'Content-Type': 'application/json', ...options.headers };
                const body = { ...options.body, _auth: this.app.initData };
                try {
                    const response = await fetch(`${this.api.baseUrl}${endpoint}`, { method: 'POST', headers, body: JSON.stringify(body), ...options });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return await response.json();
                } catch (error) {
                    console.error('TeleKit API request failed:', error);
                    this.showAlert(`API request failed: ${error.message}`);
                    return null;
                }
            }
        };

        this.app.onEvent('themeChanged', () => this.updateTheme());
        this.updateTheme();
    }
    
    get state() { return this._state; }
    setState(newState) {
        for (const key in newState) {
            if (Object.hasOwnProperty.call(newState, key)) this._state[key] = newState[key];
        }
    }

    addPage(name, pageClass) { this.pages[name] = pageClass; }
	
	addComponent(name, componentClass) {
        this.components[name] = componentClass;
    }

    navigateTo(pageName, props = {}) {
        const pageClass = this.pages[pageName];
        if (pageClass) {
            // Call onLeave on the OLD instance if it exists
            if (this.currentPageInstance && this.currentPageInstance.onLeave) {
                this.currentPageInstance.onLeave();
            }

            this.currentPageClass = pageClass;
            this.currentPageProps = props;
            
            // Create the new, persistent instance for the page
            this.currentPageInstance = new this.currentPageClass(this);

            this.renderCurrentPage();
            
            // Call onLoad ONCE after the new page is created and rendered
            if (this.currentPageInstance.onLoad) {
                this.currentPageInstance.onLoad(this.currentPageProps);
            }
        }
		else
		{
            console.error(`Page "${pageName}" not found.`);
        }
    }

    // --- THIS IS THE CRITICAL FIX ---
    renderCurrentPage() {
        if (!this.currentPageInstance) return;

        // 1. Remember what was focused (if anything)
        let activeElementId = null;
        let selectionStart = null;
        let selectionEnd = null;
        if (document.activeElement && document.activeElement.id) {
            activeElementId = document.activeElement.id;
            // Also remember the cursor position for text inputs
            if (typeof document.activeElement.selectionStart === "number") {
                selectionStart = document.activeElement.selectionStart;
                selectionEnd = document.activeElement.selectionEnd;
            }
        }
        
        const appContainer = document.getElementById('app');
        const renderData = this.currentPageInstance.render(this.currentPageProps);
        
        // 2. Perform the destructive re-render
        appContainer.innerHTML = renderData.html;

        if (renderData.componentMap) {
            for (const id in renderData.componentMap) {
                const { componentName, props } = renderData.componentMap[id];
                const placeholder = document.getElementById(id);
                const componentClass = this.components[componentName];
                if (placeholder && componentClass) {
                    const componentInstance = new componentClass(this);
                    placeholder.outerHTML = componentInstance.render(props);
                }
            }
        }
        
        // 3. Restore focus if we remembered an element
        if (activeElementId) {
            const newElement = document.getElementById(activeElementId);
            if (newElement) {
                newElement.focus();
                // Restore the cursor position
                if (selectionStart !== null && typeof newElement.setSelectionRange === "function") {
                    newElement.setSelectionRange(selectionStart, selectionEnd);
                }
            }
        }
		
		// =================================================================
        // == NEW CODE: Call the post-render lifecycle hook if it exists  ==
        // =================================================================
        if (this.currentPageInstance && this.currentPageInstance.onRenderComplete) {
            this.currentPageInstance.onRenderComplete();
        }
        // =================================================================
    }
	
	openDrawer() {
        if (this.navigation && this.navigation.openDrawer) {
            this.navigation.openDrawer();
        }
    }
    closeDrawer() {
        if (this.navigation && this.navigation.closeDrawer) {
            this.navigation.closeDrawer();
        }
    }
    handleNavLinkClick(pageName) {
        if (this.navigation && this.navigation.handleLinkClick) {
            this.navigation.handleLinkClick(pageName);
        }
    }
    
    // Core App Wrappers & UI Buttons
    updateTheme() { document.documentElement.className = this.app.colorScheme; }
    get initDataUnsafe() { return this.app.initDataUnsafe; }
    showAlert(message) { this.app.showAlert(message); }
    showConfirm(message, callback) { this.app.showConfirm(message, callback); }
    showPopup(params, callback) { this.app.showPopup(params, callback); }
    expand() { this.app.expand(); }
    close() { this.app.close(); }

    // Button Getters
    get mainButton() { return this.app.MainButton; }
    get backButton() { return this.app.BackButton; }
    get settingsButton() { return this.app.SettingsButton; }
    get secondaryButton() { return this.app.SecondaryButton; }

    // Advanced Feature Getters
    get hapticFeedback() { return this.app.HapticFeedback; }
    get cloudStorage() { return this.app.CloudStorage; }
    get biometricManager() { return this.app.BiometricManager; }
    get accelerometer() { return this.app.Accelerometer; }
    get gyroscope() { return this.app.Gyroscope; }
    get deviceOrientation() { return this.app.DeviceOrientation; }
}

class TeleKitComponent {
    constructor(tk) {
        // Store the main TeleKit instance
        this.tk = tk; 
    }
    render(props = {}) { throw new Error("Component must implement the 'render' method!"); }
}

class TeleKitPage extends TeleKitComponent {
    constructor(tk) {
        super(tk); // Pass the instance up to the parent
    }
    onLoad(props) {}
    onLeave() {}
	
    // =================================================================
    // == NEW CODE: Define the new lifecycle method on the base page  ==
    // =================================================================
    onRenderComplete() {}
    // =================================================================
    
    _c(componentName, props = {}) {
        const id = `tk-comp-${Math.random().toString(36).substr(2, 9)}`;
        this._componentMap = this._componentMap || {};
        this._componentMap[id] = { componentName, props };
        return `<div id="${id}"></div>`;
    }

    _render(html) {
        const map = this._componentMap;
        this._componentMap = {};
        return { html, componentMap: map };
    }
}