// Pi Network Integration for Family Smart Saver
class PiNetworkIntegration {
    constructor() {
        this.isAuthenticated = false;
        this.userInfo = null;
        this.apiBaseUrl = 'https://poetic-rugelach-73213f.netlify.app/.netlify/functions/pi-proxy';
        this.init();
    }

    async init() {
        // Check if Pi SDK is available
        if (typeof Pi !== 'undefined') {
            console.log('Pi SDK loaded successfully');
            this.showPiButtons();
            this.setupEventListeners();
            
            // Check if user is already authenticated
            try {
                await this.checkAuthStatus();
            } catch (error) {
                console.log('User not authenticated yet');
            }
        } else {
            console.log('Pi SDK not available - likely not in Pi Browser');
            this.showFallbackMessage();
        }
    }

    showPiButtons() {
        const connectBtn = document.getElementById('pi-connect-btn');
        const paymentBtn = document.getElementById('pi-payment-btn');
        
        if (connectBtn) connectBtn.style.display = 'inline-block';
        if (paymentBtn) paymentBtn.style.display = 'inline-block';
    }

    showFallbackMessage() {
        // Show message for users not in Pi Browser
        const heroButtons = document.querySelector('.hero-buttons');
        if (heroButtons) {
            const fallbackMsg = document.createElement('div');
            fallbackMsg.className = 'pi-fallback-message';
            fallbackMsg.innerHTML = `
                <p style="margin-top: 15px; padding: 10px; background: #f0f8ff; border-radius: 8px; font-size: 14px;">
                    🥧 <strong>Pi Network Integration Available!</strong><br>
                    Open this app in the Pi Browser to connect your Pi wallet and make Pi payments.
                </p>
            `;
            heroButtons.appendChild(fallbackMsg);
        }
    }

