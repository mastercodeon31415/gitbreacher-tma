// pages/scanLog.js

class ScanLogPage extends TeleKitPage {
    render() {
        const header = this._c('TK_Header', { title: "Live Scan Log" });
        const stats = TK.state.scanStatus.statistics;
        const cardContent = `URLs: ${stats.urlsCheckedCount} | IPs: ${stats.ipsCheckedCount}/${stats.totalTargets} | Found: ${stats.confirmedCount} | CPM: ${stats.cpm}`;
        const statsCard = this._c('TK_Card', {
            title: `Live Stats (${stats.formattedElapsedTime})`,
            content: cardContent
        });

        const logEntriesHtml = TK.state.scanLog.map(entry =>
            `<li style="color: ${entry.color};">${entry.message}</li>`
        ).join('');

        return this._render(`
            <div>
                ${header}
                <div class="tk-card">
                    <ul id="log-list" class="tk-list" style="font-family: 'Consolas', monospace; font-size: 12px; max-height: 40vh; overflow-y: auto;">
                        ${logEntriesHtml}
                    </ul>
                </div>
                ${statsCard} 
            </div>
        `);
    }

    onLoad() {
        this.tk.mainButton.hide();
        this.tk.backButton.show();
        this.tk.backButton.onClick(this.handleBack);
    }
    
    onLeave() {
        this.tk.backButton.offClick(this.handleBack);
        this.tk.backButton.hide();
    }

    onRenderComplete() {
        const logList = document.getElementById('log-list');
        if (logList) {
            setTimeout(() => {
                logList.scrollTop = logList.scrollHeight;
            }, 0);
        }
    }

    handleBack() {
        TK.navigateTo('home');
    }
}