/* Global notification helper
   - showAppNotice(message, type='info', timeout=4000)
   - Appends a dismissible Bootstrap alert to a floating container and auto-removes it
*/
function ensureNoticeContainer() {
    let c = document.getElementById('app-notice-container');
    if (!c) {
        c = document.createElement('div');
        c.id = 'app-notice-container';
        c.style.position = 'fixed';
        c.style.top = '1rem';
        c.style.right = '1rem';
        c.style.zIndex = 1080;
        c.style.maxWidth = '320px';
        document.body.appendChild(c);
    }
    return c;
}

function showAppNotice(message, type = 'info', timeout = 4000) {
    const container = ensureNoticeContainer();
    const div = document.createElement('div');
    div.className = `alert alert-${type} alert-dismissible fade show`;
    div.role = 'alert';
    div.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    container.appendChild(div);

    if (timeout > 0) {
        setTimeout(() => {
            try { div.classList.remove('show'); div.classList.add('hide'); } catch (e) {}
            setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 350);
        }, timeout);
    }
    return div;
}

// expose globally
window.showAppNotice = showAppNotice;
function requireAuth() {
    const user = JSON.parse(localStorage.getItem("erp_logged_user"));
    if (!user) {
        window.location.href = "login.html";
    }
}