    setupEventListeners() {
        const connectBtn = document.getElementById('pi-connect-btn');
        const paymentBtn = document.getElementById('pi-payment-btn');

        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.authenticateUser());
        }

        if (paymentBtn) {
            paymentBtn.addEventListener('click', () => this.makePayment());
        }
    }

    async checkAuthStatus() {
        try {
            // Try to get user info to check if already authenticated
            const user = await Pi.authenticate(['username', 'payments'], {
                onIncompletePaymentFound: (payment) => {
                    console.log('Incomplete payment found:', payment);
                    this.handleIncompletePayment(payment);
                }
            });
            
            this.userInfo = user;
            this.isAuthenticated = true;
            this.updateUI();
            console.log('User authenticated:', user);
        } catch (error) {
            console.log('Authentication check failed:', error);
        }
    }

    async authenticateUser() {
        try {
            const connectBtn = document.getElementById('pi-connect-btn');
            if (connectBtn) {
                connectBtn.textContent = 'Connecting...';
                connectBtn.disabled = true;
            }

            const user = await Pi.authenticate(['username', 'payments'], {
                onIncompletePaymentFound: (payment) => {
                    console.log('Incomplete payment found:', payment);
                    this.handleIncompletePayment(payment);
                }
            });

            this.userInfo = user;
            this.isAuthenticated = true;
            this.updateUI();
            
            console.log('User authenticated successfully:', user);
            this.showSuccessMessage('Connected to Pi Network successfully!');

        } catch (error) {
            console.error('Authentication failed:', error);
            this.showErrorMessage('Failed to connect to Pi Network. Please try again.');
            
            const connectBtn = document.getElementById('pi-connect-btn');
            if (connectBtn) {
                connectBtn.textContent = 'Connect with Pi';
                connectBtn.disabled = false;
            }
        }
    }

    async makePayment() {
        if (!this.isAuthenticated) {
            this.showErrorMessage('Please connect to Pi Network first.');
            return;
        }

        try {
            const paymentBtn = document.getElementById('pi-payment-btn');
            if (paymentBtn) {
                paymentBtn.textContent = 'Processing...';
                paymentBtn.disabled = true;
            }

            // Create a payment request
            const paymentData = {
                amount: 1, // 1 Pi coin for demo
                memo: "Family Smart Saver - Demo Payment",
                metadata: {
                    type: "family_savings_contribution",
                    goal: "Family Vacation Fund"
                }
            };

            const payment = await Pi.createPayment(paymentData, {
                onReadyForServerApproval: (paymentId) => {
                    console.log('Payment ready for server approval:', paymentId);
                    this.approvePaymentOnServer(paymentId);
                },
                onReadyForServerCompletion: (paymentId, txid) => {
                    console.log('Payment ready for server completion:', paymentId, txid);
                    this.completePaymentOnServer(paymentId, txid);
                },
                onCancel: (paymentId) => {
                    console.log('Payment cancelled:', paymentId);
                    this.showErrorMessage('Payment was cancelled.');
                    this.resetPaymentButton();
                },
                onError: (error, payment) => {
                    console.error('Payment error:', error, payment);
                    this.showErrorMessage('Payment failed: ' + error.message);
                    this.resetPaymentButton();
                }
            });

            console.log('Payment created:', payment);

        } catch (error) {
            console.error('Payment creation failed:', error);
            this.showErrorMessage('Failed to create payment. Please try again.');
            this.resetPaymentButton();
        }
    }

    async approvePaymentOnServer(paymentId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'approve',
                    paymentId: paymentId
                })
            });

            const result = await response.json();
            console.log('Server approval response:', result);

            if (!result.success) {
                throw new Error(result.error || 'Server approval failed');
            }

        } catch (error) {
            console.error('Server approval failed:', error);
            this.showErrorMessage('Payment approval failed on server.');
        }
    }

    async completePaymentOnServer(paymentId, txid) {
        try {
            const response = await fetch(`${this.apiBaseUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'complete',
                    paymentId: paymentId,
                    txid: txid
                })
            });

            const result = await response.json();
            console.log('Server completion response:', result);

            if (result.success) {
                this.showSuccessMessage('Payment completed successfully! 🎉');
                this.resetPaymentButton();
            } else {
                throw new Error(result.error || 'Server completion failed');
            }

        } catch (error) {
            console.error('Server completion failed:', error);
            this.showErrorMessage('Payment completion failed on server.');
            this.resetPaymentButton();
        }
    }

    handleIncompletePayment(payment) {
        console.log('Handling incomplete payment:', payment);
        // Handle incomplete payments here
        this.showErrorMessage('You have an incomplete payment. Please complete it first.');
    }

    updateUI() {
        if (this.isAuthenticated && this.userInfo) {
            // Update connect button
            const connectBtn = document.getElementById('pi-connect-btn');
            if (connectBtn) {
                connectBtn.textContent = '✓ Connected';
                connectBtn.disabled = true;
                connectBtn.style.background = '#28a745';
            }

            // Show user info
            const piStatus = document.getElementById('pi-status');
            const piUsername = document.getElementById('pi-username');
            
            if (piStatus) piStatus.style.display = 'block';
            if (piUsername) piUsername.textContent = `Welcome, ${this.userInfo.username}!`;

            // Enable payment button
            const paymentBtn = document.getElementById('pi-payment-btn');
            if (paymentBtn) {
                paymentBtn.disabled = false;
                paymentBtn.style.opacity = '1';
            }
        }
    }

    resetPaymentButton() {
        const paymentBtn = document.getElementById('pi-payment-btn');
        if (paymentBtn) {
            paymentBtn.textContent = 'Make Pi Payment';
            paymentBtn.disabled = false;
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Create or update message element
        let messageEl = document.getElementById('pi-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'pi-message';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(messageEl);
        }

        messageEl.textContent = message;
        messageEl.style.background = type === 'success' ? '#28a745' : '#dc3545';
        messageEl.style.display = 'block';

        // Auto hide after 5 seconds
        setTimeout(() => {
            if (messageEl) {
                messageEl.style.display = 'none';
            }
        }, 5000);
    }
}

// Initialize Pi Network integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.piIntegration = new PiNetworkIntegration();
});

