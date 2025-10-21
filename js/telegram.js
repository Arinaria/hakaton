class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram.WebApp;
    }

    initialize() {
        this.tg.expand();
        this.tg.MainButton.hide();

        this.tg.setHeaderColor('#EC621F');
        this.tg.setBackgroundColor('#FFFFFF');

        this.setupMainButton();
        this.setupThemeHandler();

        const user = this.tg.initDataUnsafe?.user;
        if (user) {
            console.log('Telegram User:', user);
        }

        this.adjustForTelegram();
        window.addEventListener('resize', () => this.adjustForTelegram());
    }

    setupMainButton() {
        this.tg.MainButton.setText("Главная").show();
        this.tg.MainButton.onClick(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    setupThemeHandler() {
        this.tg.onEvent('themeChanged', () => {
            const theme = this.tg.colorScheme;
            if (theme === 'dark') {
                document.body.style.backgroundColor = '#1a1a1a';
                document.body.style.color = '#ffffff';
            } else {
                document.body.style.backgroundColor = '#FFFFFF';
                document.body.style.color = '#333333';
            }
        });
    }

    adjustForTelegram() {
        const viewportHeight = window.innerHeight;
        document.body.style.minHeight = viewportHeight + 'px';
    }

    sendData(data) {
        this.tg.sendData(JSON.stringify(data));
    }

    close() {
        this.tg.close();
    }
}
