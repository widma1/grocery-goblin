// Grocery Goblin - Shopping List App

let items = JSON.parse(localStorage.getItem('goblinItems')) || [];

// Initialize the list on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFromURL();
    renderList();
    document.getElementById('itemInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('shareModal');
        if (e.target === modal) {
            closeShareModal();
        }
    });

    // Close modal with Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeShareModal();
        }
    });
});

function addItem() {
    const input = document.getElementById('itemInput');
    const text = input.value.trim();

    if (text === '') {
        input.placeholder = "The goblin needs SOMETHING to eat!";
        setTimeout(() => {
            input.placeholder = "What does the goblin crave?";
        }, 2000);
        return;
    }

    const item = {
        id: Date.now(),
        text: text,
        completed: false
    };

    items.push(item);
    saveItems();
    renderList();
    input.value = '';
    input.focus();
}

function toggleItem(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.completed = !item.completed;
        saveItems();
        renderList();
    }
}

function deleteItem(id) {
    items = items.filter(i => i.id !== id);
    saveItems();
    renderList();
}

function clearAll() {
    if (items.length === 0) return;

    if (confirm("The goblin will forget everything! Are you sure?")) {
        items = [];
        saveItems();
        renderList();
    }
}

function saveItems() {
    localStorage.setItem('goblinItems', JSON.stringify(items));
}

function renderList() {
    const list = document.getElementById('shoppingList');
    const countEl = document.getElementById('itemCount');

    if (items.length === 0) {
        list.innerHTML = '<li class="empty-message">The goblin\'s belly is empty... Add some items!</li>';
        countEl.textContent = "0 items to hunt";
        return;
    }

    const uncompleted = items.filter(i => !i.completed).length;
    countEl.textContent = `${uncompleted} item${uncompleted !== 1 ? 's' : ''} to hunt`;

    list.innerHTML = items.map(item => `
        <li class="list-item ${item.completed ? 'completed' : ''}">
            <input
                type="checkbox"
                ${item.completed ? 'checked' : ''}
                onchange="toggleItem(${item.id})"
            >
            <span>${escapeHtml(item.text)}</span>
            <button class="delete-btn" onclick="deleteItem(${item.id})">Nom!</button>
        </li>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== SHARING FUNCTIONS ==========

function openShareModal() {
    if (items.length === 0) {
        alert("The goblin has nothing to share! Add some items first.");
        return;
    }

    const modal = document.getElementById('shareModal');
    modal.style.display = 'block';

    // Generate shareable link
    const shareLink = generateShareLink();
    document.getElementById('shareLink').value = shareLink;

    // Generate plain text list
    const plainText = generatePlainText();
    document.getElementById('plainTextList').value = plainText;

    // Clear any previous copy status
    document.getElementById('copyStatus').textContent = '';
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

function generateShareLink() {
    const itemTexts = items.map(i => i.text);
    const encoded = encodeURIComponent(JSON.stringify(itemTexts));
    const baseURL = window.location.href.split('?')[0];
    return `${baseURL}?list=${encoded}`;
}

function generatePlainText() {
    let text = "Grocery Goblin Shopping List:\n";
    text += "===========================\n";
    items.forEach((item, index) => {
        const status = item.completed ? "[x]" : "[ ]";
        text += `${status} ${item.text}\n`;
    });
    text += "\nShared via Grocery Goblin!";
    return text;
}

function copyLink() {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // For mobile

    navigator.clipboard.writeText(linkInput.value).then(() => {
        document.getElementById('copyStatus').textContent = "Link copied! The goblin approves!";
        setTimeout(() => {
            document.getElementById('copyStatus').textContent = '';
        }, 3000);
    }).catch(() => {
        document.execCommand('copy');
        document.getElementById('copyStatus').textContent = "Link copied!";
    });
}

function copyPlainText() {
    const textarea = document.getElementById('plainTextList');
    textarea.select();
    textarea.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(textarea.value).then(() => {
        alert("List copied to clipboard!");
    }).catch(() => {
        document.execCommand('copy');
        alert("List copied!");
    });
}

function shareViaSMS() {
    const plainText = generatePlainText();
    const smsBody = encodeURIComponent(plainText);

    // Use sms: protocol - works on mobile devices
    window.location.href = `sms:?body=${smsBody}`;
}

function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const listParam = urlParams.get('list');

    if (listParam) {
        try {
            const sharedItems = JSON.parse(decodeURIComponent(listParam));

            if (Array.isArray(sharedItems) && sharedItems.length > 0) {
                const shouldImport = confirm(
                    `A goblin sent you ${sharedItems.length} item(s)!\n\n` +
                    `Items: ${sharedItems.slice(0, 3).join(', ')}${sharedItems.length > 3 ? '...' : ''}\n\n` +
                    `Add to your list?`
                );

                if (shouldImport) {
                    sharedItems.forEach(text => {
                        if (typeof text === 'string' && text.trim()) {
                            items.push({
                                id: Date.now() + Math.random(),
                                text: text.trim(),
                                completed: false
                            });
                        }
                    });
                    saveItems();
                }

                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (e) {
            console.error('Failed to parse shared list:', e);
        }
    }
}
