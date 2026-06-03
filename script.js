// Locky MVP - File Encryption & Decryption
// Using Web Crypto API for client-side operations

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const encryptDropZone = document.getElementById('drop-zone-encrypt');
    const decryptDropZone = document.getElementById('drop-zone-decrypt');
    const encryptFileInput = document.getElementById('file-input-encrypt');
    const decryptFileInput = document.getElementById('file-input-decrypt');
    
    const results = document.getElementById('results');
    const encryptResults = document.getElementById('encrypt-results');
    const decryptResults = document.getElementById('decrypt-results');
    
    const passphraseInput = document.getElementById('passphrase');
    const decryptPassphraseInput = document.getElementById('decrypt-passphrase');
    const decryptButton = document.getElementById('decrypt-button');
    const downloadLink = document.getElementById('download-link');
    const decryptDownloadLink = document.getElementById('decrypt-download-link');
    const copyButton = document.getElementById('copy-passphrase');
    const errorMessage = document.createElement('div');
    
    let encryptedFile = null;
    let fileToDecrypt = null;
    
    // Setup error message element
    errorMessage.className = 'error-message';
    errorMessage.id = 'error-message';
    results.appendChild(errorMessage);
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // Update button styles
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update content visibility
            tabContents.forEach(content => {
                if (content.id === tabName) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            
            // Reset results display
            results.style.display = 'none';
        });
    });
    
    // Encryption drop zone setup
    encryptDropZone.addEventListener('click', function() {
        encryptFileInput.click();
    });
    
    encryptFileInput.addEventListener('change', handleFileSelect);
    
    // Encryption drag and drop events
    encryptDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        encryptDropZone.classList.add('dragover');
    });
    
    encryptDropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        encryptDropZone.classList.remove('dragover');
    });
    
    encryptDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        encryptDropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    });
    
    // Decryption drop zone setup
    decryptDropZone.addEventListener('click', function() {
        decryptFileInput.click();
    });
    
    decryptFileInput.addEventListener('change', handleDecryptFileSelect);
    
    // Decryption drag and drop events
    decryptDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        decryptDropZone.classList.add('dragover');
    });
    
    decryptDropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        decryptDropZone.classList.remove('dragover');
    });
    
    decryptDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        decryptDropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleDecryptFileSelect({ target: { files: e.dataTransfer.files } });
        }
    });
    
    // Decrypt button click handler
    decryptButton.addEventListener('click', handleDecryption);
    
    // Copy passphrase to clipboard
    copyButton.addEventListener('click', function() {
        passphraseInput.select();
        document.execCommand('copy');
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = 'Copy';
        }, 2000);
    });
    
    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            // Show loading state
            encryptDropZone.innerHTML = '<p>Encrypting your file...</p>';
            results.style.display = 'none';
            
            // Generate a random passphrase
            const passphrase = generateRandomPassphrase(16);
            
            // Encrypt the file
            const encryptedData = await encryptFile(file, passphrase);
            
            // Create download link
            const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            downloadLink.href = url;
            downloadLink.download = file.name + '.enc';
            
            // Display results
            passphraseInput.value = passphrase;
            encryptResults.style.display = 'block';
            decryptResults.style.display = 'none';
            results.style.display = 'block';
            
        } catch (error) {
            console.error('Encryption failed:', error);
            encryptDropZone.innerHTML = '<p>Encryption failed. Please try again.</p>';
            results.style.display = 'none';
        }
    }
    
    function handleDecryptFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if file has .enc extension
        if (!file.name.endsWith('.enc')) {
            showError('Please select a .enc file for decryption');
            return;
        }
        
        fileToDecrypt = file;
        decryptDropZone.innerHTML = '<p>File ready for decryption: ' + file.name + '</p>';
        results.style.display = 'none';
    }
    
    async function handleDecryption() {
        if (!fileToDecrypt) {
            showError('No file selected for decryption');
            return;
        }
        
        const passphrase = decryptPassphraseInput.value;
        if (!passphrase) {
            showError('Please enter the passphrase');
            return;
        }
        
        try {
            // Show loading state
            decryptButton.textContent = 'Decrypting...';
            decryptButton.disabled = true;
            hideError();
            
            // Decrypt the file
            const decryptedData = await decryptFile(fileToDecrypt, passphrase);
            
            // Create download link
            const originalName = fileToDecrypt.name.replace('.enc', '');
            const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            decryptDownloadLink.href = url;
            decryptDownloadLink.download = originalName;
            
            // Display results
            encryptResults.style.display = 'none';
            decryptResults.style.display = 'block';
            results.style.display = 'block';
            
            // Reset for next operation
            decryptButton.textContent = 'Decrypt File';
            decryptButton.disabled = false;
            
        } catch (error) {
            console.error('Decryption failed:', error);
            showError('Decryption failed: ' + error.message);
            decryptButton.textContent = 'Decrypt File';
            decryptButton.disabled = false;
        }
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
    }
    
    function generateRandomPassphrase(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};:,.<>?';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    async function encryptFile(file, passphrase) {
        // Read file as ArrayBuffer
        const fileBuffer = await readFileAsArrayBuffer(file);
        
        // Generate encryption key from passphrase
        const key = await deriveKeyFromPassphrase(passphrase);
        
        // Encrypt the file data
        const encryptedData = await encryptData(fileBuffer, key);
        
        return encryptedData;
    }
    
    async function decryptFile(encryptedFile, passphrase) {
        // Read encrypted file as ArrayBuffer
        const encryptedBuffer = await readFileAsArrayBuffer(encryptedFile);
        
        // Generate encryption key from passphrase
        const key = await deriveKeyFromPassphrase(passphrase);
        
        // Decrypt the file data
        const decryptedData = await decryptData(encryptedBuffer, key);
        
        return decryptedData;
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
        // Convert passphrase to ArrayBuffer
        const encoder = new TextEncoder();
        const passphraseBuffer = encoder.encode(passphrase);
        
        // Derive key using PBKDF2
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            passphraseBuffer,
            {name: 'PBKDF2'},
            false,
            ['deriveKey']
        );
        
        // Generate salt
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        
        // Derive AES key
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
        
        // Combine IV, salt, and encrypted data
        const result = new Uint8Array(iv.length + keyInfo.salt.length + encryptedData.byteLength);
        result.set(iv, 0);
        result.set(new Uint8Array(keyInfo.salt), iv.length);
        result.set(new Uint8Array(encryptedData), iv.length + keyInfo.salt.length);
        
        return result;
    }
    
    async function decryptData(encryptedData, keyInfo) {
        // Extract IV (first 12 bytes)
        const iv = encryptedData.slice(0, 12);
        
        // Extract salt (next 16 bytes)
        const salt = encryptedData.slice(12, 28);
        
        // Extract actual encrypted content (remaining bytes)
        const actualEncryptedData = encryptedData.slice(28);
        
        // Re-derive the key using the extracted salt
        const encoder = new TextEncoder();
        const passphraseBuffer = encoder.encode(decryptPassphraseInput.value);
        
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
        
        // Decrypt the data
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