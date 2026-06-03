// Locky MVP - Simple File Encryption
// Using Web Crypto API for client-side encryption

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const results = document.getElementById('results');
    const passphraseInput = document.getElementById('passphrase');
    const downloadLink = document.getElementById('download-link');
    const copyButton = document.getElementById('copy-passphrase');
    
    let encryptedFile = null;
    let encryptionKey = null;
    
    // Set up drag and drop events
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    });
    
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
            dropZone.innerHTML = '<p>Encrypting your file...</p>';
            
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
            results.style.display = 'block';
            
        } catch (error) {
            console.error('Encryption failed:', error);
            dropZone.innerHTML = '<p>Encryption failed. Please try again.</p>';
            results.style.display = 'none';
        }
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
});