/**
 * 🔍 findUnsafeMapCalls.js
 * 
 * This utility scans your codebase for potentially unsafe .map() calls
 * and suggests fixes. Run this to find all locations that need wrapping.
 * 
 * Usage in Node.js:
 *   node findUnsafeMapCalls.js
 * 
 * Or import and use:
 *   import { findUnsafeMapCalls } from './findUnsafeMapCalls.js';
 *   const results = findUnsafeMapCalls('./src');
 */

const fs = require('fs');
const path = require('path');

class MapSafetyChecker {
    constructor() {
        this.results = [];
        this.patterns = {
            // Pattern 1: Direct variable.map() without checks
            unsafeDirectMap: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*map\s*\(/g,

            // Pattern 2: Slice without array check
            unsafeSlice: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*slice\s*\(/g,

            // Pattern 3: Filter without array check
            unsafeFilter: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*filter\s*\(/g,
        };
    }

    /**
     * Scan a single file for unsafe map calls
     */
    scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const fileName = path.basename(filePath);

            let hasIssues = false;
            const fileResults = [];

            lines.forEach((line, lineNum) => {
                // Skip comments and certain safe patterns
                if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                    return;
                }

                // Check for unsafe direct .map()
                if (this.patterns.unsafeDirectMap.test(line)) {
                    // But exclude safe patterns
                    if (!this.isSafePattern(line)) {
                        hasIssues = true;
                        fileResults.push({
                            type: 'unsafe_map',
                            line: lineNum + 1,
                            content: line.trim(),
                            suggestion: this.suggestFix(line, 'map'),
                            severity: 'HIGH',
                        });
                    }
                }

                // Check for unsafe .slice()
                if (this.patterns.unsafeSlice.test(line) && !line.includes('??') && !line.includes('||')) {
                    fileResults.push({
                        type: 'unsafe_slice',
                        line: lineNum + 1,
                        content: line.trim(),
                        suggestion: this.suggestFix(line, 'slice'),
                        severity: 'MEDIUM',
                    });
                }

                // Check for unsafe .filter()
                if (this.patterns.unsafeFilter.test(line) && !line.includes('??') && !line.includes('||')) {
                    fileResults.push({
                        type: 'unsafe_filter',
                        line: lineNum + 1,
                        content: line.trim(),
                        suggestion: this.suggestFix(line, 'filter'),
                        severity: 'MEDIUM',
                    });
                }
            });

            if (hasIssues) {
                this.results.push({
                    file: filePath,
                    fileName,
                    issueCount: fileResults.length,
                    issues: fileResults,
                });
            }

            return fileResults;
        } catch (error) {
            console.error(`Error scanning ${filePath}:`, error.message);
            return [];
        }
    }

    /**
     * Check if a line already has safety guards
     */
    isSafePattern(line) {
        // Already has nullish coalescing
        if (line.includes('??') || line.includes('||')) {
            return true;
        }

        // Already wrapped in Array.isArray()
        if (line.includes('Array.isArray')) {
            return true;
        }

        // Already has optional chaining with fallback
        if (line.includes('?.')) {
            return true;
        }

        // Inside a ternary with type check
        if (line.includes('?') && line.includes(':')) {
            return true;
        }

        return false;
    }

    /**
     * Suggest a fix for the unsafe pattern
     */
    suggestFix(line, method) {
        const match = line.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*map\s*\(/);

        if (!match) return 'Unable to suggest fix';

        const varName = match[1];

        if (method === 'map') {
            return `(Array.isArray(${varName}) ? ${varName} : []).map((item, index) => ...)`;
        } else if (method === 'slice') {
            return `(Array.isArray(${varName}) ? ${varName} : []).slice(...)`;
        } else if (method === 'filter') {
            return `(Array.isArray(${varName}) ? ${varName} : []).filter(...)`;
        }

        return `Wrap with (Array.isArray(${varName}) ? ${varName} : [])`;
    }

    /**
     * Recursively scan a directory
     */
    scanDirectory(dirPath) {
        try {
            const files = fs.readdirSync(dirPath);

            files.forEach(file => {
                const fullPath = path.join(dirPath, file);
                const stat = fs.statSync(fullPath);

                // Skip node_modules, .next, etc.
                if (this.shouldSkip(fullPath)) {
                    return;
                }

                if (stat.isDirectory()) {
                    this.scanDirectory(fullPath);
                } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                    this.scanFile(fullPath);
                }
            });
        } catch (error) {
            console.error(`Error scanning directory ${dirPath}:`, error.message);
        }
    }

    /**
     * Check if path should be skipped
     */
    shouldSkip(filePath) {
        const skipDirs = ['node_modules', '.next', '.expo', 'dist', 'build', '__tests__', '.git'];
        return skipDirs.some(dir => filePath.includes(path.sep + dir + path.sep) || filePath.includes(path.sep + dir));
    }

    /**
     * Print results in a nice format
     */
    printResults() {
        if (this.results.length === 0) {
            console.log('\n✅ No unsafe .map() calls found!\n');
            return {
                filesAffected: 0,
                totalIssues: 0,
                results: [],
            };
        }

        console.log('\n' + '='.repeat(80));
        console.log('🔍 MAP SAFETY CHECKER - RESULTS');
        console.log('='.repeat(80) + '\n');

        let totalIssues = 0;

        this.results.forEach(fileResult => {
            console.log(`📄 ${fileResult.fileName} (${fileResult.issueCount} issue${fileResult.issueCount > 1 ? 's' : ''})`);
            console.log(`   Path: ${fileResult.file}\n`);

            fileResult.issues.forEach(issue => {
                console.log(`   Line ${issue.line}: [${issue.severity}] ${issue.type}`);
                console.log(`   ❌ Current: ${issue.content}`);
                console.log(`   ✅ Fix:     ${issue.suggestion}`);
                console.log();
                totalIssues++;
            });
        });

        console.log('='.repeat(80));
        console.log(`⚠️  Total unsafe patterns found: ${totalIssues}`);
        console.log('='.repeat(80) + '\n');

        return {
            filesAffected: this.results.length,
            totalIssues,
            results: this.results,
        };
    }

    /**
     * Export results as JSON
     */
    toJSON() {
        return {
            timestamp: new Date().toISOString(),
            filesScanned: this.results.length,
            totalIssues: this.results.reduce((sum, r) => sum + r.issues.length, 0),
            results: this.results,
        };
    }
}

// ============================================================================
// CLI USAGE
// ============================================================================

if (require.main === module) {
    const checker = new MapSafetyChecker();
    const targetDir = process.argv[2] || './src';

    console.log(`🔍 Scanning ${targetDir} for unsafe .map() calls...\n`);

    checker.scanDirectory(targetDir);
    const summary = checker.printResults();

    // Optionally save to JSON
    if (process.argv.includes('--json')) {
        const jsonOutput = checker.toJSON();
        fs.writeFileSync('map-safety-results.json', JSON.stringify(jsonOutput, null, 2));
        console.log('📊 Results saved to map-safety-results.json\n');
    }

    // Exit with error if issues found
    process.exit(summary.totalIssues > 0 ? 1 : 0);
}

module.exports = { MapSafetyChecker };
