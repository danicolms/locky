// LOCKY - Playful Encryption Game
// Cashier-style interaction with lock/unlock transactions

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const lockTab = document.getElementById('lock-tab');
    const unlockTab = document.getElementById('unlock-tab');
    const transactionBox = document.getElementById('transaction-box');
    const boxContents = document.getElementById('box-contents');
    const cashierDialog = document.getElementById('cashier-dialog');
    
    const lockFileInput = document.getElementById('lock-file-input');
    const unlockFileInput = document.getElementById('unlock-file-input');
    const unlockControls = document.getElementById('unlock-controls');
    const unlockPassphrase = document.getElementById('unlock-passphrase');
    const unlockButton = document.getElementById('unlock-button');
    
    const resultsPanel = document.getElementById('results-panel');
    const lockResultTemplate = document.getElementById('lock-result-template');
    const unlockResultTemplate = document.getElementById('unlock-result-template');
    const errorMessage = document.getElementById('error-message');
    
    let currentMode = 'lock'; // 'lock' or 'unlock'
    let fileToProcess = null;
    let encryptedFile = null;
    
    // Initialize the scene
    updateCashierDialog('Welcome to Locky! What would you like to do today?');
    
    // Tab switching
    lockTab.addEventListener('click', function() {
        switchMode('lock');
    });
    
    unlockTab.addEventListener('click', function() {
        switchMode('unlock');
    });
    
    function switchMode(mode) {
        currentMode = mode;
        
        // Update button styles
        lockTab.classList.toggle('active', mode === 'lock');
        unlockTab.classList.toggle('active', mode === 'unlock');
        
        // Update transaction box
        resetTransactionBox();
        
        // Update dialog
        if (mode === 'lock') {
            updateCashierDialog('🔒 Lock mode activated! Drop your file in the box.');
            unlockControls.style.display = 'none';
        } else {
            updateCashierDialog('🔓 Unlock mode! Drop your .enc file and enter passphrase.');
            unlockControls.style.display = 'block';
        }
        
        // Hide results
        resultsPanel.style.display = 'none';
    }
    
    function resetTransactionBox() {
        transactionBox.className = 'transaction-box closed';
        boxContents.innerHTML = '<p class="box-instruction">Drag & drop your file here</p>';
        fileToProcess = null;
        encryptedFile = null;
    }
    
    function updateCashierDialog(message) {
        cashierDialog.textContent = message;
    }
    
    // Transaction box click handler
    transactionBox.addEventListener('click', function() {
        if (currentMode === 'lock') {
            lockFileInput.click();
        } else {
            unlockFileInput.click();
        }
    });
    
    // Drag and drop events
    transactionBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        transactionBox.classList.add('open');
    });
    
    transactionBox.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        transactionBox.classList.remove('open');
    });
    
    transactionBox.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        transactionBox.classList.remove('open');
        
        if (e.dataTransfer.files.length) {
            if (currentMode === 'lock') {
                handleLockFileSelect({ target: { files: e.dataTransfer.files } });
            } else {
                handleUnlockFileSelect({ target: { files: e.dataTransfer.files } });
            }
        }
    });
    
    // File input handlers
    lockFileInput.addEventListener('change', handleLockFileSelect);
    unlockFileInput.addEventListener('change', handleUnlockFileSelect);
    unlockButton.addEventListener('click', handleUnlock);
    
    // Lock file handler
    function handleLockFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        fileToProcess = file;
        updateCashierDialog(`📁 Got it! Locking ${file.name}...`);
        
        // Show processing state
        transactionBox.classList.remove('closed');
        transactionBox.classList.add('open');
        boxContents.innerHTML = '<p class="box-instruction">🔒 Processing...</p>';
        
        // Process the file
        setTimeout(() => {
            processLockFile(file);
        }, 500);
    }
    
    // Unlock file handler
    function handleUnlockFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if file has .enc extension
        if (!file.name.endsWith('.enc')) {
            showError('🚨 Please select a .enc file for unlocking!');
            return;
        }
        
        encryptedFile = file;
        updateCashierDialog(`📁 Ready to unlock ${file.name}. Enter your passphrase!`);
        
        // Show file ready state
        transactionBox.classList.remove('closed');
        transactionBox.classList.add('open');
        boxContents.innerHTML = `<p class="box-instruction">🔓 ${file.name} ready!</p>`;
    }
    
    // Process lock file
    async function processLockFile(file) {
        try {
            updateCashierDialog('🔐 Generating secure lock...');
            
            // Generate passphrase
            const passphrase = generateRandomPassphrase(16);
            
            // Encrypt the file
            updateCashierDialog('🔄 Encrypting your file...');
            const encryptedData = await encryptFile(file, passphrase);
            
            // Create download
            const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            // Show results
            showLockResults(file.name, passphrase, url);
            
            updateCashierDialog('🎉 File locked successfully!');
            
        } catch (error) {
            console.error('Lock failed:', error);
            showError('💥 Lock failed: ' + error.message);
            resetTransactionBox();
        }
    }
    
    // Handle unlock
    async function handleUnlock() {
        if (!encryptedFile) {
            showError('🚨 No file selected for unlocking!');
            return;
        }
        
        const passphrase = unlockPassphrase.value;
        if (!passphrase) {
            showError('🔑 Please enter your passphrase!');
            return;
        }
        
        try {
            updateCashierDialog('🔐 Verifying passphrase...');
            unlockButton.textContent = 'Unlocking...';
            unlockButton.disabled = true;
            
            // Decrypt the file
            const decryptedData = await decryptFile(encryptedFile, passphrase);
            
            // Create download
            const originalName = encryptedFile.name.replace('.enc', '');
            const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            // Show results
            showUnlockResults(originalName, url);
            
            updateCashierDialog('🎉 File unlocked successfully!');
            
        } catch (error) {
            console.error('Unlock failed:', error);
            showError('💥 Unlock failed: ' + error.message);
        } finally {
            unlockButton.textContent = 'Unlock File';
            unlockButton.disabled = false;
        }
    }
    
    // Show lock results
    function showLockResults(originalName, passphrase, downloadUrl) {
        // Clear previous results
        resultsPanel.innerHTML = '';
        
        // Clone and populate template
        const templateContent = lockResultTemplate.content.cloneNode(true);
        const passphraseInput = templateContent.querySelector('#passphrase');
        const downloadLink = templateContent.querySelector('#download-link');
        const copyButton = templateContent.querySelector('#copy-passphrase');
        
        passphraseInput.value = passphrase;
        downloadLink.href = downloadUrl;
        downloadLink.download = originalName + '.enc';
        
        // Copy functionality
        copyButton.addEventListener('click', function() {
            passphraseInput.select();
            document.execCommand('copy');
            copyButton.textContent = '✅ Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 2000);
        });
        
        resultsPanel.appendChild(templateContent);
        resultsPanel.style.display = 'block';
        
        // Scroll to results
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Show unlock results
    function showUnlockResults(originalName, downloadUrl) {
        // Clear previous results
        resultsPanel.innerHTML = '';
        
        // Clone and populate template
        const templateContent = unlockResultTemplate.content.cloneNode(true);
        const downloadLink = templateContent.querySelector('#decrypt-download-link');
        
        downloadLink.href = downloadUrl;
        downloadLink.download = originalName;
        
        resultsPanel.appendChild(templateContent);
        resultsPanel.style.display = 'block';
        
        // Scroll to results
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Error handling
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // Utility functions
    function generateRandomPassphrase(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};:,.<>?';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Encryption/Decryption functions (same as before)
    async function encryptFile(file, passphrase) {
        const fileBuffer = await readFileAsArrayBuffer(file);
        const key = await deriveKeyFromPassphrase(passphrase);
        return encryptData(fileBuffer, key);
    }
    
    async function decryptFile(encryptedFile, passphrase) {
        const encryptedBuffer = await readFileAsArrayBuffer(encryptedFile);
        const key = await deriveKeyFromPassphrase(passphrase);
        return decryptData(encryptedBuffer, key);
    }
    
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    async function deriveKeyFromPassphrase(passphrase) {
        const encoder = new TextEncoder();
        const passphraseBuffer = encoder.encode(passphrase);
        
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            passphraseBuffer,
            {name: 'PBKDF2'},
            false,
            ['deriveKey']
        );
        
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        
        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            {name: 'AES-GCM', length: 256},
            true,
            ['encrypt', 'decrypt']
        );
        
        return {key, salt};
    }
    
    async function encryptData(data, keyInfo) {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            keyInfo.key,
            data
        );
        
        const result = new Uint8Array(iv.length + keyInfo.salt.length + encryptedData.byteLength);
        result.set(iv, 0);
        result.set(new Uint8Array(keyInfo.salt), iv.length);
        result.set(new Uint8Array(encryptedData), iv.length + keyInfo.salt.length);
        
        return result;
    }
    
    async function decryptData(encryptedData, keyInfo) {
        const iv = encryptedData.slice(0, 12);
        const salt = encryptedData.slice(12, 28);
        const actualEncryptedData = encryptedData.slice(28);
        
        const encoder = new TextEncoder();
        const passphraseBuffer = encoder.encode(unlockPassphrase.value);
        
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            passphraseBuffer,
            {name: 'PBKDF2'},
            false,
            ['deriveKey']
        );
        
        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            {name: 'AES-GCM', length: 256},
            true,
            ['decrypt']
        );
        
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            actualEncryptedData
        );
        
        return decryptedData;
    }
});