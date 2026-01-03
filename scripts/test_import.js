const fs = require('fs');
const path = require('path');

function btoa(str) {
    return Buffer.from(String(str)).toString('base64');
}

function mapEntry(d) {
    return {
        id: d.id ?? Date.now() + Math.floor(Math.random() * 1000),
        name: d.prenom ? `${d.prenom} ${d.nom}` : (d.nom || d.username || ''),
        email: (d.email || '').toLowerCase(),
        password: d.password ? btoa(d.password) : (d.password_hash ? d.password_hash : btoa('Password123!')),
        role: d.role || 'utilisateur',
        created: d.date_creation || new Date().toISOString()
    };
}

try {
    const dataPath = path.join(__dirname, '..', 'utilisateurs.json');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('utilisateurs.json n\'est pas un tableau');

    const mapped = data.map(mapEntry);

    console.log(`Read ${data.length} entries from utilisateurs.json`);
    console.log(`Mapped to ${mapped.length} accounts`);
    console.log('Sample:');
    console.log(mapped.slice(0, 5).map(a => ({email: a.email, name: a.name, password_sample: a.password.slice(0,6)+ '...' }))); 

    // Quick checks
    const emails = mapped.map(m => m.email);
    const uniq = new Set(emails);
    console.log(`Unique emails: ${uniq.size}`);
    if (uniq.size !== mapped.length) console.warn('Warning: duplicate emails detected');

    // Check password hashing pattern (base64)
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    const pwIssues = mapped.filter(m => !base64Pattern.test(m.password));
    console.log(`Passwords that look base64: ${mapped.length - pwIssues.length}/${mapped.length}`);

    process.exit(0);
} catch (err) {
    console.error('Test failed:', err.message);
    process.exit(2);
}