// pages/home.js

class HomePage extends TeleKitPage {
    render() {
        const isRunning = TK.state.scanStatus.isRunning;

        if (isRunning) {
            return this.renderStatusView();
        } else {
            return this.renderConfigView();
        }
    }

    renderConfigView() {
        const header = this._c('TK_Header', { title: "Start New Scan" });

        const providerSelect = this._c('TK_Select', {
            label: "Cloud Provider",
            selectedValue: TK.state.scanSettings.provider,
            onChange: "HomePage.handleSettingChange('provider', this.value)",
            options: [
                { value: 'aws.json', text: 'Amazon Web Services (AWS)' },
                { value: 'azure.json', text: 'Microsoft Azure' },
                { value: 'googlecloud.json', text: 'Google Cloud' },
                { value: 'cloudflare.json', text: 'Cloudflare' },
                { value: 'digitalocean.json', text: 'DigitalOcean' },
            ]
        });

        const rangesInput = this._c('TK_Input', {
            id: 'ranges-input',
            label: '# of IP Ranges to Scan',
            value: TK.state.scanSettings.numRanges,
            onInput: "HomePage.handleSettingChange('numRanges', this.value)"
        });

        const poolSizeInput = this._c('TK_Input', {
            id: 'poolsize-input',
            label: 'Concurrency (Threads)',
            value: TK.state.scanSettings.poolSize,
            onInput: "HomePage.handleSettingChange('poolSize', this.value)"
        });

        // --- NEW CODE: Create the toggle switch component ---
        const customPathsToggle = this._c('TK_Toggle', {
            label: "Use Custom Paths (.txt files)",
            checked: TK.state.scanSettings.useCustomPaths,
            onChange: "HomePage.handleSettingChange('useCustomPaths', this.checked)"
        });

        const startButton = this._c('TK_Button', { text: "🚀 Start Scan", onClick: "HomePage.startScan()" });

        return this._render(`
            <div>
                ${header}
                <div class="tk-card">
                    ${providerSelect}
                    ${rangesInput}
                    ${poolSizeInput}
                    ${customPathsToggle} 
                </div>
                ${startButton}
            </div>
        `);
    }

    renderStatusView() {
        const header = this._c('TK_Header', { title: "Scan in Progress..." });
        const stats = TK.state.scanStatus.statistics;

        const cardContent = `URLs: ${stats.urlsCheckedCount} | IPs: ${stats.ipsCheckedCount}/${stats.totalTargets} | Found: ${stats.confirmedCount} | CPM: ${stats.cpm}`;

        const statsCard = this._c('TK_Card', {
            title: `Scanning... (${stats.formattedElapsedTime})`,
            content: cardContent
        });

        const viewLogButton = this._c('TK_Button', { text: "📄 View Live Log", onClick: "HomePage.viewLog()" });
        const stopButton = this._c('TK_Button', { text: "🛑 Stop Scan", onClick: "HomePage.stopScan()" });

        return this._render(`
            <div>
                ${header}
                ${statsCard}
                ${viewLogButton}
                ${stopButton}
            </div>
        `);
    }

    onLoad() {
        this.tk.mainButton.hide();
        this.tk.backButton.hide();
    }

    // --- NEW METHOD: Handles state changes for all settings on this page ---
    static handleSettingChange(key, value) {
        // This dynamically updates the correct key in the scanSettings object
        TK.setState({ scanSettings: { ...TK.state.scanSettings, [key]: value } });
    }

    static async startScan() {
        // TK.showAlert('Starting scan... this may take a moment.');
        TK.setState({ scanLog: [] });
        const settings = TK.state.scanSettings;

        // --- THIS IS THE UPDATED LOGIC ---
        // The new `useCustomPaths` parameter is now appended to the URL.
        const url = `${TK.config.apiBaseUrl}/api/Scan/start-from-generation?provider=${settings.provider}&numRanges=${settings.numRanges}&poolSize=${settings.poolSize}&useCustomPaths=${settings.useCustomPaths}`;

        try {
            const response = await fetch(url, { method: 'POST' });
            if (response.ok) {
                const text = await response.text();
                // TK.showAlert(text);
            } else {
                TK.showAlert(`Error starting scan: ${response.statusText}`);
            }
        } catch (e) {
            TK.showAlert(`Network error: ${e.message}`);
        }
    }

    static async stopScan() {
        if (!confirm('Are you sure you want to stop the scan?')) return;

        try {
            const response = await fetch(`${TK.config.apiBaseUrl}/api/Scan/stop`, { method: 'POST' });
            if (response.ok) {
                TK.showAlert('Scan stop signal sent.');
                TK.setState({ scanStatus: { ...TK.state.scanStatus, isRunning: false } });
            } else {
                TK.showAlert(`Error stopping scan: ${response.statusText}`);
            }
        } catch (e) {
            TK.showAlert(`Network error: ${e.message}`);
        }
    }

    static viewLog() {
        TK.navigateTo('scanLog');
    }
}