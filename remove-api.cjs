const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Remove strings like " (Wikipedia API)" or " (OpenFEC API / DEMO_KEY)" 
            // inside JSX tags
            let newContent = content.replace(/\s*\([a-zA-Z\.\-\s]+API[^\)]*\)/g, '');
            // Some edge cases might just have API text in widget titles if there's no parenthesis
            // Like "US Congress Data (GovTrack API)" -> "US Congress Data"

            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'components'));
processDir(path.join(__dirname, 'app')); // if any
